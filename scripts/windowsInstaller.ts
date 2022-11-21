// Package imports
import { promises as fs } from "fs";
// Local imports
import {
  binaryName,
  defaultConfigDir,
  name,
  sourceCodeUrl,
} from "../src/info/general";
import {
  fileNameCustomCommandsBroadcastsExample,
  fileNameEnvExample,
  fileNameEnvStringsExample,
} from "../src/info/files";
import { CliOption } from "../src/info/cli";
import { getVersionString } from "../src/version";
import { version } from "../src/info/version";

export const createWindowsInstallerConfigFile = async (
  outputPath: string,
  fileNameScriptMain: string,
  fileNameScriptMainCustomDir: string,
  fileNameScriptBackup: string,
  fileNameScriptImport: string
): Promise<void> => {
  let outputString = "";
  outputString += ";Define name and lowercase name of the product\n";
  outputString += `!define PRODUCT "${name}"\n`;
  outputString += `!define PRODUCT_BINARY "${binaryName}"\n`;
  outputString += ";Define version of the product\n";
  outputString += `!define PRODUCT_VERSION "${getVersionString(
    version,
    ""
  )}"\n`;
  outputString += ";Define URL of the product\n";
  outputString += `!define PRODUCT_URL "${sourceCodeUrl}"\n`;
  outputString += ";Define local input file names\n";
  outputString += `!define FILE_NAME_SCRIPT_MAIN "${fileNameScriptMain}"\n`;
  outputString += `!define FILE_NAME_SCRIPT_MAIN_CUSTOM_CONFIG_DIR "${fileNameScriptMainCustomDir}"\n`;
  outputString += `!define FILE_NAME_SCRIPT_BACKUP "${fileNameScriptBackup}"\n`;
  outputString += `!define FILE_NAME_SCRIPT_IMPORT "${fileNameScriptImport}"\n`;
  outputString += `!define FILE_NAME_ENV_EXAMPLE "${fileNameEnvExample}"\n`;
  outputString += `!define FILE_NAME_ENV_STRINGS_EXAMPLE "${fileNameEnvStringsExample}"\n`;
  outputString += `!define FILE_NAME_CUSTOM_COMMANDS_BROADCASTS_EXAMPLE "${fileNameCustomCommandsBroadcastsExample}"\n`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(outputPath, outputString);
};

const batchExitProgram = "exit 0";
const batchHideCommands = "@echo off";
const batchShowCommands = "@echo on";
const batchWaitForKeypress = "pause press [enter]";
const batchSelectFolderDialog = async (
  powershellSelectDirectoryScriptPath: string,
  dialogTitle: string,
  variableName: string,
  onEmptyAction?: string
) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const powershellSelectDirectoryScript = await fs.readFile(
    powershellSelectDirectoryScriptPath
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

export const createWindowsInstallerScriptFileMain = async (
  outputPath: string,
  powershellSelectDirectoryScriptPath?: string
): Promise<void> => {
  let outputString = "";
  const selectedCustomDirVarName = "SelectedCustomDir";
  if (powershellSelectDirectoryScriptPath !== undefined) {
    outputString += `${batchHideCommands}\n`;
    outputString += `${await batchSelectFolderDialog(
      powershellSelectDirectoryScriptPath,
      "Select custom configuration directory",
      selectedCustomDirVarName,
      batchExitProgram
    )}\n`;
    outputString += `${batchShowCommands}\n`;
  }
  outputString += `${binaryName}.exe ${CliOption.CONFIG_DIRECTORY} "${
    powershellSelectDirectoryScriptPath !== undefined
      ? `%${selectedCustomDirVarName}%`
      : defaultConfigDir(true)
  }" %*\n`;
  outputString += `${batchHideCommands}\n`;
  outputString += `${batchWaitForKeypress}\n`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(outputPath, outputString);
};

export const createWindowsInstallerScriptFileBackup = async (
  outputPath: string,
  powershellSelectDirectoryScriptPath: string
): Promise<void> => {
  let outputString = "";
  outputString += `${batchHideCommands}\n`;
  const selectedBackupDirVarName = "SelectedBackupDir";
  outputString += `${await batchSelectFolderDialog(
    powershellSelectDirectoryScriptPath,
    "Select backup directory",
    selectedBackupDirVarName,
    batchExitProgram
  )}\n`;
  outputString += `${batchShowCommands}\n`;
  outputString += `${binaryName}.exe ${
    CliOption.CONFIG_DIRECTORY
  } "${defaultConfigDir(true)}" ${
    CliOption.CREATE_BACKUP
  } "%${selectedBackupDirVarName}%" %*\n`;
  outputString += `${batchHideCommands}\n`;
  outputString += `${batchWaitForKeypress}\n`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(outputPath, outputString);
};

export const createWindowsInstallerScriptFileImport = async (
  outputPath: string,
  powershellSelectDirectoryScriptPath: string
): Promise<void> => {
  let outputString = "";
  outputString += `${batchHideCommands}\n`;
  const selectedBackupDirVarName = "SelectedBackupDir";
  outputString += `${await batchSelectFolderDialog(
    powershellSelectDirectoryScriptPath,
    "Select backup directory to import",
    selectedBackupDirVarName,
    batchExitProgram
  )}\n`;
  outputString += `${batchShowCommands}\n`;
  outputString += `${binaryName}.exe ${
    CliOption.CONFIG_DIRECTORY
  } "${defaultConfigDir(true)}" ${
    CliOption.IMPORT_BACKUP
  } "%${selectedBackupDirVarName}%" %*\n`;
  outputString += `${batchHideCommands}\n`;
  outputString += `${batchWaitForKeypress}\n`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(outputPath, outputString);
};
