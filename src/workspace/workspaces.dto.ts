import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';
import { E_WORKSPACE_ENTITY_KEYS } from '../db/entities/workspace.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateWorkspaceDTO {
  @IsNotEmpty()
  @IsString()
  [E_WORKSPACE_ENTITY_KEYS.NAME]: string;

  @IsEmpty()
  [E_WORKSPACE_ENTITY_KEYS.CREATED_BY]: string;
}

export class UpdateWorkspaceDTO extends PartialType(CreateWorkspaceDTO) {}
