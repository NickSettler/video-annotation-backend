import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDTO } from '../users/users.dto';
import { E_USER_ENTITY_KEYS } from '../db/entities/user.entity';

export class SignUpDTO extends OmitType(CreateUserDTO, [
  E_USER_ENTITY_KEYS.ROLES,
]) {}
