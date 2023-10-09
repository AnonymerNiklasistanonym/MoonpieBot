/* eslint-disable no-console */

// Package imports
import { fileURLToPath } from "url";
import path from "path";
// Relative imports
import { createJobUpdate } from "../src/createJob.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(dirname, "..");
const filePathTwurpleDependencyCrossFetchPackageJson = path.join(
  ROOT_DIR,
  "node_modules",
  "@d-fischer",
  "cross-fetch",
  "package.json",
);
/*
const filePathNodeFetchBlob = path.join(ROOT_DIR, "node_modules", "fetch-blob");
const filePathNodeFetchBlobFileType = path.join(
  filePathNodeFetchBlob,
  "file.d.ts",
);
const filePathNodeFetchBlobFromType = path.join(
  filePathNodeFetchBlob,
  "from.d.ts",
);
const filePathNodeEsmWeird = path.join(
  ROOT_DIR,
  "node_modules",
  "formdata-polyfill",
  "esm.min.d.ts",
);
const filePathNodeFetch = path.join(
  ROOT_DIR,
  "node_modules",
  "node-fetch",
  "@types",
  "index.d.ts",
);
*/
const fixTypeErrorCrossFetch = (fileContent: Readonly<Buffer>): string => {
  const oldFileContent = fileContent.toString();
  const newFileContent = oldFileContent.replace(
    // eslint-disable-next-line @typescript-eslint/quotes
    '"require": "./dist/node-ponyfill.js",\n',
    // eslint-disable-next-line @typescript-eslint/quotes
    '"require": "./dist/node-ponyfill.js",\n      "types": "./index.d.ts",\n',
  );
  return newFileContent;
};
/*
const fixTypeErrorFetchBlobFile = (fileContent: Readonly<Buffer>): string => {
  const oldFileContent = fileContent.toString();
  const newFileContent = oldFileContent.replace(
    "File: typeof globalThis.File",
    "File: any",
  );
  return newFileContent;
};

const fixTypeErrorFetchBlobFrom = (fileContent: Readonly<Buffer>): string => {
  const oldFileContent = fileContent.toString();
  const newFileContent = oldFileContent
    .replace(": File", ": any")
    .replace(": Promise<File>", ": Promise<any>");
  return newFileContent;
};

const fixTypeErrorEsmFormData = (fileContent: Readonly<Buffer>): string => {
  const oldFileContent = fileContent.toString();
  const newFileContent = oldFileContent.replace(
    ": FormData",
    ": typeof FormData",
  );
  return newFileContent;
};

const fixTypeErrorNodeFetch = (fileContent: Readonly<Buffer>): string => {
  const oldFileContent = fileContent.toString();
  const newFileContent = oldFileContent
    .replace(/\| FormData/g, "| Map<string, string>")
    .replace(/Promise<FormData>/g, "Promise<Map<string, string>>");

  return newFileContent;
};
*/
try {
  await Promise.all([
    createJobUpdate(
      "@d-cross-fetch/package.json",
      ["fix type error for @twurple dependency cross-fetch"],
      filePathTwurpleDependencyCrossFetchPackageJson,
      fixTypeErrorCrossFetch,
    ),
    /*
    createJobUpdate(
      "fetch-blob/file.d.ts",
      ["fix type error for fetch-blob [File 1/2]"],
      filePathNodeFetchBlobFileType,
      fixTypeErrorFetchBlobFile,
    ),
    createJobUpdate(
      "fetch-blob/from.d.ts",
      ["fix type error for fetch-blob [File 2/2]"],
      filePathNodeFetchBlobFromType,
      fixTypeErrorFetchBlobFrom,
    ),
    createJobUpdate(
      "formdata-polyfill/esm.min.d.ts",
      ["fix type error for formdata-polyfill"],
      filePathNodeEsmWeird,
      fixTypeErrorEsmFormData,
    ),
    createJobUpdate(
      "node-fetch/@types/index.d.ts",
      ["fix type error for node-fetch"],
      filePathNodeFetch,
      fixTypeErrorNodeFetch,
    ),
    */
  ]);
} catch (err) {
  console.error(err);
}
