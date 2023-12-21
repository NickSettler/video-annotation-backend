import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  E_WORKSPACE_ENTITY_KEYS,
  Workspace,
} from '../db/entities/workspace.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateWorkspaceDTO } from './workspaces.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  public async findAll(
    options?: FindManyOptions<Workspace>,
  ): Promise<Array<Workspace>> {
    return this.workspaceRepository.find({
      ...options,
    });
  }

  public async findOne(
    options?: FindOneOptions<Workspace>,
  ): Promise<Workspace> {
    return this.workspaceRepository.findOne({
      ...options,
    });
  }

  public async create(createDTO: CreateWorkspaceDTO): Promise<Workspace> {
    const course = this.workspaceRepository.create({
      ...createDTO,
      [E_WORKSPACE_ENTITY_KEYS.CREATED_BY]: {
        [E_WORKSPACE_ENTITY_KEYS.ID]:
          createDTO[E_WORKSPACE_ENTITY_KEYS.CREATED_BY],
      },
    });

    return await this.workspaceRepository.save(course);
  }
}
