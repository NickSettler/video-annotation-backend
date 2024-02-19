import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Poster } from '../db/entities/poster.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PosterService {
  constructor(
    @InjectRepository(Poster)
    private readonly postersRepository: Repository<Poster>,
  ) {}

  public async findAll(
    options?: FindManyOptions<Poster>,
  ): Promise<Array<Poster>> {
    return this.postersRepository.find({
      ...options,
    });
  }

  public async findOne(
    options: FindOneOptions<Poster>,
  ): Promise<Poster | null> {
    return this.postersRepository.findOne({
      ...options,
    });
  }
}
