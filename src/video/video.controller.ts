import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { E_ACTION } from '../casl/actions';
import { E_VIDEO_ENTITY_KEYS, Video } from '../db/entities/video.entity';
import { filter, map } from 'lodash';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '../db/entities/user.entity';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { CreateVideoDTO } from './video.dto';
import { createReadStream, stat } from 'fs';
import { lookup } from 'mime-types';
import { E_POSTER_ENTITY_KEYS, Poster } from '../db/entities/poster.entity';
import { plainToInstance } from 'class-transformer';
import { PosterService } from '../poster/poster.service';

@Controller('videos')
export class VideoController {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly videoService: VideoService,
    private readonly posterService: PosterService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getVideos(@Req() request: Request): Promise<Array<Video>> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Video)) return [];

    return filter(
      await this.videoService.findAll({
        relations: [`${E_VIDEO_ENTITY_KEYS.PROJECTS}`],
      }),
      (workspace) => rules.can(E_ACTION.READ, workspace),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getVideo(
    @Req() request: Request,
    @Param('id') id: string,
  ): Promise<Video> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Video))
      throw new ForbiddenException('You are not allowed to read videos');

    const video = await this.videoService.findOne({
      where: {
        [E_VIDEO_ENTITY_KEYS.ID]: id,
      },
    });

    if (!rules.can(E_ACTION.READ, video))
      throw new ForbiddenException('You are not allowed to read this video');

    return video;
  }

  @Get(':id/file')
  @UseGuards(JwtAuthGuard)
  public async getVideoFile(
    @Req() request: Request,
    @Res({ passthrough: false }) response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Video))
      throw new ForbiddenException('You are not allowed to read videos');

    const video = await this.videoService.findOne({
      where: {
        [E_VIDEO_ENTITY_KEYS.ID]: id,
      },
    });

    if (!rules.can(E_ACTION.READ, video))
      throw new ForbiddenException('You are not allowed to read this video');

    const path = video[E_VIDEO_ENTITY_KEYS.FILENAME];
    const ext = path.split('.').pop();
    const filename = `${video[E_VIDEO_ENTITY_KEYS.NAME]}.${video[E_VIDEO_ENTITY_KEYS.ID]}.${ext}`;
    const mimetype = lookup(path) || 'video/mp4';

    stat(video[E_VIDEO_ENTITY_KEYS.FILENAME], (_, data) => {
      if (request.headers['range']) {
        const range = request.headers['range'];
        const array = range.replace('bytes=', '').split('-');
        const start = parseInt(array[0], 10);
        const end = array[1] ? parseInt(array[1], 10) : data.size - 1;
        const chunk = 1024 * 1000;
        response.writeHead(206, {
          'Accept-Ranges': 'bytes',
          'Content-Range': 'bytes ' + start + '-' + end + '/' + data.size,
          'Content-Length': chunk,
          'Content-Type': mimetype,
          'Cache-Control': 'no-cache',
          'Content-Disposition': `attachment; filename=${filename}`,
        });

        const readable = createReadStream(video[E_VIDEO_ENTITY_KEYS.FILENAME], {
          start,
          end,
        });

        if (readable == null) {
          return response.end();
        } else {
          readable.on('open', () => {
            readable.pipe(response);
          });
          readable.on('error', (err) => {
            response.end(err);
          });
        }
      }
    });
  }

  @Get(':id/posters')
  @UseGuards(JwtAuthGuard)
  public async getVideoPosters(
    @Req() request: Request,
    @Param('id') id: string,
  ): Promise<Array<string>> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Video))
      throw new ForbiddenException('You are not allowed to read videos');

    const video = await this.videoService.findOne({
      where: {
        [E_VIDEO_ENTITY_KEYS.ID]: id,
      },
      relations: [
        `${E_VIDEO_ENTITY_KEYS.POSTERS}.${E_POSTER_ENTITY_KEYS.VIDEO}.${E_VIDEO_ENTITY_KEYS.CREATED_BY}`,
      ],
    });

    if (!rules.can(E_ACTION.READ, video))
      throw new ForbiddenException('You are not allowed to read this video');

    return map(
      filter(video[E_VIDEO_ENTITY_KEYS.POSTERS], (poster) =>
        rules.can(E_ACTION.READ, plainToInstance(Poster, poster)),
      ),
      (poster) => poster[E_POSTER_ENTITY_KEYS.ID],
    );
  }

  @Get(':id/posters/:posterID')
  @UseGuards(JwtAuthGuard)
  public async getVideoPoster(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param('id') id: string,
    @Param('posterID') posterID: string,
  ): Promise<StreamableFile> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Poster))
      throw new ForbiddenException('You are not allowed to read posters');

    const poster = await this.posterService.findOne({
      where: {
        [E_POSTER_ENTITY_KEYS.ID]: posterID,
        [E_POSTER_ENTITY_KEYS.VIDEO_ID]: id,
      },
      relations: [
        `${E_POSTER_ENTITY_KEYS.VIDEO}.${E_VIDEO_ENTITY_KEYS.CREATED_BY}`,
      ],
    });

    if (!rules.can(E_ACTION.READ, poster))
      throw new ForbiddenException('This poster does not exist');

    const path = poster[E_POSTER_ENTITY_KEYS.FILENAME];
    const ext = path.split('.').pop();
    const filename = `${poster[E_POSTER_ENTITY_KEYS.VIDEO_ID]}.${poster[E_POSTER_ENTITY_KEYS.ID]}.${ext}`;
    const mimetype = lookup(path) || 'video/mp4';
    const file = createReadStream(poster[E_POSTER_ENTITY_KEYS.FILENAME]);

    response.setHeader('Content-Type', mimetype);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=${filename}`,
    );

    return new StreamableFile(file);
  }

  @Post(':id/posters/:posterID')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async setVideoPoster(
    @Req() request: Request,
    @Param('id') id: string,
    @Param('posterID') posterID: string,
  ): Promise<Video> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.UPDATE, Video))
      throw new ForbiddenException('You are not allowed to update videos');

    const poster = await this.posterService.findOne({
      where: {
        [E_POSTER_ENTITY_KEYS.ID]: posterID,
        [E_POSTER_ENTITY_KEYS.VIDEO_ID]: id,
      },
      relations: [
        `${E_POSTER_ENTITY_KEYS.VIDEO}.${E_VIDEO_ENTITY_KEYS.CREATED_BY}`,
      ],
    });

    if (!poster || !rules.can(E_ACTION.READ, poster))
      throw new ForbiddenException('Poster does not exist');

    await this.videoService.setVideoPoster(id, posterID);

    const foundVideo = await this.videoService.findOne({
      where: {
        [E_VIDEO_ENTITY_KEYS.ID]: id,
      },
    });

    if (!rules.can(E_ACTION.READ, foundVideo))
      throw new ForbiddenException('You are not allowed to read this video');

    return foundVideo;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      dest: './tmp',
    }),
  )
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  public async createVideo(
    @Req() request: Request,
    @Body() createDTO: CreateVideoDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'video/mp4' })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<Video> {
    const user = request.user as User;
    const rules = this.caslAbilityFactory.createForUser(user);

    if (!rules.can(E_ACTION.CREATE, Video))
      throw new ForbiddenException('You are not allowed to create videos');

    const video = await this.videoService.create(user, file.path, createDTO);

    if (!rules.can(E_ACTION.READ, Video))
      throw new ForbiddenException('You are not allowed to read videos');

    const foundVideo = await this.videoService.findOne({
      where: {
        [E_VIDEO_ENTITY_KEYS.ID]: video[E_VIDEO_ENTITY_KEYS.ID],
      },
    });

    if (!rules.can(E_ACTION.READ, foundVideo))
      throw new ForbiddenException('You are not allowed to read this video');

    return foundVideo;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  public async deleteVideo(
    @Req() request: Request,
    @Param('id') id: string,
  ): Promise<void> {
    const user = request.user as User;
    const rules = this.caslAbilityFactory.createForUser(user);

    if (!rules.can(E_ACTION.DELETE, Video))
      throw new ForbiddenException('You are not allowed to delete videos');

    const video = await this.videoService.findOne({
      where: {
        [E_VIDEO_ENTITY_KEYS.ID]: id,
      },
    });

    if (!rules.can(E_ACTION.DELETE, video))
      throw new ForbiddenException('You are not allowed to delete this video');

    await this.videoService.delete(video[E_VIDEO_ENTITY_KEYS.ID]);
  }
}
