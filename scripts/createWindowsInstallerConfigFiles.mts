/* eslint-disable no-console */

// Package imports
import { fileURLToPath } from "url";
import path from "path";
// Relative imports
import {
  createWindowsInstallerConfigFileContent,
  createWindowsInstallerScriptFileContentBackup,
  createWindowsInstallerScriptFileContentImport,
  createWindowsInstallerScriptFileContentMain,
} from "./lib/windowsInstaller.mjs";
import { binaryName } from "../src/info/general.mjs";
import { createJob } from "../src/createJob.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const WINDOWS_INSTALLER_DIR = path.join(
  dirname,
  "..",
  "installer",
  "windows_installer"
);

/** The output file path of the windows installer config to create. */
const filePathOutputWindowsInstallerConfig = path.join(
  WINDOWS_INSTALLER_DIR,
  "windows_installer_config.nsi"
);
const filePathWindowsScriptGlobalMain = path.join(
  WINDOWS_INSTALLER_DIR,
  `${binaryName}.bat`
);
const filePathWindowsScriptGlobalMainCustomDir = path.join(
  WINDOWS_INSTALLER_DIR,
  `${binaryName}_custom_dir.bat`
);
const filePathWindowsScriptGlobalBackup = path.join(
  WINDOWS_INSTALLER_DIR,
  `${binaryName}_backup.bat`
);
const filePathWindowsScriptGlobalImport = path.join(
  WINDOWS_INSTALLER_DIR,
  `${binaryName}_import.bat`
);
const filePathPowershellScriptSelectDirectory = path.join(
  WINDOWS_INSTALLER_DIR,
  "select_directory.ps1"
);

// -----------------------------------------------------------------------------

try {
  await Promise.all([
    createJob(
      "Windows installer config",
      filePathOutputWindowsInstallerConfig,
      createWindowsInstallerConfigFileContent(
        path.relative(WINDOWS_INSTALLER_DIR, filePathWindowsScriptGlobalMain),
        path.relative(
          WINDOWS_INSTALLER_DIR,
          filePathWindowsScriptGlobalMainCustomDir
        ),
        path.relative(WINDOWS_INSTALLER_DIR, filePathWindowsScriptGlobalBackup),
        path.relative(WINDOWS_INSTALLER_DIR, filePathWindowsScriptGlobalImport)
      )
    ),
    createJob(
      "Windows batch script",
      filePathWindowsScriptGlobalMain,
      createWindowsInstallerScriptFileContentMain()
    ),
    createJob(
      "Windows batch script with custom directory",
      filePathWindowsScriptGlobalMainCustomDir,
      createWindowsInstallerScriptFileContentMain(
        filePathPowershellScriptSelectDirectory
      )
    ),
    createJob(
      "Windows batch script backup",
      filePathWindowsScriptGlobalBackup,
      createWindowsInstallerScriptFileContentBackup(
        filePathPowershellScriptSelectDirectory
      )
    ),
    createJob(
      "Windows batch script import",
      filePathWindowsScriptGlobalImport,
      createWindowsInstallerScriptFileContentImport(
        filePathPowershellScriptSelectDirectory
      )
    ),
  ]);
} catch (err) {
  console.error(err);
}
