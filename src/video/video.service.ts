import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { E_VIDEO_ENTITY_KEYS, Video } from '../db/entities/video.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import * as fs from 'fs';
import { getVideoMetadata } from '../utils/video/metadata';
import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import { createDirectory } from '../utils/fs/create-directory';
import { moveFile } from '../utils/fs/move';
import { getVideoPosters } from '../utils/video/poster';
import { CreateVideoDTO } from './video.dto';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { E_POSTER_ENTITY_KEYS, Poster } from '../db/entities/poster.entity';

const uploadsFolder = process.env.UPLOADS_LOCATION || '/uploads';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  public async findAll(
    options?: FindManyOptions<Video>,
  ): Promise<Array<Video>> {
    return this.videoRepository.find({
      ...options,
    });
  }

  public async findOne(options: FindOneOptions<Video>): Promise<Video | null> {
    return this.videoRepository.findOne({
      ...options,
    });
  }

  public async create(
    user: User,
    path: string,
    createDTO: CreateVideoDTO,
  ): Promise<Video> {
    const exists = fs.existsSync(path);

    if (!exists) throw new InternalServerErrorException('File does not exist');

    const queryRunner =
      this.videoRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const video = queryRunner.manager.create(Video, {
        [E_VIDEO_ENTITY_KEYS.NAME]: createDTO[E_VIDEO_ENTITY_KEYS.NAME],
        [E_VIDEO_ENTITY_KEYS.CREATED_BY]: {
          [E_USER_ENTITY_KEYS.ID]: user[E_USER_ENTITY_KEYS.ID],
        },
      });

      const databaseVideo = await queryRunner.manager.save(video);

      const newFolder = `${uploadsFolder}/${user[E_USER_ENTITY_KEYS.ID]}/${video[E_VIDEO_ENTITY_KEYS.ID]}`;
      const newPath = `${newFolder}/video.mp4`;

      await createDirectory(newFolder);
      await moveFile(path, newPath);

      const posters = await getVideoPosters(newPath);

      const postersEntities: Array<DeepPartial<Poster>> =
        queryRunner.manager.create(
          Poster,
          posters.map((poster, index) => ({
            [E_POSTER_ENTITY_KEYS.VIDEO_ID]:
              databaseVideo[E_VIDEO_ENTITY_KEYS.ID],
            [E_POSTER_ENTITY_KEYS.ORDER]: index,
            [E_POSTER_ENTITY_KEYS.FILENAME]: poster,
          })),
        );

      await queryRunner.manager.save(postersEntities).catch(() => {
        throw new InternalServerErrorException(
          'Could not save posters. Video was created.',
        );
      });

      const defaultPoster = await queryRunner.manager.findOne(Poster, {
        where: {
          [E_POSTER_ENTITY_KEYS.VIDEO_ID]:
            databaseVideo[E_VIDEO_ENTITY_KEYS.ID],
          [E_POSTER_ENTITY_KEYS.ORDER]: 0,
        },
      });

      const metadata = await getVideoMetadata(newPath);

      await queryRunner.manager.update(
        Video,
        databaseVideo[E_VIDEO_ENTITY_KEYS.ID],
        {
          [E_VIDEO_ENTITY_KEYS.FILENAME]: newPath,
          [E_VIDEO_ENTITY_KEYS.POSTER_ID]:
            defaultPoster[E_POSTER_ENTITY_KEYS.ID],
          [E_VIDEO_ENTITY_KEYS.WIDTH]: metadata.resolution.w,
          [E_VIDEO_ENTITY_KEYS.HEIGHT]: metadata.resolution.h,
          [E_VIDEO_ENTITY_KEYS.FPS]: metadata.fps,
          [E_VIDEO_ENTITY_KEYS.BITRATE]: metadata.bitrate,
          [E_VIDEO_ENTITY_KEYS.CODEC]: metadata.codec,
          [E_VIDEO_ENTITY_KEYS.ASPECT_X]: metadata.aspect.x,
          [E_VIDEO_ENTITY_KEYS.ASPECT_Y]: metadata.aspect.y,
        },
      );

      await queryRunner.commitTransaction();

      return await queryRunner.manager.findOne(Video, {
        where: {
          [E_VIDEO_ENTITY_KEYS.ID]: databaseVideo[E_VIDEO_ENTITY_KEYS.ID],
        },
      });
    } catch (e) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException('Could not create video');
    } finally {
      await queryRunner.release();
    }
  }

  public async setVideoPoster(
    videoID: Video[E_VIDEO_ENTITY_KEYS.ID],
    posterID: Poster[E_POSTER_ENTITY_KEYS.ID],
  ): Promise<Video> {
    await this.videoRepository.update(videoID, {
      [E_VIDEO_ENTITY_KEYS.POSTER_ID]: posterID,
    });

    return this.videoRepository.findOne({
      where: {
        [E_VIDEO_ENTITY_KEYS.ID]: videoID,
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.videoRepository.delete({
      [E_VIDEO_ENTITY_KEYS.ID]: id,
    });
  }
}
