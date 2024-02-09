import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_DB_TABLES } from '../constants';
import { E_WORKSPACE_ENTITY_KEYS } from './workspace.entity';
import { User } from './user.entity';

export enum E_VIDEO_ENTITY_KEYS {
  ID = 'id',
  FILENAME = 'filename',
  WIDTH = 'width',
  HEIGHT = 'height',
  FPS = 'fps',
  BITRATE = 'bitrate',
  CODEC = 'codec',
  ASPECT_X = 'aspect_x',
  ASPECT_Y = 'aspect_y',
  CREATED_BY = 'created_by',
  CREATED_AT = 'created_at',
}

@Entity({
  name: E_DB_TABLES.VIDEO,
})
export class Video {
  @PrimaryGeneratedColumn('uuid')
  [E_VIDEO_ENTITY_KEYS.ID]: string;

  @Column()
  [E_VIDEO_ENTITY_KEYS.FILENAME]: string;

  @Column({ type: 'int' })
  [E_VIDEO_ENTITY_KEYS.WIDTH]: number;

  @Column({ type: 'int' })
  [E_VIDEO_ENTITY_KEYS.HEIGHT]: number;

  @Column({ type: 'float' })
  [E_VIDEO_ENTITY_KEYS.FPS]: number;

  @Column({ type: 'int' })
  [E_VIDEO_ENTITY_KEYS.BITRATE]: number;

  @Column()
  [E_VIDEO_ENTITY_KEYS.CODEC]: string;

  @Column({ type: 'int' })
  [E_VIDEO_ENTITY_KEYS.ASPECT_X]: number;

  @Column({ type: 'int' })
  [E_VIDEO_ENTITY_KEYS.ASPECT_Y]: number;

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: E_WORKSPACE_ENTITY_KEYS.CREATED_BY })
  [E_VIDEO_ENTITY_KEYS.CREATED_BY]: User;

  @CreateDateColumn()
  [E_VIDEO_ENTITY_KEYS.CREATED_AT]: Date;
}
