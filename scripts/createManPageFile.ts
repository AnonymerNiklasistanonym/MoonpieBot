// Package imports
import path from "path";
// Local imports
import { createManPageFile } from "../src/documentation/man";
import { fileNameManPage } from "../src/info/fileNames";

const filePathManPage = path.join(__dirname, "..", fileNameManPage);
// eslint-disable-next-line no-console
console.log(`Create MAN page file "${filePathManPage}"...`);
// eslint-disable-next-line no-console
createManPageFile(filePathManPage).catch(console.error);
