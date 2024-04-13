import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from '../casl/casl.module';
import { Video } from '../db/entities/video.entity';
import { Poster } from '../db/entities/poster.entity';
import { PosterModule } from '../poster/poster.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, Poster]),
    PosterModule,
    CaslModule,
  ],
  providers: [VideoService],
  controllers: [VideoController],
  exports: [VideoService],
})
export class VideoModule {}
