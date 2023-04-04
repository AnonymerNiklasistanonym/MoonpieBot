// Package imports
import { promises as fs } from "fs";
// Relative imports
import {
  commandCreateBackup,
  commandImportBackup,
  getCommandFlag,
  getOptionFlag,
  optionCustomConfigDir,
} from "../../src/info/cli.mjs";
import {
  displayName,
  name,
  version,
  websiteUrl,
} from "../../src/info/general.mjs";
import {
  fileNameCustomCommandsBroadcastsExample,
  fileNameEnvExample,
  fileNameEnvStringsExample,
} from "../../src/info/files.mjs";
import { defaultConfigDir } from "../../src/info/files.mjs";

export const createWindowsInstallerConfigFileContent = (
  fileNameScriptMain: string,
  fileNameScriptMainCustomDir: string,
  fileNameScriptBackup: string,
  fileNameScriptImport: string,
): string => {
  let outputString = "";
  outputString += ";Define name and lowercase name of the product\n";
  outputString += `!define PRODUCT "${displayName}"\n`;
  outputString += `!define PRODUCT_BINARY "${name}"\n`;
  outputString += ";Define version of the product\n";
  outputString += `!define PRODUCT_VERSION "${version}"\n`;
  outputString += ";Define URL of the product\n";
  outputString += `!define PRODUCT_URL "${websiteUrl}"\n`;
  outputString += ";Define local input file names\n";
  outputString += `!define FILE_NAME_SCRIPT_MAIN "${fileNameScriptMain}"\n`;
  outputString += `!define FILE_NAME_SCRIPT_MAIN_CUSTOM_CONFIG_DIR "${fileNameScriptMainCustomDir}"\n`;
  outputString += `!define FILE_NAME_SCRIPT_BACKUP "${fileNameScriptBackup}"\n`;
  outputString += `!define FILE_NAME_SCRIPT_IMPORT "${fileNameScriptImport}"\n`;
  outputString += `!define FILE_NAME_ENV_EXAMPLE "${fileNameEnvExample}"\n`;
  outputString += `!define FILE_NAME_ENV_STRINGS_EXAMPLE "${fileNameEnvStringsExample}"\n`;
  outputString += `!define FILE_NAME_CUSTOM_COMMANDS_BROADCASTS_EXAMPLE "${fileNameCustomCommandsBroadcastsExample}"\n`;

  return outputString;
};

const batchExitProgram = "exit 0";
const batchHideCommands = "@echo off";
const batchShowCommands = "@echo on";
const batchWaitForKeypress = "pause press [enter]";
const batchSelectFolderDialog = async (
  powershellSelectDirectoryScriptPath: string,
  dialogTitle: string,
  variableName: string,
  onEmptyAction?: string,
) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const powershellSelectDirectoryScript = await fs.readFile(
    powershellSelectDirectoryScriptPath,
  );
  const pscommand = "PScommand";
  let outputString = `set "${pscommand}="POWERSHELL ${powershellSelectDirectoryScript
    .toString()
    .replace("DIALOG_TITLE", dialogTitle)
    .split("\n")
    .map((a) => a.trim())
    .join("")}""\n`;
  outputString += `for /f "usebackq tokens=*" %%Q in (\`%${pscommand}%\`) do set ${variableName}=%%Q`;
  if (onEmptyAction !== undefined) {
    outputString += `\nif "%${variableName}%"=="" (${onEmptyAction})`;
  }
  return outputString;
};

export const createWindowsInstallerScriptFileContentMain = async (
  powershellSelectDirectoryScriptPath?: string,
): Promise<string> => {
  let outputString = "";
  const selectedCustomDirVarName = "SelectedCustomDir";
  if (powershellSelectDirectoryScriptPath !== undefined) {
    outputString += `${batchHideCommands}\n`;
    outputString += `${await batchSelectFolderDialog(
      powershellSelectDirectoryScriptPath,
      "Select custom configuration directory",
      selectedCustomDirVarName,
      batchExitProgram,
    )}\n`;
    outputString += `${batchShowCommands}\n`;
  }
  outputString += `${name}.exe ${getOptionFlag(optionCustomConfigDir)} "${
    powershellSelectDirectoryScriptPath !== undefined
      ? `%${selectedCustomDirVarName}%`
      : defaultConfigDir("win32")
  }" %*\n`;
  outputString += `${batchHideCommands}\n`;
  outputString += `${batchWaitForKeypress}\n`;
  return outputString;
};

export const createWindowsInstallerScriptFileContentBackup = async (
  powershellSelectDirectoryScriptPath: string,
): Promise<string> => {
  let outputString = "";
  outputString += `${batchHideCommands}\n`;
  const selectedBackupDirVarName = "SelectedBackupDir";
  outputString += `${await batchSelectFolderDialog(
    powershellSelectDirectoryScriptPath,
    "Select backup directory",
    selectedBackupDirVarName,
    batchExitProgram,
  )}\n`;
  outputString += `${batchShowCommands}\n`;
  outputString += `${name}.exe ${getOptionFlag(
    optionCustomConfigDir,
  )} "${defaultConfigDir("win32")}" ${getCommandFlag(
    commandCreateBackup,
  )} "%${selectedBackupDirVarName}%" %*\n`;
  outputString += `${batchHideCommands}\n`;
  outputString += `${batchWaitForKeypress}\n`;
  return outputString;
};

export const createWindowsInstallerScriptFileContentImport = async (
  powershellSelectDirectoryScriptPath: string,
): Promise<string> => {
  let outputString = "";
  outputString += `${batchHideCommands}\n`;
  const selectedBackupDirVarName = "SelectedBackupDir";
  outputString += `${await batchSelectFolderDialog(
    powershellSelectDirectoryScriptPath,
    "Select backup directory to import",
    selectedBackupDirVarName,
    batchExitProgram,
  )}\n`;
  outputString += `${batchShowCommands}\n`;
  outputString += `${name}.exe ${getOptionFlag(
    optionCustomConfigDir,
  )} "${defaultConfigDir("win32")}" ${getCommandFlag(
    commandImportBackup,
  )} "%${selectedBackupDirVarName}%" %*\n`;
  outputString += `${batchHideCommands}\n`;
  outputString += `${batchWaitForKeypress}\n`;
  return outputString;
};
