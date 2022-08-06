/*
 * Entry point of the bot that handles CLI options and prepares the necessary
 * basic functions like the process name, logger, configuration directory, ...
 */

// Package imports
import path from "path";
import dotenv from "dotenv";
import { promises as fs } from "fs";
// Local imports
import { CliOption, cliOptionInformation } from "./info/cli";
import {
  ENV_VARIABLE_PREFIX,
  EnvVariable,
  envVariableInformation,
} from "./info/env";
import {
  getEnvVariableValueOrDefault,
  printEnvVariablesToConsole,
  createEnvVariableDocumentation,
} from "./env";
import { createLogFunc, createLogger } from "./logging";
import { createStringsVariableDocumentation, defaultStrings } from "./strings";
import { cliHelpGenerator } from "./cli";
import { genericStringSorter } from "./other/genericStringSorter";
import { getVersion } from "./version";
import { binaryName, name, usages } from "./info/general";
import { createExampleFiles } from "./customCommandsTimers/createExampleFiles";
import { main } from "./main";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_INDEX = "index";

/**
 * The entry point of the bot.
 */
const entryPoint = async () => {
  try {
    // ----------------------------------------------------------
    // Setup process
    // ----------------------------------------------------------

    // Change the title of the process/terminal
    process.title = `${name} ${getVersion()}`;

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
      console.log(getVersion());
      process.exit(0);
    }

    // Catch CLI config directory option
    let configDir = process.cwd();
    if (cliArgs.includes(CliOption.CONFIG_DIRECTORY)) {
      // Get the last index so this argument can be overridden
      const indexConfigDirArg = cliArgs.lastIndexOf(CliOption.CONFIG_DIRECTORY);
      if (indexConfigDirArg + 1 < cliArgs.length) {
        configDir = cliArgs[indexConfigDirArg + 1];
        // Create config directory if it doesn't exist
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(configDir, { recursive: true });
      } else {
        throw Error(
          `Found ${CliOption.CONFIG_DIRECTORY} but no config directory`
        );
      }
    }

    // Catch CLI help option
    if (cliArgs.includes(CliOption.HELP)) {
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
      await createExampleFiles(configDir);
      await createEnvVariableDocumentation(
        path.join(configDir, ".env.example"),
        configDir
      );
      await createStringsVariableDocumentation(
        path.join(configDir, ".env.strings.example"),
        defaultStrings,
      ).catch(console.error);
      process.exit(0);
    }

    // ----------------------------------------------------------
    // Setup necessary globals
    // ----------------------------------------------------------

    // Load user specific environment variables from the .env files
    dotenv.config({
      path: path.join(configDir, ".env"),
    });
    dotenv.config({
      path: path.join(configDir, ".env.strings"),
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
    const logIndex = createLogFunc(logger, LOG_ID_MODULE_INDEX);

    // Call main method
    try {
      logIndex.info(`${name} ${getVersion()} was started (logs: '${logDir}')`);
      logIndex.debug(`Config directory: '${configDir}'`);
      logIndex.debug(`Node versions: '${JSON.stringify(process.versions)}'`);
      await main(logger, configDir, logDir);
      logIndex.debug(`${name} was closed`);
    } catch (err) {
      logIndex.error(err as Error);
      logIndex.debug(`${name} was closed after unexpected error`);
      throw err;
    }
  } catch (err) {
    console.error(err);
    console.log("Application was terminated because of a run time error");
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
