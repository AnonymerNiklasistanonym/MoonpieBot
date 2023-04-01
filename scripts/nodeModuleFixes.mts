/* eslint-disable no-console */

// Package imports
import { fileURLToPath } from "url";
import path from "path";
// Relative imports
import { createJobUpdate } from "../src/createJob.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(dirname, "..");
const filePathTwitchApiCallOptionsDTs = path.join(
  ROOT_DIR,
  "node_modules",
  "@twurple",
  "api-call",
  "lib",
  "TwitchApiCallOptions.d.ts"
);

const fixNonEsmDependencyTwurple = (fileContent: Readonly<Buffer>): string => {
  const oldFileContent = fileContent.toString();
  const newFileContent = oldFileContent
    .replace(
      "import type { RequestInit as NodeRequestInit } from 'node-fetch';\n",
      ""
    )
    .replace("RequestInit | NodeRequestInit", "RequestInit");
  return newFileContent;
};

try {
  await Promise.all([
    createJobUpdate(
      "TwitchApiCallOptions.d.ts",
      ["fix non esm dependency"],
      filePathTwitchApiCallOptionsDTs,
      fixNonEsmDependencyTwurple
    ),
  ]);
} catch (err) {
  console.error(err);
}
