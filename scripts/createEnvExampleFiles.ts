/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import {
  defaultMacros,
  defaultMacrosOptional,
} from "../src/messageParser/macros";
import {
  defaultPlugins,
  defaultPluginsOptional,
} from "../src/messageParser/plugins";
import {
  fileNameEnvExample,
  fileNameEnvStringsExample,
} from "../src/info/fileNames";
import { createConsoleLogger } from "../src/logging";
import { createEnvVariableDocumentation } from "../src/env";
import { createStringsVariableDocumentation } from "../src/documentation/strings";
import { defaultStringMap } from "../src/strings";

const logger = createConsoleLogger("create_example_files");

const configDir = path.join(__dirname, "..");
const envExampleFile = path.join(configDir, fileNameEnvExample);
const envStringsExampleFile = path.join(configDir, fileNameEnvStringsExample);

console.log(`Create ENV example file '${envExampleFile}'`);
createEnvVariableDocumentation(envExampleFile, configDir).catch(console.error);

console.log(`Create strings ENV example file '${envStringsExampleFile}'`);
createStringsVariableDocumentation(
  envStringsExampleFile,
  defaultStringMap,
  defaultPlugins,
  defaultMacros,
  defaultPluginsOptional,
  defaultMacrosOptional,
  logger
).catch(console.error);
