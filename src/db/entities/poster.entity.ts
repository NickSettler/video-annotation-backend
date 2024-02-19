import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_DB_TABLES } from '../constants';
import { E_VIDEO_ENTITY_KEYS, Video } from './video.entity';
import { Exclude } from 'class-transformer';

export enum E_POSTER_ENTITY_KEYS {
  ID = 'id',
  VIDEO_ID = 'video_id',
  VIDEO = 'video',
  ORDER = 'order',
  FILENAME = 'filename',
}

@Entity({
  name: E_DB_TABLES.POSTERS,
})
export class Poster {
  @PrimaryGeneratedColumn('uuid')
  [E_POSTER_ENTITY_KEYS.ID]: string;

  @Column()
  [E_POSTER_ENTITY_KEYS.VIDEO_ID]: string;

  @ManyToOne(() => Video, (video) => video[E_VIDEO_ENTITY_KEYS.POSTERS])
  @JoinColumn({ name: E_POSTER_ENTITY_KEYS.VIDEO_ID })
  [E_POSTER_ENTITY_KEYS.VIDEO]: Video;

  @Column({ type: 'int' })
  [E_POSTER_ENTITY_KEYS.ORDER]: number;

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  [E_POSTER_ENTITY_KEYS.FILENAME]: string;
}
