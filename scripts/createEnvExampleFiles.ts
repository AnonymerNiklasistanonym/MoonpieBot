// Package imports
import path from "path";
// Local imports
import {
  createStringsVariableDocumentation,
  defaultStrings,
} from "../src/strings";
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

const logger = createConsoleLogger("example_files");

const configDir = path.join(__dirname, "..");
createEnvVariableDocumentation(
  path.join(configDir, fileNameEnvExample),
  configDir
).catch(console.error);
createStringsVariableDocumentation(
  path.join(configDir, fileNameEnvStringsExample),
  defaultStrings,
  defaultPlugins,
  defaultMacros,
  defaultPluginsOptional,
  defaultMacrosOptional,
  logger
).catch(console.error);
