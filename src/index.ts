/*
 * Entry point of the bot that handles CLI options and prepares the necessary
 * basic functions like the process name, logger, configuration directory, ...
 */

// Package imports
import path from "path";
import dotenv from "dotenv";
import { mkdirSync } from "fs";
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
} from "./env";
import { createLogFunc, createLogger } from "./logging";
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

// Check if this file is the entry point, otherwise don't run the main method
const isEntryPoint = () => require.main === module;
if (isEntryPoint()) {
  void (async () => {
    try {
      // Change the title of the process/terminal
      process.title = `${name} ${getVersion()}`;

      // Get additional command line arguments
      // $ npm run start -- --argument
      // $ node . --argument
      // $ programName --argument
      const commandLineArgs = process.argv.slice(2);

      // Catch CLI version request
      if (commandLineArgs.includes(CliOption.VERSION)) {
        console.log(getVersion());
        process.exit(0);
      }

      // Catch custom config directory
      let configDir: string;
      if (commandLineArgs.includes(CliOption.CONFIG_DIRECTORY)) {
        const lastIndexOfConfigDir =
          commandLineArgs.lastIndexOf(CliOption.CONFIG_DIRECTORY) + 1;
        if (lastIndexOfConfigDir >= commandLineArgs.length) {
          throw Error(
            `${CliOption.CONFIG_DIRECTORY} > Config directory argument is missing`
          );
        }
        // eslint-disable-next-line security/detect-object-injection
        configDir = commandLineArgs[lastIndexOfConfigDir];
        // Create config directory if it doesn't exist
        mkdirSync(configDir, { recursive: true });
      } else {
        configDir = process.cwd();
      }

      // Catch CLI help request
      if (commandLineArgs.includes(CliOption.HELP)) {
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

      // Catch CLI example file creation request
      if (commandLineArgs.includes(CliOption.CREATE_EXAMPLE_FILES)) {
        await createExampleFiles(configDir);
        process.exit(0);
      }

      // Load environment variables if existing from the .env file
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
        !commandLineArgs.includes(CliOption.DISABLE_CENSORING)
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
      const logMain = createLogFunc(logger, LOG_ID_MODULE_INDEX);

      // Call main method
      try {
        logMain.info(`${name} ${getVersion()} was started (logs: '${logDir}')`);
        logMain.debug(`Config directory: '${configDir}'`);
        logMain.debug(`Node versions: '${JSON.stringify(process.versions)}'`);
        await main(logger, configDir, logDir);
        logMain.debug(`${name} was closed`);
      } catch (err) {
        logMain.error(err as Error);
        logMain.debug(`${name} was closed after unexpected error`);
        throw err;
      }
    } catch (err) {
      console.error(err);
      console.log("Application was terminated because of a run time error");
      console.log("For more detailed information check the log files");
      process.exit(1);
    }
  })();
}
