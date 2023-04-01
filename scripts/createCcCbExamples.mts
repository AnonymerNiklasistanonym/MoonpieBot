/* eslint-disable no-console */

// Package imports
import { fileURLToPath } from "url";
import path from "path";
// Relative imports
import { createCustomCommandsBroadcastsDocumentation } from "../src/documentation/customCommandsBroadcasts.mjs";
import { createJob } from "../src/createJob.mjs";
import { fileNameCustomCommandsBroadcastsExample } from "../src/info/files.mjs";

// The "config dir" is the root of the repository
const dirname = path.dirname(fileURLToPath(import.meta.url));
const configDir = path.join(dirname, "..");

const ccCbExampleFile = path.join(
  configDir,
  fileNameCustomCommandsBroadcastsExample
);

// -----------------------------------------------------------------------------

console.log(
  `Create Custom Commands/Broadcasts example file '${ccCbExampleFile}'...`
);

try {
  await Promise.all([
    createJob(
      "Custom Commands/Broadcasts example",
      ccCbExampleFile,
      createCustomCommandsBroadcastsDocumentation()
    ),
  ]);
} catch (err) {
  console.error(err);
}
