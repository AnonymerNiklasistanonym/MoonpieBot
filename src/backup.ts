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
import type { Logger } from "winston";

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
  const configToImport = getMoonpieConfigFromEnv(backupDir);
  const configUpdated = getMoonpieConfigFromEnv(configDir, {
    resetDatabaseFilePaths: true,
  });
  // Copy and overwrite all supported files and if they would overwrite existing files with
  // the same name save the old files in a new directory
  const backupDirCurrentConfig = path.join(
    configDir,
    generateOutputDirNameOldConfig()
  );
  const filesToCopy = [
    {
      new: path.join(configDir, fileNameEnv),
      old: path.join(backupDir, fileNameEnv),
    },
    {
      new: path.join(configDir, fileNameEnvStrings),
      old: path.join(backupDir, fileNameEnvStrings),
    },
    {
      new: path.join(configDir, `${fileNameEnv}.original`),
      old: path.join(backupDir, fileNameEnv),
    },
    {
      new: path.join(configDir, `${fileNameEnvStrings}.original`),
      old: path.join(backupDir, fileNameEnvStrings),
    },
  ];
  const possibleDatabases = [
    [
      configToImport.customCommandsBroadcasts?.databasePath,
      configUpdated.customCommandsBroadcasts?.databasePath,
    ],
    [configToImport.moonpie?.databasePath, configUpdated.moonpie?.databasePath],
    [configToImport.osuApi?.databasePath, configUpdated.osuApi?.databasePath],
    [configToImport.spotify?.databasePath, configUpdated.spotify?.databasePath],
  ];
  for (const [dbBackup, db] of possibleDatabases) {
    if (dbBackup && db) {
      filesToCopy.push({ new: db, old: dbBackup });
    }
  }
  await copyFiles(filesToCopy, backupDirCurrentConfig, logger);
  // Overwrite the backed up configs with the parsed and updated config
  // (Updated to fix for example paths or deprecated variables)
  logger.info(`Create updated '${fileNameEnv}' in '${configDir}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.join(configDir, fileNameEnv),
    await exportDataEnv(configDir, false, {
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
  logger.info(`Create backup in '${backupDir}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(backupDir, { recursive: true });
  // ENV variables (reset the database paths)
  logger.info(`Create '${fileNameEnv}' in '${backupDir}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.join(backupDir, fileNameEnv),
    await exportDataEnv(configDir, false, { resetDatabaseFilePaths: true })
  );
  logger.info(`Create '${fileNameEnvStrings}' in '${backupDir}'...`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.join(backupDir, fileNameEnvStrings),
    await exportDataEnvStrings(configDir)
  );
  // Databases (reset their paths and copy them)
  const config = getMoonpieConfigFromEnv(configDir);
  const configDbReset = getMoonpieConfigFromEnv(configDir, {
    resetDatabaseFilePaths: true,
  });
  const databasesToBackup = [
    [
      config.customCommandsBroadcasts?.databasePath,
      configDbReset.customCommandsBroadcasts?.databasePath,
    ],
    [config.moonpie?.databasePath, configDbReset.moonpie?.databasePath],
    [config.osuApi?.databasePath, configDbReset.osuApi?.databasePath],
    [config.spotify?.databasePath, configDbReset.spotify?.databasePath],
  ];
  for (const [db, dbReset] of databasesToBackup) {
    if (db && dbReset && (await fileExists(db))) {
      const newDb = path.join(backupDir, path.relative(configDir, dbReset));
      logger.info(`Copy database '${db}' to '${newDb}'...`);
      await fs.copyFile(db, newDb);
    }
  }
};
