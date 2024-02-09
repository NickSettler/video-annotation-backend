import * as ffmpeg from 'ffmpeg';

export type TVideoMetadata = {
  container: string;
  bitrate: number;
  stream: number;
  codec: string;
  resolution: { w: number; h: number };
  resolutionSquare: { w: number; h: number };
  aspect: { x: number; y: number; string: string; value: number };
  rotate: number;
  fps: number;
  pixelString: string;
  pixel: number;
};

export const getVideoMetadata = async (
  filePath: string,
): Promise<TVideoMetadata> => {
  const process = new ffmpeg(filePath);
  const video = await process;

  // @ts-ignore
  return video.metadata.video as TVideoMetadata;
};
