/* eslint-disable @typescript-eslint/restrict-template-expressions */
//export const app = process.env.LOG_LEVEL;

// Load local environment variables from `.env` file
import dotenv from "dotenv";
dotenv.config();

// connections
import { createLogger } from "./logging";
import { createTwitchClient } from "./twitch";
// commands
import { setupTables } from "./database/moonpies/setupDatabase";
//import { setupInitialData } from "./moonpiedb/setupDatabase";
import * as path from "path";
import { ErrorCodeOpen } from "./database/core";
import { moonpieChatHandler } from "./moonpieChatHandler";
import { moonpieBotVersion } from "./version";

for (const VARIABLE_NAME of [
  "DIR_LOGS",
  "CONSOLE_LOG_LEVEL",
  "FILE_LOG_LEVEL",
  "TWITCH_CHANNEL",
  "TWITCH_NAME",
  "TWITCH_OAUTH_TOKEN",
  "DB_FILEPATH",
]) {
  console.log(
    `MOONPIE_CONFIG_${VARIABLE_NAME}=${
      process.env["MOONPIE_CONFIG_" + VARIABLE_NAME]
    }`
  );
}

const logger = createLogger(process.env.MOONPIE_CONFIG_DIR_LOGS);
logger.info(
  `Start MoonpieBot v${moonpieBotVersion.major}.${moonpieBotVersion.minor}.${moonpieBotVersion.patch}`
);

const client = createTwitchClient(
  `${process.env.MOONPIE_CONFIG_TWITCH_NAME}`,
  `${process.env.MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN}`,
  [`${process.env.MOONPIE_CONFIG_TWITCH_CHANNEL}`],
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
