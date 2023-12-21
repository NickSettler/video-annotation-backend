import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_DB_TABLES } from '../constants';
import { User } from './user.entity';

export enum E_WORKSPACE_ENTITY_KEYS {
  ID = 'id',
  NAME = 'name',
  CREATED_BY = 'created_by',
  CREATED_AT = 'created_at',
}

@Entity({
  name: E_DB_TABLES.WORKSPACES,
})
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  [E_WORKSPACE_ENTITY_KEYS.ID]: string;

  @Column()
  [E_WORKSPACE_ENTITY_KEYS.NAME]: string;

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: E_WORKSPACE_ENTITY_KEYS.CREATED_BY })
  [E_WORKSPACE_ENTITY_KEYS.CREATED_BY]: User;

  @CreateDateColumn()
  [E_WORKSPACE_ENTITY_KEYS.CREATED_AT]: Date;
}
