import * as fs from 'fs';

/**
 * Create a directory
 * @param path - The path to the directory
 */
export const createDirectory = async (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};
