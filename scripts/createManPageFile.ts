/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import { createManPageFile } from "./man";

const INSTALLER_DIR = path.join(__dirname, "..", "installer");

/** The output file path of the man page to create. */
const filePathOutputManPage = path.join(INSTALLER_DIR, "man.md");

// -----------------------------------------------------------------------------

console.log(`Create MAN page file '${filePathOutputManPage}'...`);

Promise.all([createManPageFile(filePathOutputManPage)]).catch(console.error);
