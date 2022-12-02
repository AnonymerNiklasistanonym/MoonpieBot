/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import { defaultMacros, defaultMacrosOptional } from "../src/info/macros";
import { defaultPlugins, defaultPluginsOptional } from "../src/info/plugins";
import {
  fileNameEnvExample,
  fileNameEnvStringsExample,
} from "../src/info/files";
import { createConsoleLogger } from "../src/logging";
import { createEnvVariableDocumentation } from "../src/env";
import { createJob } from "../src/createJob";
import { createStringsVariableDocumentation } from "../src/documentation/strings";
import { defaultStringMap } from "../src/info/strings";

const configDir = path.join(__dirname, "..");
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
      createConsoleLogger("create_example_files_env_strings", "off")
    )
  ),
]).catch(console.error);
