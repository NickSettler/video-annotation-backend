import * as ffmpeg from 'ffmpeg';

export const getVideoPosters = async (path: string) => {
  const process = new ffmpeg(path);
  const video = await process;

  const videoFolder = path.split('/').slice(0, -1).join('/');

  return (
    await video.fnExtractFrameToJPG(videoFolder, {
      every_n_percentage: 100 / 5,
    })
  ).filter((file) => file.includes('.jpg'));
};
