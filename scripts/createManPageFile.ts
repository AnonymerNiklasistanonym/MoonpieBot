/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import { createManPageFile } from "../src/documentation/man";
import { fileNameManPage } from "../src/info/fileNames";

const manPage = path.join(__dirname, "..", fileNameManPage);

console.log(`Create MAN page file "${manPage}"...`);
createManPageFile(manPage).catch(console.error);
