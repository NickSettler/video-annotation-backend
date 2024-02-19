import { Module } from '@nestjs/common';
import { PosterService } from './poster.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poster } from '../db/entities/poster.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poster])],
  providers: [PosterService],
  exports: [PosterService],
})
export class PosterModule {}
