// Package imports
import { promises as fs } from "fs";
// Local imports
import {
  fileNameCustomCommandsBroadcastsExample,
  fileNameEnvExample,
  fileNameEnvStringsExample,
} from "../src/info/files";
import { name, sourceCodeUrl } from "../src/info/general";
import { getVersionFromObject } from "../src/version";
import { version } from "../src/info/version";

export const createWindowsInstallerConfigFile = async (
  outputPath: string
): Promise<void> => {
  let outputString = "";
  outputString += ";Define name and lowercase name of the product\n";
  outputString += `!define PRODUCT "${name}"\n`;
  outputString += `!define PRODUCT_LOWERCASE "${name.toLowerCase()}"\n`;
  outputString += ";Define version of the product\n";
  outputString += `!define PRODUCT_VERSION "${getVersionFromObject(
    version
  ).slice(1)}"\n`;
  outputString += ";Define URL of the product\n";
  outputString += `!define PRODUCT_URL "${sourceCodeUrl}"\n`;
  outputString += ";Define local input file names\n";
  outputString += `!define FILE_NAME_ENV_EXAMPLE "${fileNameEnvExample}"\n`;
  outputString += `!define FILE_NAME_ENV_STRINGS_EXAMPLE "${fileNameEnvStringsExample}"\n`;
  outputString += `!define FILE_NAME_CUSTOM_COMMANDS_BROADCASTS_EXAMPLE "${fileNameCustomCommandsBroadcastsExample}"\n`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(outputPath, outputString);
};
