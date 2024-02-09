import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { CreateWorkspaceDTO } from './workspace.dto';
import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import {
  E_WORKSPACE_ENTITY_KEYS,
  Workspace,
} from '../db/entities/workspace.entity';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { E_ACTION } from '../casl/actions';
import { filter } from 'lodash';

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly workspacesService: WorkspaceService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  public async findAll(@Req() request: Request) {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Workspace)) {
      return [];
    }

    return filter(await this.workspacesService.findAll(), (workspace) =>
      rules.can(E_ACTION.READ, workspace),
    );
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  public async findByID(@Req() request: Request, @Param('id') id: string) {
    const rules = this.caslAbilityFactory.createForUser(request.user as User);

    if (!rules.can(E_ACTION.READ, Workspace)) {
      throw new ForbiddenException('You are not allowed to read workspaces');
    }

    const workspace = await this.workspacesService.findOne({
      where: {
        [E_WORKSPACE_ENTITY_KEYS.ID]: id,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (!rules.can(E_ACTION.READ, workspace)) {
      throw new ForbiddenException(
        'You are not allowed to read this workspace',
      );
    }

    return workspace;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  public async create(
    @Req() request: Request,
    @Body() createDTO: CreateWorkspaceDTO,
  ) {
    const user = request.user as User;

    const rules = this.caslAbilityFactory.createForUser(user);

    if (!rules.can(E_ACTION.CREATE, Workspace)) {
      throw new ForbiddenException('You are not allowed to create workspaces');
    }

    await this.workspacesService.create({
      ...createDTO,
      [E_WORKSPACE_ENTITY_KEYS.CREATED_BY]: user[E_USER_ENTITY_KEYS.ID],
    });

    const createdWorkspace = await this.workspacesService.findOne({
      where: {
        [E_WORKSPACE_ENTITY_KEYS.NAME]: createDTO[E_WORKSPACE_ENTITY_KEYS.NAME],
      },
    });

    if (!createdWorkspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (!rules.can(E_ACTION.READ, createdWorkspace)) {
      throw new ForbiddenException(
        'You are not allowed to read this workspace',
      );
    }

    return createdWorkspace;
  }
}
