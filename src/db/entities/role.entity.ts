import { Entity, PrimaryColumn } from 'typeorm';
import { E_DB_TABLES } from '../constants';

export enum E_ROLE_ENTITY_KEYS {
  NAME = 'name',
}

export enum E_ROLE {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity({ name: E_DB_TABLES.ROLES })
export class Role {
  @PrimaryColumn()
  [E_ROLE_ENTITY_KEYS.NAME]: E_ROLE;
}
