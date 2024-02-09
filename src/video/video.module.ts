import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from '../casl/casl.module';
import { Video } from '../db/entities/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), CaslModule],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {}
