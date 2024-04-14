import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { E_PROJECT_ENTITY_KEYS, Project } from '../db/entities/project.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProjectDTO {
  @IsNotEmpty()
  @IsString()
  [E_PROJECT_ENTITY_KEYS.NAME]: Project[E_PROJECT_ENTITY_KEYS.NAME];

  @IsNotEmpty()
  @IsUUID()
  [E_PROJECT_ENTITY_KEYS.VIDEO_ID]: Project[E_PROJECT_ENTITY_KEYS.VIDEO_ID];
}

export class UpdateProjectDTO extends PartialType(CreateProjectDTO) {}

export class UpdateProjectAnnotationsDTO {
  @IsNotEmpty()
  @IsArray()
  [E_PROJECT_ENTITY_KEYS.ANNOTATIONS]: Project[E_PROJECT_ENTITY_KEYS.ANNOTATIONS];
}
