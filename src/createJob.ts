/* eslint-disable security/detect-non-literal-fs-filename, no-console */

// Package imports
import { promises as fs } from "fs";
import path from "path";
// Type imports
import type { OrPromise } from "./other/types";

export interface JobOptions {
  silent: boolean;
}

export const createJob = async (
  fileType: string,
  filePath: string,
  fileContent: OrPromise<string>,
  options?: Readonly<JobOptions>
): Promise<void> => {
  if (options?.silent !== true) {
    console.log(`Create ${fileType} file '${filePath}'...`);
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, await fileContent);
};

export const createJobDirectory = async (
  directoryType: string,
  dirPath: string,
  options?: Readonly<JobOptions>
): Promise<void> => {
  if (options?.silent !== true) {
    console.log(`Create ${directoryType} directory '${dirPath}'...`);
  }
  await fs.mkdir(dirPath, { recursive: true });
};

export const createJobUpdate = async (
  fileType: string,
  fileUpdateInfo: ReadonlyArray<string>,
  filePath: string,
  updateFileContent: (
    fileContent: Readonly<Buffer>
  ) => OrPromise<string | Buffer>,
  options?: Readonly<JobOptions>
): Promise<void> => {
  if (options?.silent !== true) {
    console.log(
      `Update ${fileUpdateInfo.join(", ")} of ${fileType} file '${filePath}'...`
    );
  }
  const content = await fs.readFile(filePath);
  await fs.writeFile(filePath, await updateFileContent(content));
};
