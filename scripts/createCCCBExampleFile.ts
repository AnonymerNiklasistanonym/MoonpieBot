/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import { createCustomCommandsBroadcastsDocumentation } from "../src/documentation/customCommandsBroadcasts";
import { fileNameCustomCommandsBroadcastsExample } from "../src/info/files";

// The "config dir" is the root of the repository
const configDir = path.join(__dirname, "..");

const ccCbExampleFile = path.join(
  configDir,
  fileNameCustomCommandsBroadcastsExample
);

// -----------------------------------------------------------------------------

console.log(
  `Create Custom Commands/Broadcasts example file '${ccCbExampleFile}'...`
);

Promise.all([
  createCustomCommandsBroadcastsDocumentation(ccCbExampleFile),
]).catch(console.error);
