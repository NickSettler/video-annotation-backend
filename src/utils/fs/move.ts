import * as fs from 'fs';

/**
 * Move a file
 * @param oldPath - The old path
 * @param newPath - The new path
 */
export const moveFile = async (
  oldPath: string,
  newPath: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};
