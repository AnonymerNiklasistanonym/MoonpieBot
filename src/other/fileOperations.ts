/* eslint-disable security/detect-non-literal-fs-filename */
import { promises as fs } from "fs";

/**
 * Return if file/directory already exists.
 *
 * @param filePath Path of file/directory.
 * @returns True if exists, False if not.
 */
export const fileExists = async (filePath: string) =>
  !!(await fs.stat(filePath).catch(() => false));

/**
 * Read a JSON file.
 *
 * @param filePath Path of file/directory.
 * @template OUTPUT The type of the JSON file.
 * @returns The content of the JSON file (the format is not checked!).
 */
export const readJsonFile = async <OUTPUT>(filePath: string) => {
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
export const writeJsonFile = async <INPUT>(filePath: string, data: INPUT) =>
  await fs.writeFile(filePath, JSON.stringify(data, undefined, JSON_SPACING));
