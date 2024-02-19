import { E_VIDEO_ENTITY_KEYS, Video } from '../db/entities/video.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVideoDTO {
  @IsNotEmpty()
  @IsString()
  [E_VIDEO_ENTITY_KEYS.NAME]: Video[E_VIDEO_ENTITY_KEYS.NAME];
}
