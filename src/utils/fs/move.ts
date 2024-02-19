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
    try {
      fs.copyFileSync(oldPath, newPath);
      fs.unlinkSync(oldPath);

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
