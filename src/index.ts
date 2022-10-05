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
import { CliOption, cliOptionInformation } from "./info/cli";
import { createConsoleLogger, createLogFunc, createLogger } from "./logging";
import {
  createEnvVariableDocumentation,
  getEnvVariableValueOrDefault,
  printEnvVariablesToConsole,
} from "./env";
import { defaultMacros, defaultMacrosOptional } from "./messageParser/macros";
import {
  defaultPlugins,
  defaultPluginsOptional,
} from "./messageParser/plugins";
import {
  ENV_VARIABLE_PREFIX,
  EnvVariable,
  envVariableInformation,
} from "./info/env";
import {
  fileNameEnv,
  fileNameEnvExample,
  fileNameEnvStrings,
  fileNameEnvStringsExample,
} from "./info/fileNames";
import { cliHelpGenerator } from "./cli";
import { createStringsVariableDocumentation } from "./documentation/strings";
import { defaultStringMap } from "./strings";
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

    // Catch CLI version option
    if (cliArgs.includes(CliOption.VERSION)) {
      // eslint-disable-next-line no-console
      console.log(versionString);
      process.exit(0);
    }

    // Catch CLI config directory option
    let configDir = process.cwd();
    if (cliArgs.includes(CliOption.CONFIG_DIRECTORY)) {
      // Get the last index so this argument can be overridden
      const indexConfigDirArg =
        cliArgs.lastIndexOf(CliOption.CONFIG_DIRECTORY) + 1;
      // Make sure the a config directory can follow in the next argument
      if (indexConfigDirArg < cliArgs.length) {
        // eslint-disable-next-line security/detect-object-injection
        configDir = cliArgs[indexConfigDirArg];
        // Create config directory if it doesn't exist
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(configDir, { recursive: true });
      } else {
        throw Error(
          `Found '${CliOption.CONFIG_DIRECTORY}' but no config directory`
        );
      }
    }

    // Catch CLI help option
    if (cliArgs.includes(CliOption.HELP)) {
      // eslint-disable-next-line no-console
      console.log(
        cliHelpGenerator(
          binaryName,
          usages,
          cliOptionInformation.sort((a, b) =>
            genericStringSorter(a.name, b.name)
          ),
          envVariableInformation
            .map((a) => ({ ...a, name: `${ENV_VARIABLE_PREFIX}${a.name}` }))
            .sort((a, b) => genericStringSorter(a.name, b.name)),
          configDir
        )
      );
      process.exit(0);
    }

    // Catch CLI create example files option
    if (cliArgs.includes(CliOption.CREATE_EXAMPLE_FILES)) {
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

    // Print for debugging the (private/secret) environment values to the console
    // (censor critical variables if not explicitly enabled)
    printEnvVariablesToConsole(
      configDir,
      !cliArgs.includes(CliOption.DISABLE_CENSORING)
    );

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
