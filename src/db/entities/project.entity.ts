import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_DB_TABLES } from '../constants';
import { E_VIDEO_ENTITY_KEYS, Video } from './video.entity';
import { User } from './user.entity';

export enum E_PROJECT_ENTITY_KEYS {
  ID = 'id',
  NAME = 'name',
  VIDEO_ID = 'video_id',
  VIDEO = 'video',
  ANNOTATIONS = 'annotations',
  CREATED_BY = 'created_by',
  CREATED_AT = 'created_at',
}

@Entity({
  name: E_DB_TABLES.PROJECTS,
})
export class Project {
  @PrimaryGeneratedColumn('uuid')
  [E_PROJECT_ENTITY_KEYS.ID]: string;

  @Column({
    type: 'varchar',
  })
  [E_PROJECT_ENTITY_KEYS.NAME]: string;

  @Column({
    type: 'uuid',
  })
  [E_PROJECT_ENTITY_KEYS.VIDEO_ID]: string;

  @ManyToOne(() => Video, (video) => video[E_VIDEO_ENTITY_KEYS.PROJECTS], {
    eager: true,
  })
  @JoinColumn({
    name: E_PROJECT_ENTITY_KEYS.VIDEO_ID,
  })
  [E_PROJECT_ENTITY_KEYS.VIDEO]: Video;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  [E_PROJECT_ENTITY_KEYS.ANNOTATIONS]: Array<any>;

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: E_PROJECT_ENTITY_KEYS.CREATED_BY })
  [E_PROJECT_ENTITY_KEYS.CREATED_BY]: User;

  @CreateDateColumn()
  [E_PROJECT_ENTITY_KEYS.CREATED_AT]: Date;
}
