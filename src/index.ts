/* eslint-disable no-console */

/*
 * Entry point of the bot that handles CLI options and prepares the necessary
 * basic functions like the process name, logger, configuration directory, ...
 */

// Package imports
import dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";
// Local imports
import { binaryName, name, usages } from "./info/general";
import { cliOptionsInformation, parseCliOptions } from "./info/cli";
import { createConsoleLogger, createLogFunc, createLogger } from "./logging";
import {
  createEnvVariableDocumentation,
  printEnvVariablesToConsole,
} from "./env";
import { defaultMacros, defaultMacrosOptional } from "./info/macros";
import { defaultPlugins, defaultPluginsOptional } from "./info/plugins";
import { ENV_PREFIX, envVariableInformation } from "./info/env";
import {
  fileNameCustomCommandsBroadcastsExample,
  fileNameEnv,
  fileNameEnvExample,
  fileNameEnvStrings,
  fileNameEnvStringsExample,
} from "./info/files";
import {
  getMoonpieConfigFromEnv,
  getMoonpieConfigMoonpieFromEnv,
} from "./info/config/moonpieConfig";
import { cliHelpGenerator } from "./cli";
import { createCustomCommandsBroadcastsDocumentation } from "./documentation/customCommandsBroadcasts";
import { createStringsVariableDocumentation } from "./documentation/strings";
import { defaultStringMap } from "./info/strings";
import { genericStringSorter } from "./other/genericStringSorter";
import { getLoggerConfigFromEnv } from "./info/config/loggerConfig";
import { getVersionFromObject } from "./version";
import { main } from "./main";
import moonpieDb from "./database/moonpieDb";
import { updateStringsMapWithCustomEnvStrings } from "./messageParser";
import { version } from "./info/version";
import { writeTextFile } from "./other/fileOperations";

/**
 * The logging ID of this module.
 */
const LOG_ID = "index";

/**
 * The entry point of the bot.
 */
const entryPoint = async () => {
  try {
    // ----------------------------------------------------------
    // Setup process
    // ----------------------------------------------------------

    // Change the title of the process/terminal
    const versionString = getVersionFromObject(version);
    process.title = `${name} ${versionString}`;

    // ----------------------------------------------------------
    // Handle CLI options
    // ----------------------------------------------------------

    // Get additional command line arguments
    // $ npm run start -- --argument
    // $ node . --argument
    // $ programName --argument
    const cliArgs = process.argv.slice(2);
    const cliOptions = parseCliOptions(cliArgs);
    let configDir = process.cwd();

    if (cliOptions.showVersion) {
      console.log(versionString);
      process.exit(0);
    }
    if (cliOptions.showHelp) {
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
    if (cliOptions.customConfigDir !== undefined) {
      configDir = cliOptions.customConfigDir;
      // Create config directory if it doesn't exist
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(configDir, { recursive: true });
    }
    if (cliOptions.createBackup !== undefined) {
      // TODO
      console.log(
        `TODO Create backup in '${cliOptions.createBackup.backupDir}'...`
      );
      process.exit(0);
    }
    if (cliOptions.createExampleFiles) {
      const exampleFilesDir = cliOptions.exampleFilesDir
        ? cliOptions.exampleFilesDir
        : configDir;
      console.log(`Create example files in '${exampleFilesDir}'...`);
      await Promise.all([
        createEnvVariableDocumentation(
          path.join(exampleFilesDir, fileNameEnvExample),
          configDir
        ),
        createStringsVariableDocumentation(
          path.join(exampleFilesDir, fileNameEnvStringsExample),
          defaultStringMap,
          defaultPlugins,
          defaultMacros,
          defaultPluginsOptional,
          defaultMacrosOptional,
          createConsoleLogger(name, "off")
        ),
        createCustomCommandsBroadcastsDocumentation(
          path.join(exampleFilesDir, fileNameCustomCommandsBroadcastsExample)
        ),
      ]);
      process.exit(0);
    }

    // ----------------------------------------------------------
    // Setup necessary globals
    // ----------------------------------------------------------

    // Load user specific environment variables from the .env files
    dotenv.config({
      path: path.join(configDir, fileNameEnv),
    });
    dotenv.config({
      path: path.join(configDir, fileNameEnvStrings),
    });

    // Create logger
    const loggerConfig = getLoggerConfigFromEnv(configDir);
    const logDir = path.resolve(configDir, loggerConfig.logDir);
    const logger = createLogger(
      name,
      logDir,
      loggerConfig.logLevelConsole,
      loggerConfig.logLevelFile
    );
    const logIndex = createLogFunc(logger, LOG_ID);

    // ----------------------------------------------------------
    // Export data
    // ----------------------------------------------------------

    if (cliOptions.exportData !== undefined) {
      // TODO
      for (const exportData of cliOptions.exportData) {
        let data = "TODO";
        switch (exportData.type.toLowerCase()) {
          case "env":
            if (exportData.json) {
              data = JSON.stringify({
                configDir,
                loggerConfig: getLoggerConfigFromEnv(configDir),
                moonpieConfig: getMoonpieConfigFromEnv(configDir),
              });
            }
            break;
          case "env_strings":
            if (exportData.json) {
              const updatedStrings = Array.from(
                updateStringsMapWithCustomEnvStrings(
                  defaultStringMap,
                  createConsoleLogger(name, "off")
                )
              );
              data = JSON.stringify({
                customStrings: updatedStrings
                  .filter((a) => a[1].updated === true && a[1].custom === true)
                  .map((a) => ({ id: a[0], value: a[1].default })),
                defaultStrings: Array.from(defaultStringMap).map((a) => ({
                  ...a[1],
                  id: a[0],
                })),
                updatedStrings: updatedStrings
                  .filter((a) => a[1].updated === true && a[1].custom !== true)
                  .map((a) => ({ id: a[0], value: a[1].default })),
              });
            }
            break;
          case "moonpie":
            if (exportData.json) {
              const config = getMoonpieConfigMoonpieFromEnv(configDir);
              await moonpieDb.setup(
                config.databasePath,
                createConsoleLogger(name, "off")
              );
              data = JSON.stringify({
                databasePath: config.databasePath,
                moonpieCounts:
                  await moonpieDb.backup.exportMoonpieCountTableToJson(
                    config.databasePath,
                    createConsoleLogger(name, "off")
                  ),
              });
            }
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
          await writeTextFile(exportData.outputFile, data);
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
    printEnvVariablesToConsole(configDir, !cliOptions.disableCensoring);

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
