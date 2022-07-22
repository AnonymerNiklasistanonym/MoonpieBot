/* eslint-disable security/detect-non-literal-fs-filename */
import { promises as fs } from "fs";

export const fileExists = async (path: string) =>
  !!(await fs.stat(path).catch(() => false));

export const readJsonFile = async <OUTPUT>(path: string) => {
  const content = await fs.readFile(path);
  return JSON.parse(content.toString()) as OUTPUT;
};

export const writeJsonFile = async <INPUT>(path: string, data: INPUT) => {
  await fs.writeFile(path, JSON.stringify(data, undefined, 4));
};
