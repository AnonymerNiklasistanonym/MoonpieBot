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

export const pathsAreEqual = (path1: string, path2: string): boolean => {
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
  options: CopyFileWithBackupOptions
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

/**
 * Read a JSON file.
 *
 * @param filePath Path of file/directory.
 * @template OUTPUT The type of the JSON file.
 * @returns The content of the JSON file (the format is not checked!).
 */
export const readJsonFile = async <OUTPUT>(
  filePath: string
): Promise<OUTPUT> => {
  const content = await fs.readFile(filePath);
  return JSON.parse(content.toString()) as OUTPUT;
};

const JSON_SPACING = 4;

/**
 * Write a JSON file.
 *
 * @param filePath Path of file/directory.
 * @param data The new data of the JSON file.
 * @template INPUT The type of the JSON file to validate the data.
 */
export const writeJsonFile = async <INPUT>(
  filePath: string,
  data: INPUT
): Promise<void> =>
  await fs.writeFile(filePath, JSON.stringify(data, undefined, JSON_SPACING));

/**
 * Write a text file.
 *
 * @param filePath Path of file/directory.
 * @param data The new data of the text file.
 */
export const writeTextFile = async (
  filePath: string,
  data: string
): Promise<void> => await fs.writeFile(filePath, data);
