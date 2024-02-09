import {
  Controller,
  Delete,
  FileTypeValidator,
  ForbiddenException,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { E_ACTION } from '../casl/actions';
import { E_VIDEO_ENTITY_KEYS, Video } from '../db/entities/video.entity';
import { filter } from 'lodash';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '../db/entities/user.entity';

@Controller('videos')
export class VideoController {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly videoService: VideoService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getVideos(@Req() request: Request): Promise<Array<Video>> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Video)) return [];

    return filter(await this.videoService.findAll(), (workspace) =>
      rules.can(E_ACTION.READ, workspace),
    );
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      dest: './tmp',
    }),
  )
  @UseGuards(JwtAuthGuard)
  public async createVideo(
    @Req() request: Request,
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

    const video = await this.videoService.create(user, file.path);

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
