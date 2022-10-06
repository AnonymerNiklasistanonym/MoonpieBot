/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import { createWindowsInstallerConfigFile } from "./windowsInstaller";

const INSTALLER_DIR = path.join(__dirname, "..", "installer");

/** The output file path of the windows installer config to create. */
export const filePathOutputWindowsInstallerConfig = path.join(
  INSTALLER_DIR,
  "windows_installer",
  "windows_installer_config.nsi"
);

// -----------------------------------------------------------------------------

console.log(
  `Create Windows installer config file '${filePathOutputWindowsInstallerConfig}'...`
);

Promise.all([
  createWindowsInstallerConfigFile(filePathOutputWindowsInstallerConfig),
]).catch(console.error);
