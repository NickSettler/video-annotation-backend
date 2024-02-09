import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { E_VIDEO_ENTITY_KEYS, Video } from '../db/entities/video.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import * as fs from 'fs';
import { getVideoMetadata } from '../utils/video/metadata';
import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import { createDirectory } from '../utils/fs/create-directory';
import { moveFile } from '../utils/fs/move';

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

  public async findOne(options: FindOneOptions<Video>): Promise<Video> {
    return this.videoRepository.findOne({
      ...options,
    });
  }

  public async create(user: User, path: string): Promise<Video> {
    const exists = fs.existsSync(path);

    if (!exists) throw new InternalServerErrorException('File does not exist');

    const metadata = await getVideoMetadata(path);

    const newFolder = `/uploads/${user[E_USER_ENTITY_KEYS.ID]}`;

    const video = this.videoRepository.create({
      [E_VIDEO_ENTITY_KEYS.FILENAME]: `uploads/${user[E_USER_ENTITY_KEYS.ID]}.mp4`,
      [E_VIDEO_ENTITY_KEYS.WIDTH]: metadata.resolution.w,
      [E_VIDEO_ENTITY_KEYS.HEIGHT]: metadata.resolution.h,
      [E_VIDEO_ENTITY_KEYS.FPS]: metadata.fps,
      [E_VIDEO_ENTITY_KEYS.BITRATE]: metadata.bitrate,
      [E_VIDEO_ENTITY_KEYS.CODEC]: metadata.codec,
      [E_VIDEO_ENTITY_KEYS.ASPECT_X]: metadata.aspect.x,
      [E_VIDEO_ENTITY_KEYS.ASPECT_Y]: metadata.aspect.y,
      [E_VIDEO_ENTITY_KEYS.CREATED_BY]: {
        [E_USER_ENTITY_KEYS.ID]: user[E_USER_ENTITY_KEYS.ID],
      },
    });

    const databaseVideo = await this.videoRepository.save(video);

    const newPath = `${newFolder}/${video[E_VIDEO_ENTITY_KEYS.ID]}.mp4`;

    await createDirectory(newFolder);
    await moveFile(path, newPath);

    await this.videoRepository.update(
      { [E_VIDEO_ENTITY_KEYS.ID]: databaseVideo[E_VIDEO_ENTITY_KEYS.ID] },
      { [E_VIDEO_ENTITY_KEYS.FILENAME]: newPath },
    );

    return databaseVideo;
  }

  public async delete(id: string): Promise<void> {
    await this.videoRepository.delete({
      [E_VIDEO_ENTITY_KEYS.ID]: id,
    });
  }
}
