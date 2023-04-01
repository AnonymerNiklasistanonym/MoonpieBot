/* eslint-disable no-console */

// Package imports
import { fileURLToPath } from "url";
import path from "path";
// Relative imports
import { createConsoleLogger, LoggerLevel } from "../src/logging.mjs";
import { defaultMacros, defaultMacrosOptional } from "../src/info/macros.mjs";
import {
  defaultPlugins,
  defaultPluginsOptional,
} from "../src/info/plugins.mjs";
import {
  fileNameEnvExample,
  fileNameEnvStringsExample,
} from "../src/info/files.mjs";
import { createEnvVariableDocumentation } from "../src/env.mjs";
import { createJob } from "../src/createJob.mjs";
import { createStringsVariableDocumentation } from "../src/documentation/strings.mjs";
import { defaultStringMap } from "../src/info/strings.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const configDir = path.join(dirname, "..");
const envExampleFile = path.join(configDir, fileNameEnvExample);
const envStringsExampleFile = path.join(configDir, fileNameEnvStringsExample);

// -----------------------------------------------------------------------------

Promise.all([
  createJob(
    "ENV example",
    envExampleFile,
    createEnvVariableDocumentation(configDir)
  ),
  createJob(
    "ENV strings example",
    envStringsExampleFile,
    createStringsVariableDocumentation(
      defaultStringMap,
      defaultPlugins,
      defaultMacros,
      defaultPluginsOptional,
      defaultMacrosOptional,
      createConsoleLogger("create_example_files_env_strings", LoggerLevel.OFF)
    )
  ),
]).catch(console.error);
