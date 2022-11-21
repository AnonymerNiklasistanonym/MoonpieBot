// Package imports
import dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";
// Local imports
import { copyFileWithBackup, fileExists } from "./other/fileOperations";
import { exportDataEnv, exportDataEnvStrings } from "./info/export/exportData";
import {
  fileNameEnv,
  fileNameEnvStrings,
  generateOutputDirNameOldConfig,
} from "./info/files";
import { getMoonpieConfigFromEnv } from "./info/config/moonpieConfig";
// Type imports
import type { DeepReadonly } from "./other/types";
import type { Logger } from "winston";
import type { MoonpieConfig } from "./info/config/moonpieConfig";

interface CopyFile {
  new: string;
  old: string;
}

export const copyFiles = async (
  files: CopyFile[],
  backupDir: string,
  logger: Logger
): Promise<void> => {
  for (const file of files) {
    logger.info(
      `Copy '${file.old}' to '${file.new}' (backup: '${backupDir}')...`
    );
    await copyFileWithBackup(
      file.old,
      file.new,
      path.join(backupDir, path.basename(file.new)),
      { ignoreSrcDestSameFile: true, ignoreSrcFileNotFound: true }
    );
  }
};

/**
 * Get a list of files that should be copied for a backup.
 *
 * @param backupDir The directory where the backup should be created.
 * @param configDir The current config directory.
 * @param config The current config.
 * @param backupConfig The updated config for the backup.
 * @returns List of files to backup if they exist.
 */
export const getBackupFiles = (
  backupDir: string,
  configDir: string,
  config: DeepReadonly<MoonpieConfig>,
  backupConfig: DeepReadonly<MoonpieConfig>
): CopyFile[] => {
  const filesToCopy: CopyFile[] = [
    {
      new: path.join(backupDir, `${fileNameEnv}.original`),
      old: path.join(configDir, fileNameEnv),
    },
    {
      new: path.join(backupDir, `${fileNameEnvStrings}.original`),
      old: path.join(configDir, fileNameEnvStrings),
    },
    {
      new: path.join(backupDir, fileNameEnv),
      old: path.join(configDir, fileNameEnv),
    },
    {
      new: path.join(backupDir, fileNameEnvStrings),
      old: path.join(configDir, fileNameEnvStrings),
    },
  ];
  const possibleDatabases = [
    [
      config.customCommandsBroadcasts?.databasePath,
      backupConfig.customCommandsBroadcasts?.databasePath,
    ],
    [config.moonpie?.databasePath, backupConfig.moonpie?.databasePath],
    [config.osuApi?.databasePath, backupConfig.osuApi?.databasePath],
    [config.spotify?.databasePath, backupConfig.spotify?.databasePath],
  ];
  for (const [configDb, backupConfigDb] of possibleDatabases) {
    if (configDb && backupConfigDb) {
      filesToCopy.push({ new: backupConfigDb, old: configDb });
    }
  }
  return filesToCopy;
};

/**
 * Import a backup of the bot to the current config directory.
 *
 * @param configDir The config directory where the backup should be imported.
 * @param backupDir The backup directory from which the backup should be imported.
 * @param logger The logger.
 */
export const importBackup = async (
  configDir: string,
  backupDir: string,
  logger: Logger
): Promise<void> => {
  logger.info(`Import backup from '${backupDir}' to '${configDir}'...`);
  // Create config directory if it doesn't exist
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(configDir, { recursive: true });
  // Check if backup directory exists
  if (!(await fileExists(backupDir))) {
    throw Error(`Backup directory '${backupDir}' does not exist!`);
  }
  // Load ENV variables from .env files in backup directory and override
  // all values that were set in the command line with them
  dotenv.config({
    override: true,
    path: path.join(backupDir, fileNameEnv),
  });
  dotenv.config({
    override: true,
    path: path.join(backupDir, fileNameEnvStrings),
  });
  // Get the current backup config (to early exit in case of errors)
  const configToImport = await getMoonpieConfigFromEnv(backupDir);
  const configUpdated = await getMoonpieConfigFromEnv(configDir, {
    resetDatabaseFilePaths: true,
  });
  // Copy and overwrite all supported files and if they would overwrite existing files with
  // the same name save the old files in a new directory
  const backupDirCurrentConfig = path.join(
    configDir,
    generateOutputDirNameOldConfig()
  );
  await copyFiles(
    getBackupFiles(configDir, backupDir, configToImport, configUpdated),
    backupDirCurrentConfig,
    logger
  );
  // Overwrite the backed up configs with the parsed and updated config
  // (Updated to fix for example paths or deprecated variables)
  logger.info(`Create updated '${fileNameEnv}' in '${configDir}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.join(configDir, fileNameEnv),
    await exportDataEnv(configDir, false, {
      removeAttributesStoredInDatabases: true,
      resetDatabaseFilePaths: true,
    })
  );
  logger.info(`Create updated '${fileNameEnvStrings}' in '${configDir}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.join(configDir, fileNameEnvStrings),
    await exportDataEnvStrings(configDir, false)
  );
};

export const createBackup = async (
  configDir: string,
  backupDir: string,
  logger: Logger
): Promise<void> => {
  logger.info(`Create backup in '${backupDir}' from '${configDir}'...`);
  // Create config/backup directory if it doesn't exist
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(backupDir, { recursive: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(configDir, { recursive: true });
  // Get the current backup config (to early exit in case of errors)
  const config = await getMoonpieConfigFromEnv(configDir);
  const backupConfig = await getMoonpieConfigFromEnv(backupDir, {
    removeAttributesStoredInDatabases: true,
    resetDatabaseFilePaths: true,
  });
  // Copy and overwrite all supported files and if they would overwrite existing files with
  // the same name save the old files in a new directory
  const backupDirCurrentConfig = path.join(
    backupDir,
    generateOutputDirNameOldConfig()
  );
  await copyFiles(
    getBackupFiles(backupDir, configDir, config, backupConfig),
    backupDirCurrentConfig,
    logger
  );
  // Overwrite the backed up configs with the parsed and updated config
  // (Updated to fix for example paths or deprecated variables)
  logger.info(`Create updated '${fileNameEnv}' in '${backupDir}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.join(backupDir, fileNameEnv),
    await exportDataEnv(backupDir, false, {
      removeAttributesStoredInDatabases: true,
      resetDatabaseFilePaths: true,
    })
  );
  logger.info(`Create updated '${fileNameEnvStrings}' in '${backupDir}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.join(backupDir, fileNameEnvStrings),
    await exportDataEnvStrings(backupDir, false)
  );
};
