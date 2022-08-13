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
import { defaultStrings } from "../src/strings";

const logger = createConsoleLogger("create_example_files");

const configDir = path.join(__dirname, "..");
const envExampleFile = path.join(configDir, fileNameEnvExample);
// eslint-disable-next-line no-console
console.log(`Create example file '${envExampleFile}'`);
createEnvVariableDocumentation(
  envExampleFile,
  configDir
  // eslint-disable-next-line no-console
).catch(console.error);

const envStringsExampleFile = path.join(configDir, fileNameEnvStringsExample);
// eslint-disable-next-line no-console
console.log(`Create example file '${envStringsExampleFile}'`);
createStringsVariableDocumentation(
  envStringsExampleFile,
  defaultStrings,
  defaultPlugins,
  defaultMacros,
  defaultPluginsOptional,
  defaultMacrosOptional,
  logger
  // eslint-disable-next-line no-console
).catch(console.error);
