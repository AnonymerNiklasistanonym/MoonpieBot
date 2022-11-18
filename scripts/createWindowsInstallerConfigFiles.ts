/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import {
  createWindowsInstallerConfigFile,
  createWindowsInstallerScriptFileBackup,
  createWindowsInstallerScriptFileMain,
} from "./windowsInstaller";
import { name } from "../src/info/general";

const WINDOWS_INSTALLER_DIR = path.join(
  __dirname,
  "..",
  "installer",
  "windows_installer"
);

/** The output file path of the windows installer config to create. */
export const filePathOutputWindowsInstallerConfig = path.join(
  WINDOWS_INSTALLER_DIR,
  "windows_installer_config.nsi"
);
export const filePathWindowsScriptGlobalMain = path.join(
  WINDOWS_INSTALLER_DIR,
  `${name.toLowerCase()}.bat`
);
export const filePathWindowsScriptGlobalMainCustomDir = path.join(
  WINDOWS_INSTALLER_DIR,
  `${name.toLowerCase()}_custom_dir.bat`
);
export const filePathWindowsScriptGlobalBackup = path.join(
  WINDOWS_INSTALLER_DIR,
  `${name.toLowerCase()}_backup.bat`
);
export const filePathPowershellScriptSelectDirectory = path.join(
  WINDOWS_INSTALLER_DIR,
  "select_directory.ps1"
);

// -----------------------------------------------------------------------------

console.log(
  `Create Windows installer config file '${filePathOutputWindowsInstallerConfig}'...`
);
console.log(
  `Create Windows script file main '${filePathWindowsScriptGlobalMain}'...`
);
console.log(
  `Create Windows script file backup '${filePathWindowsScriptGlobalBackup}'...`
);

Promise.all([
  createWindowsInstallerConfigFile(
    filePathOutputWindowsInstallerConfig,
    path.relative(WINDOWS_INSTALLER_DIR, filePathWindowsScriptGlobalMain),
    path.relative(
      WINDOWS_INSTALLER_DIR,
      filePathWindowsScriptGlobalMainCustomDir
    ),
    path.relative(WINDOWS_INSTALLER_DIR, filePathWindowsScriptGlobalBackup)
  ),
  createWindowsInstallerScriptFileMain(filePathWindowsScriptGlobalMain),
  createWindowsInstallerScriptFileMain(
    filePathWindowsScriptGlobalMainCustomDir,
    filePathPowershellScriptSelectDirectory
  ),
  createWindowsInstallerScriptFileBackup(
    filePathWindowsScriptGlobalBackup,
    filePathPowershellScriptSelectDirectory
  ),
]).catch(console.error);
