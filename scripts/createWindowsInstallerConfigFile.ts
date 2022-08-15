/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import { createWindowsInstallerConfigFile } from "../src/documentation/windowsInstaller";
import { fileNameWindowsInstallerConfig } from "../src/info/fileNames";

const configFile = path.join(__dirname, "..", fileNameWindowsInstallerConfig);

console.log(`Create Windows installer config file '${configFile}'...`);
createWindowsInstallerConfigFile(configFile).catch(console.error);
