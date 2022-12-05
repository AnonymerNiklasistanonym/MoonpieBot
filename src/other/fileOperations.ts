/* eslint-disable security/detect-non-literal-fs-filename */

// Package imports
import { promises as fs } from "fs";
import path from "path";

/**
 * Return if file/directory already exists.
 *
 * @param filePath Path of file/directory.
 * @returns True if exists, False if not.
 */
export const fileExists = async (filePath: string): Promise<boolean> =>
  !!(await fs.stat(filePath).catch(() => false));

const pathsAreEqual = (path1: string, path2: string): boolean => {
  path1 = path.resolve(path1);
  path2 = path.resolve(path2);
  if (process.platform === "win32") {
    return path1.toLowerCase() === path2.toLowerCase();
  }
  return path1 === path2;
};

export interface CopyFileWithBackupOptions {
  ignoreSrcDestSameFile: boolean;
  ignoreSrcFileNotFound: boolean;
}

export const copyFileWithBackup = async (
  srcFilePath: string,
  destFilePath: string,
  destFilePathBackup: string,
  options: Readonly<CopyFileWithBackupOptions>
): Promise<void> => {
  const srcFileNotFound = !(await fileExists(srcFilePath));
  if (srcFileNotFound && options.ignoreSrcFileNotFound !== true) {
    throw Error(`Source file was not found '${srcFilePath}'`);
  }
  const srcDestSameFile = pathsAreEqual(srcFilePath, destFilePath);
  if (srcDestSameFile && options.ignoreSrcDestSameFile !== true) {
    throw Error(`Source and dest file are the same '${srcFilePath}'`);
  }
  if (await fileExists(destFilePath)) {
    await fs.mkdir(path.dirname(destFilePathBackup), { recursive: true });
    await fs.rename(destFilePath, destFilePathBackup);
  }
  if (srcFileNotFound && options.ignoreSrcFileNotFound === true) {
    return;
  }
  if (srcDestSameFile && options.ignoreSrcDestSameFile === true) {
    return;
  }
  await fs.copyFile(srcFilePath, destFilePath);
  return;
};

export const getFileContentIfExists = async (
  filePath: string,
  errorContent?: string
): Promise<Buffer | string> => {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return await fs.readFile(filePath);
  } catch (err) {
    return errorContent || `Error: File '${filePath}' was not found!`;
  }
};
