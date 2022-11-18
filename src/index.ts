/* eslint-disable no-console */

/*
 * Entry point of the bot:
 * - handle CLI arguments
 * - load config data
 * - start main method
 */

// Package imports
import dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";
// Local imports
import { binaryName, name, usages } from "./info/general";
import { cliOptionsInformation, parseCliArgs } from "./info/cli";
import { createConsoleLogger, createLogFunc, createLogger } from "./logging";
import {
  createEnvVariableDocumentation,
  printEnvVariablesToConsole,
} from "./env";
import { defaultMacros, defaultMacrosOptional } from "./info/macros";
import { defaultPlugins, defaultPluginsOptional } from "./info/plugins";
import { ENV_PREFIX, envVariableInformation } from "./info/env";
import {
  exportDataCustomCommandsBroadcasts,
  exportDataEnv,
  exportDataEnvStrings,
  exportDataMoonpie,
  exportDataOsuRequests,
} from "./info/export/exportData";
import {
  fileNameCustomCommandsBroadcastsExample,
  fileNameEnv,
  fileNameEnvExample,
  fileNameEnvStrings,
  fileNameEnvStringsExample,
} from "./info/files";
import { cliHelpGenerator } from "./cli";
import { createCustomCommandsBroadcastsDocumentation } from "./documentation/customCommandsBroadcasts";
import { createStringsVariableDocumentation } from "./documentation/strings";
import { defaultStringMap } from "./info/strings";
import { ExportDataTypes } from "./info/export";
import { fileExists } from "./other/fileOperations";
import { genericStringSorter } from "./other/genericStringSorter";
import { getLoggerConfigFromEnv } from "./info/config/loggerConfig";
import { getMoonpieConfigFromEnv } from "./info/config/moonpieConfig";
import { getVersionFromObject } from "./version";
import { main } from "./main";
import { version } from "./info/version";

/**
 * The entry point of the bot.
 */
const entryPoint = async () => {
  // Change the title of the process/terminal
  const versionString = getVersionFromObject(version);
  process.title = `${name} ${versionString}`;
  // Set the default config directory
  let configDir = process.cwd();

  try {
    // ----------------------------------------------------------
    // Handle CLI options
    // ----------------------------------------------------------
    // $ npm run start -- --argument
    // $ node . --argument
    // $ programName --argument
    // ----------------------------------------------------------
    const cliOptions = parseCliArgs(process.argv.slice(2));
    // CLI options that terminate
    if ("showVersion" in cliOptions && cliOptions.showVersion) {
      console.log(versionString);
      process.exit(0);
    }
    if ("showHelp" in cliOptions && cliOptions.showHelp) {
      console.log(
        cliHelpGenerator(
          binaryName,
          usages,
          cliOptionsInformation.sort((a, b) =>
            genericStringSorter(a.name, b.name)
          ),
          envVariableInformation
            .map((a) => ({ ...a, name: `${ENV_PREFIX}${a.name}` }))
            .sort((a, b) => genericStringSorter(a.name, b.name)),
          configDir
        )
      );
      process.exit(0);
    }
    if ("createExampleFiles" in cliOptions && cliOptions.createExampleFiles) {
      const exampleFilesDir = cliOptions.exampleFilesDir
        ? cliOptions.exampleFilesDir
        : configDir;
      console.log(`Create example files in '${exampleFilesDir}'...`);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(exampleFilesDir, { recursive: true });
      await Promise.all([
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(
          path.join(exampleFilesDir, fileNameEnvExample),
          createEnvVariableDocumentation(configDir)
        ),
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(
          path.join(exampleFilesDir, fileNameEnvStringsExample),
          await createStringsVariableDocumentation(
            defaultStringMap,
            defaultPlugins,
            defaultMacros,
            defaultPluginsOptional,
            defaultMacrosOptional,
            createConsoleLogger(name, "off")
          )
        ),
        createCustomCommandsBroadcastsDocumentation(
          path.join(exampleFilesDir, fileNameCustomCommandsBroadcastsExample)
        ),
      ]);
      process.exit(0);
    }

    // ----------------------------------------------------------
    // Load ENV variables from .env files in config directory
    // ----------------------------------------------------------
    if ("customConfigDir" in cliOptions && cliOptions.customConfigDir) {
      configDir = cliOptions.customConfigDir;
      // Create config directory if it doesn't exist
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(configDir, { recursive: true });
    }
    dotenv.config({
      path: path.join(configDir, fileNameEnv),
    });
    dotenv.config({
      path: path.join(configDir, fileNameEnvStrings),
    });

    // ----------------------------------------------------------
    // Create backup
    // ----------------------------------------------------------

    if ("createBackup" in cliOptions && cliOptions.createBackup) {
      const backupDir = cliOptions.backupDir;
      console.log(`Create backup in '${backupDir}'...`);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(backupDir, { recursive: true });
      // ENV variables (reset the database paths)
      console.log(`Create '${fileNameEnv}' file in '${backupDir}'...`);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(
        path.join(backupDir, fileNameEnv),
        await exportDataEnv(configDir, false, { resetDatabaseFilePaths: true })
      );
      console.log(`Create '${fileNameEnvStrings}' file in '${backupDir}'...`);
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
          console.log(`Copy database '${db}' to '${newDb}'...`);
          await fs.copyFile(db, newDb);
        }
      }
      process.exit(0);
    }

    // ----------------------------------------------------------
    // Setup necessary globals
    // ----------------------------------------------------------

    // Create logger
    const loggerConfig = getLoggerConfigFromEnv(configDir);
    const logDir = path.resolve(configDir, loggerConfig.logDir);
    const logger = createLogger(
      name,
      logDir,
      loggerConfig.logLevelConsole,
      loggerConfig.logLevelFile
    );
    const logIndex = createLogFunc(logger, "index");

    // ----------------------------------------------------------
    // Export data
    // ----------------------------------------------------------

    if ("exportData" in cliOptions && cliOptions.exportData !== undefined) {
      for (const exportData of cliOptions.exportData) {
        let data;
        switch (exportData.type.toUpperCase()) {
          case ExportDataTypes.CUSTOM_COMMANDS_BROADCASTS:
            data = await exportDataCustomCommandsBroadcasts(
              configDir,
              exportData.json
            );
            break;
          case ExportDataTypes.ENV:
            data = await exportDataEnv(configDir, exportData.json);
            break;
          case ExportDataTypes.ENV_STRINGS:
            data = await exportDataEnvStrings(configDir, exportData.json);
            break;
          case ExportDataTypes.MOONPIE:
            data = await exportDataMoonpie(configDir, exportData.json);
            break;
          case ExportDataTypes.OSU_REQUESTS_CONFIG:
            data = await exportDataOsuRequests(configDir, exportData.json);
            break;
          default:
            throw Error(`Unknown export data type '${exportData.type}'`);
        }
        if (exportData.outputFile) {
          console.log(
            `Export data '${exportData.type}'${
              exportData.json ? " in JSON format" : ""
            } to '${exportData.outputFile}'...`
          );
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.mkdir(path.dirname(exportData.outputFile), {
            recursive: true,
          });
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.writeFile(exportData.outputFile, data);
        } else {
          console.log(data);
        }
        process.exit(0);
      }
    }

    // ----------------------------------------------------------
    // Main method
    // ----------------------------------------------------------

    // Print for debugging the (private/secret) environment values to the console
    // (censor critical variables if not explicitly enabled)
    printEnvVariablesToConsole(
      configDir,
      !("disableCensoring" in cliOptions && cliOptions.disableCensoring)
    );

    try {
      logIndex.info(`${name} ${versionString} was started (logs: '${logDir}')`);
      logIndex.debug(`Config directory: '${configDir}'`);
      logIndex.debug(`Node versions: '${JSON.stringify(process.versions)}'`);
      const moonpieConfig = getMoonpieConfigFromEnv(configDir);
      await main(logger, moonpieConfig);
      logIndex.debug("Main method finished without errors");
    } catch (err) {
      logIndex.error(err as Error);
      logIndex.debug(`${name} was closed after unexpected error`);
      throw err;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    // eslint-disable-next-line no-console
    console.log("Application was terminated because of a run time error");
    // eslint-disable-next-line no-console
    console.log("For more detailed information check the log files");
    process.exit(1);
  }
};

// Check if this file is the entry point, otherwise don't run the main method
const isEntryPoint = () => require.main === module;
if (isEntryPoint()) {
  // Use this weird thing to get an async entry point function
  void (async () => await entryPoint())();
}
