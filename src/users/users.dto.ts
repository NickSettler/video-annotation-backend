import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { E_USER_ENTITY_KEYS } from '../db/entities/user.entity';
import { PartialType } from '@nestjs/mapped-types';
import { E_ROLE } from '../db/entities/role.entity';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  [E_USER_ENTITY_KEYS.EMAIL]: string;

  @IsNotEmpty()
  @IsString()
  [E_USER_ENTITY_KEYS.USERNAME]: string;

  @IsNotEmpty()
  @MinLength(6)
  [E_USER_ENTITY_KEYS.PASSWORD]: string;

  @IsNotEmpty()
  @IsEnum(E_ROLE, {
    each: true,
  })
  @IsOptional()
  [E_USER_ENTITY_KEYS.ROLES]?: Array<E_ROLE>;
}

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}
