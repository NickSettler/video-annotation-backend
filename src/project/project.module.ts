import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from '../casl/casl.module';
import { ProjectService } from './project.service';
import { Project } from '../db/entities/project.entity';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), VideoModule, CaslModule],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
