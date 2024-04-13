import { Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { E_PROJECT_ENTITY_KEYS, Project } from '../db/entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import { CreateProjectDTO, UpdateProjectDTO } from './project.dto';
import { assign } from 'lodash';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  public async findAll(
    options?: FindManyOptions<Project>,
  ): Promise<Array<Project>> {
    return this.projectsRepository.find({
      ...options,
    });
  }

  public async findOne(
    options: FindOneOptions<Project>,
  ): Promise<Project | null> {
    return this.projectsRepository.findOne({
      ...options,
    });
  }

  public async create(
    user: User,
    createDTO: CreateProjectDTO,
  ): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createDTO,
      [E_PROJECT_ENTITY_KEYS.CREATED_BY]: {
        [E_USER_ENTITY_KEYS.ID]: user[E_USER_ENTITY_KEYS.ID],
      },
    });

    return await this.projectsRepository.save(project);
  }

  public async update(
    id: string,
    updateDTO: UpdateProjectDTO,
  ): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { [E_PROJECT_ENTITY_KEYS.ID]: id },
    });

    if (!project) throw new NotFoundException('Project does not exist');

    assign(project, updateDTO);

    return await this.projectsRepository.save({
      ...project,
      ...(updateDTO[E_PROJECT_ENTITY_KEYS.VIDEO_ID] && {
        [E_PROJECT_ENTITY_KEYS.VIDEO]: {
          [E_PROJECT_ENTITY_KEYS.ID]: updateDTO[E_PROJECT_ENTITY_KEYS.VIDEO_ID],
        },
      }),
    });
  }

  public async delete(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}
