import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_DB_TABLES } from '../constants';
import { User } from './user.entity';
import { E_POSTER_ENTITY_KEYS, Poster } from './poster.entity';
import { Exclude } from 'class-transformer';
import { E_PROJECT_ENTITY_KEYS, Project } from './project.entity';

export enum E_VIDEO_ENTITY_KEYS {
  ID = 'id',
  NAME = 'name',
  FILENAME = 'filename',
  POSTER_ID = 'poster_id',
  POSTER = 'poster',
  WIDTH = 'width',
  HEIGHT = 'height',
  FPS = 'fps',
  BITRATE = 'bitrate',
  CODEC = 'codec',
  ASPECT_X = 'aspect_x',
  ASPECT_Y = 'aspect_y',
  POSTERS = 'posters',
  PROJECTS = 'projects',
  CREATED_BY = 'created_by',
  CREATED_AT = 'created_at',
}

@Entity({
  name: E_DB_TABLES.VIDEOS,
})
export class Video {
  @PrimaryGeneratedColumn('uuid')
  [E_VIDEO_ENTITY_KEYS.ID]: string;

  @Column()
  [E_VIDEO_ENTITY_KEYS.NAME]: string;

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  [E_VIDEO_ENTITY_KEYS.FILENAME]: string;

  @Column({
    nullable: true,
  })
  [E_VIDEO_ENTITY_KEYS.POSTER_ID]: string | null;

  @OneToOne(() => Poster, (poster) => poster[E_POSTER_ENTITY_KEYS.VIDEO], {
    nullable: true,
  })
  @JoinColumn({ name: E_VIDEO_ENTITY_KEYS.POSTER_ID })
  [E_VIDEO_ENTITY_KEYS.POSTER]: Poster | null;

  @Column({ type: 'int', nullable: true })
  [E_VIDEO_ENTITY_KEYS.WIDTH]: number | null;

  @Column({ type: 'int', nullable: true })
  [E_VIDEO_ENTITY_KEYS.HEIGHT]: number | null;

  @Column({ type: 'float', nullable: true })
  [E_VIDEO_ENTITY_KEYS.FPS]: number | null;

  @Column({ type: 'int', nullable: true })
  [E_VIDEO_ENTITY_KEYS.BITRATE]: number | null;

  @Column({ nullable: true })
  [E_VIDEO_ENTITY_KEYS.CODEC]: string | null;

  @Column({ type: 'int', nullable: true })
  [E_VIDEO_ENTITY_KEYS.ASPECT_X]: number | null;

  @Column({ type: 'int', nullable: true })
  [E_VIDEO_ENTITY_KEYS.ASPECT_Y]: number | null;

  @OneToMany(() => Poster, (poster) => poster[E_POSTER_ENTITY_KEYS.VIDEO], {
    eager: true,
  })
  [E_VIDEO_ENTITY_KEYS.POSTERS]: Array<Poster>;

  @OneToMany(() => Project, (project) => project[E_PROJECT_ENTITY_KEYS.VIDEO])
  [E_VIDEO_ENTITY_KEYS.PROJECTS]: Array<Project>;

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: E_VIDEO_ENTITY_KEYS.CREATED_BY })
  [E_VIDEO_ENTITY_KEYS.CREATED_BY]: User;

  @CreateDateColumn()
  [E_VIDEO_ENTITY_KEYS.CREATED_AT]: Date;
}
