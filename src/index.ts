/* eslint-disable @typescript-eslint/restrict-template-expressions */
//export const app = process.env.LOG_LEVEL;

// Load local environment variables from `.env` file
import dotenv from "dotenv";
dotenv.config();

// connections
import { createLogger } from "./logging";
import {
  createTwitchClient,
  CreateTwitchClientError,
  CreateTwitchClientErrorCode,
} from "./twitch";
// commands
import { setupTables } from "./database/moonpies/setupDatabase";
//import { setupInitialData } from "./moonpiedb/setupDatabase";
import * as path from "path";
import { ErrorCodeOpen } from "./database/core";
import { moonpieChatHandler } from "./moonpieChatHandler";
import { getVersion } from "./version";
import {
  CliVariable,
  getCliVariableValue,
  printCliVariablesToConsole,
} from "./cli";

printCliVariablesToConsole();

const logDir = getCliVariableValue(CliVariable.DIR_LOGS);
const logger = createLogger(logDir);
logger.info(
  `Start MoonpieBot v${getVersion()} (logs will be written to '${logDir}')`
);

try {
  const client = createTwitchClient(
    getCliVariableValue(CliVariable.TWITCH_NAME),
    getCliVariableValue(CliVariable.TWITCH_OAUTH_TOKEN),
    getCliVariableValue(CliVariable.TWITCH_CHANNELS)
      ?.split(" ")
      .filter((a) => a.trim().length !== 0),
    logger
  );

  client
    .connect()
    .then(async (connectionInfo): Promise<void> => {
      logger.info(
        "Successfully connected MoonpieBot to Twitch: " +
          JSON.stringify(connectionInfo)
      );

      // Check if database exists and create it if not
      const databasePath =
        process.env.MOONPIE_CONFIG_DB_FILEPATH !== undefined
          ? process.env.MOONPIE_CONFIG_DB_FILEPATH
          : path.join(__dirname, "..", "..", "moonpie.db");
      try {
        await setupTables(databasePath, logger);
        //await setupInitialData(databasePath, logger);
      } catch (err) {
        if (err === ErrorCodeOpen.SQLITE_CANTOPEN) {
          logger.error(`The database '${databasePath}' could not be opened`);
          throw err;
        }
      }

      // Read all messages
      client.on("message", (channel, tags, message, self) => {
        // Ignore echoed messages.
        if (self) return;

        // Handle moonpie messages
        moonpieChatHandler(
          client,
          channel,
          tags,
          message,
          databasePath,
          logger
        ).catch((err) => {
          logger.error(err);
          client
            .say(channel, `@${tags.username} Error: ${(err as Error).message}`)
            .catch(logger.error);
        });
      });
    })
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
} catch (err) {
  logger.error(err);
  process.exit(1);
}
