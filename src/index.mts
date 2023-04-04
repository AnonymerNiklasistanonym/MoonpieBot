/* eslint-disable no-console */

/*
 * Entry point of the bot:
 * - handle CLI arguments
 * - load config data
 * - start main method
 */

// Package imports
import path from "path";
// Relative imports
import { createBackup, importBackup } from "./backup.mjs";
import {
  createConsoleLogger,
  createLogFunc,
  createLogger,
  LoggerLevel,
} from "./logging.mjs";
import { defaultMacros, defaultMacrosOptional } from "./info/macros.mjs";
import { defaultPlugins, defaultPluginsOptional } from "./info/plugins.mjs";
import { displayName, name, version } from "./info/general.mjs";
import { dotenvLoadConfig, printEnvVariablesToConsole } from "./env.mjs";
import {
  exportDataCustomCommandsBroadcasts,
  exportDataEnv,
  exportDataEnvStrings,
  exportDataMoonpie,
  exportDataOsuRequests,
} from "./info/export/exportData.mjs";
import {
  fileNameCustomCommandsBroadcastsExample,
  fileNameEnvExample,
  fileNameEnvStringsExample,
} from "./info/files.mjs";
import { createCustomCommandsBroadcastsDocumentation } from "./documentation/customCommandsBroadcasts.mjs";
import { createEnvVariableDocumentation } from "./documentation/envVariableDocumentation.mjs";
import { createJob } from "./createJob.mjs";
import { createStringsVariableDocumentation } from "./documentation/strings.mjs";
import { defaultStringMap } from "./info/strings.mjs";
import { ExportDataTypes } from "./info/export.mjs";
import { getLoggerConfigFromEnv } from "./info/config/loggerConfig.mjs";
import { getMoonpieConfigFromEnv } from "./info/config/moonpieConfig.mjs";
import { main } from "./main.mjs";
import { parseCliArgs } from "./info/cli.mjs";

/**
 * The entry point of the bot.
 */
const entryPoint = async () => {
  // Change the title of the process/terminal
  process.title = `${displayName} ${version}`;

  try {
    // ----------------------------------------------------------
    // Handle CLI options
    // ----------------------------------------------------------
    // $ npm run start -- --argument
    // $ node . --argument
    // $ programName --argument
    // ----------------------------------------------------------
    await parseCliArgs(process.argv, {
      createBackup: async (backupDir, options) => {
        dotenvLoadConfig(options.configDir);
        await createBackup(
          options.configDir,
          backupDir,
          createConsoleLogger(name, LoggerLevel.INFO),
        );
        process.exit(0);
      },
      createExampleFiles: async (outputDir, options) => {
        await Promise.all([
          createJob(
            ".env example",
            path.join(outputDir, fileNameEnvExample),
            createEnvVariableDocumentation(options.configDir),
          ),
          createJob(
            ".env.strings example",
            path.join(outputDir, fileNameEnvStringsExample),
            createStringsVariableDocumentation(
              defaultStringMap,
              defaultPlugins,
              defaultMacros,
              defaultPluginsOptional,
              defaultMacrosOptional,
              createConsoleLogger(name, LoggerLevel.OFF),
            ),
          ),
          createJob(
            "Custom Commands/Broadcasts example",
            path.join(outputDir, fileNameCustomCommandsBroadcastsExample),
            createCustomCommandsBroadcastsDocumentation(),
          ),
        ]);
        process.exit(0);
      },
      exportData: async (type, outputFile, options) => {
        dotenvLoadConfig(options.configDir);

        let data;
        switch (type) {
          case ExportDataTypes.CUSTOM_COMMANDS_BROADCASTS:
            data = await exportDataCustomCommandsBroadcasts(
              options.configDir,
              options.json,
            );
            break;
          case ExportDataTypes.ENV:
            data = await exportDataEnv(options.configDir, options.json);
            break;
          case ExportDataTypes.ENV_STRINGS:
            data = await exportDataEnvStrings(options.configDir, options.json);
            break;
          case ExportDataTypes.MOONPIE:
            data = await exportDataMoonpie(options.configDir, options.json);
            break;
          case ExportDataTypes.OSU_REQUESTS_CONFIG:
            data = await exportDataOsuRequests(options.configDir, options.json);
            break;
        }
        if (outputFile) {
          await createJob(
            `export data '${type}'${options.json ? " (JSON)" : ""}`,
            outputFile,
            data,
          );
        } else {
          console.log(data);
        }
        process.exit(0);
      },
      importBackup: async (backupDir, options) => {
        dotenvLoadConfig(options.configDir);
        await importBackup(
          options.configDir,
          backupDir,
          createConsoleLogger(name, LoggerLevel.INFO),
        );
        process.exit(0);
      },
      main: async (options) => {
        dotenvLoadConfig(options.configDir);

        // ----------------------------------------------------------
        // Setup necessary globals
        // ----------------------------------------------------------

        // Create logger
        const loggerConfig = await getLoggerConfigFromEnv(options.configDir);
        const logDir = path.resolve(options.configDir, loggerConfig.logDir);
        const logger = createLogger(
          displayName,
          logDir,
          loggerConfig.logLevelConsole,
          loggerConfig.logLevelFile,
        );
        const logIndex = createLogFunc(logger, "index");
        logIndex.info(JSON.stringify(options));

        // ----------------------------------------------------------
        // Main method
        // ----------------------------------------------------------

        // Print for debugging the (private/secret) environment values to the console
        // (censor critical variables if not explicitly enabled)
        printEnvVariablesToConsole(
          options.configDir,
          !options.disableCensoring,
        );

        try {
          logIndex.info(
            `${displayName} ${version} was started (logs: '${logDir}')`,
          );
          logIndex.debug(`Config directory: '${options.configDir}'`);
          logIndex.debug(
            `Node versions: '${JSON.stringify(process.versions)}'`,
          );
          await main(logger, await getMoonpieConfigFromEnv(options.configDir));
          logIndex.debug("Main method finished without errors");
        } catch (err) {
          logIndex.error(err as Error);
          logIndex.debug(`${displayName} was closed after unexpected error`);
          throw err;
        }
      },
    });
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

await entryPoint();
