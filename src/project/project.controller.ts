import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../db/entities/user.entity';
import { E_ACTION } from '../casl/actions';
import { filter } from 'lodash';
import { ProjectService } from './project.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { E_PROJECT_ENTITY_KEYS, Project } from '../db/entities/project.entity';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import {
  CreateProjectDTO,
  UpdateProjectAnnotationsDTO,
  UpdateProjectDTO,
} from './project.dto';
import { VideoService } from '../video/video.service';
import { E_VIDEO_ENTITY_KEYS } from '../db/entities/video.entity';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectsService: ProjectService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly videosService: VideoService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getProjects(@Req() request: Request): Promise<Array<Project>> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Project)) return [];

    return filter(await this.projectsService.findAll(), (project) =>
      rules.can(E_ACTION.READ, project),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getProject(
    @Req() request: Request,
    @Param('id') id: string,
  ): Promise<Project> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Project))
      throw new ForbiddenException('You are not allowed to read projects');

    const project = await this.projectsService.findOne({
      where: {
        [E_PROJECT_ENTITY_KEYS.ID]: id,
      },
    });

    if (!rules.can(E_ACTION.READ, project))
      throw new ForbiddenException('You are not allowed to read this project');

    return project;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  public async createProject(
    @Req() request: Request,
    @Body() createDTO: CreateProjectDTO,
  ): Promise<Project> {
    const user = request.user as User;
    const rules = this.caslAbilityFactory.createForUser(user);

    if (!rules.can(E_ACTION.CREATE, Project))
      throw new ForbiddenException('You are not allowed to create projects');

    const video = await this.videosService.findOne({
      where: {
        [E_VIDEO_ENTITY_KEYS.ID]: createDTO[E_PROJECT_ENTITY_KEYS.VIDEO_ID],
      },
    });

    if (!video) throw new NotFoundException('Video not found');

    const project = await this.projectsService.create(user, createDTO);

    if (!rules.can(E_ACTION.READ, Project))
      throw new ForbiddenException('You are not allowed to read projects');

    const foundProject = await this.projectsService.findOne({
      where: {
        [E_PROJECT_ENTITY_KEYS.ID]: project[E_PROJECT_ENTITY_KEYS.ID],
      },
    });

    if (!rules.can(E_ACTION.READ, foundProject))
      throw new ForbiddenException('You are not allowed to read this project');

    return foundProject;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  public async updateProject(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updateDTO: UpdateProjectDTO,
  ): Promise<Project> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.UPDATE, Project))
      throw new ForbiddenException('You are not allowed to update projects');

    const project = await this.projectsService.findOne({
      where: {
        [E_PROJECT_ENTITY_KEYS.ID]: id,
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (updateDTO[E_PROJECT_ENTITY_KEYS.VIDEO_ID]) {
      const video = await this.videosService.findOne({
        where: {
          [E_VIDEO_ENTITY_KEYS.ID]: updateDTO[E_PROJECT_ENTITY_KEYS.VIDEO_ID],
        },
      });

      if (!video) throw new NotFoundException('Video not found');
    }

    if (!rules.can(E_ACTION.UPDATE, project))
      throw new ForbiddenException(
        'You are not allowed to update this project',
      );

    await this.projectsService.update(id, updateDTO);

    const updatedProject = await this.projectsService.findOne({
      where: {
        [E_PROJECT_ENTITY_KEYS.ID]: id,
      },
    });

    if (!rules.can(E_ACTION.READ, updatedProject))
      throw new ForbiddenException('You are not allowed to read this project');

    return updatedProject;
  }

  @Post(':id/annotations')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  public async updateProjectAnnotations(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updateDTO: UpdateProjectAnnotationsDTO,
  ): Promise<Project> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.UPDATE, Project))
      throw new ForbiddenException('You are not allowed to update projects');

    const project = await this.projectsService.findOne({
      where: {
        [E_PROJECT_ENTITY_KEYS.ID]: id,
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (!rules.can(E_ACTION.UPDATE, project))
      throw new ForbiddenException(
        'You are not allowed to update this project',
      );

    await this.projectsService.update(id, updateDTO);

    const updatedProject = await this.projectsService.findOne({
      where: {
        [E_PROJECT_ENTITY_KEYS.ID]: id,
      },
    });

    if (!rules.can(E_ACTION.READ, updatedProject))
      throw new ForbiddenException('You are not allowed to read this project');

    return updatedProject;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  public async deleteProject(
    @Req() request: Request,
    @Param('id') id: string,
  ): Promise<void> {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.DELETE, Project))
      throw new ForbiddenException('You are not allowed to delete projects');

    const project = await this.projectsService.findOne({
      where: {
        [E_PROJECT_ENTITY_KEYS.ID]: id,
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (!rules.can(E_ACTION.DELETE, project))
      throw new ForbiddenException(
        'You are not allowed to delete this project',
      );

    await this.projectsService.delete(id);
  }
}
