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
  getEnvVariableValueOrDefault,
  printEnvVariablesToConsole,
} from "./env";
import { defaultMacros, defaultMacrosOptional } from "./info/macros";
import { defaultPlugins, defaultPluginsOptional } from "./info/plugins";
import { ENV_PREFIX, EnvVariable, envVariableInformation } from "./info/env";
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
import { genericStringSorter } from "./other/genericStringSorter";
import { getVersionFromObject } from "./version";
import { main } from "./main";
import { version } from "./info/version";

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
    if (cliOptions.createExampleFiles) {
      const logger = createConsoleLogger(
        name,
        getEnvVariableValueOrDefault(
          EnvVariable.LOGGING_CONSOLE_LOG_LEVEL,
          configDir
        )
      );
      await Promise.all([
        createEnvVariableDocumentation(
          path.join(configDir, fileNameEnvExample),
          configDir
        ),
        createStringsVariableDocumentation(
          path.join(configDir, fileNameEnvStringsExample),
          defaultStringMap,
          defaultPlugins,
          defaultMacros,
          defaultPluginsOptional,
          defaultMacrosOptional,
          logger
        ),
        createCustomCommandsBroadcastsDocumentation(
          path.join(configDir, fileNameCustomCommandsBroadcastsExample)
        ),
      ]);
      process.exit(0);
    }
    if (cliOptions.exportData !== undefined) {
      for (const exportData of cliOptions.exportData) {
        console.log(
          `TODO Export data '${exportData.type}'${
            exportData.json ? " in JSON format" : ""
          } to ${
            exportData.outputFile ? `'${exportData.outputFile}'` : "console"
          }`
        );
        if (exportData.outputFile === undefined) {
          console.log("TODO");
          process.exit(0);
        }
      }
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

    // Print for debugging the (private/secret) environment values to the console
    // (censor critical variables if not explicitly enabled)
    printEnvVariablesToConsole(configDir, !cliOptions.disableCensoring);

    // Create logger
    const logDir = path.resolve(
      configDir,
      getEnvVariableValueOrDefault(
        EnvVariable.LOGGING_DIRECTORY_PATH,
        configDir
      )
    );
    const logger = createLogger(
      name,
      logDir,
      getEnvVariableValueOrDefault(
        EnvVariable.LOGGING_CONSOLE_LOG_LEVEL,
        configDir
      ),
      getEnvVariableValueOrDefault(
        EnvVariable.LOGGING_FILE_LOG_LEVEL,
        configDir
      )
    );
    const logIndex = createLogFunc(logger, LOG_ID);

    // Call main method
    try {
      logIndex.info(`${name} ${versionString} was started (logs: '${logDir}')`);
      logIndex.debug(`Config directory: '${configDir}'`);
      logIndex.debug(`Node versions: '${JSON.stringify(process.versions)}'`);
      await main(logger, configDir, logDir);
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
