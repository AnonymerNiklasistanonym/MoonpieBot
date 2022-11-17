/* eslint-disable no-console */

// Package imports
import { promises as fs } from "fs";
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
import { createStringsVariableDocumentation } from "../src/documentation/strings";
import { defaultStringMap } from "../src/info/strings";

const logger = createConsoleLogger("create_example_files_env");

// The "config dir" is the root of the repository
const configDir = path.join(__dirname, "..");

const envExampleFile = path.join(configDir, fileNameEnvExample);
const envStringsExampleFile = path.join(configDir, fileNameEnvStringsExample);

// -----------------------------------------------------------------------------

const createEnvExampleFile = async (filePath: string) => {
  console.log(`Create ENV example file '${filePath}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(filePath, createEnvVariableDocumentation(configDir));
};

const createEnvStringsExampleFile = async (filePath: string) => {
  console.log(`Create ENV strings example file '${filePath}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    filePath,
    await createStringsVariableDocumentation(
      defaultStringMap,
      defaultPlugins,
      defaultMacros,
      defaultPluginsOptional,
      defaultMacrosOptional,
      logger
    )
  );
};

Promise.all([
  createEnvExampleFile(envExampleFile),
  createEnvStringsExampleFile(envStringsExampleFile),
]).catch(console.error);
