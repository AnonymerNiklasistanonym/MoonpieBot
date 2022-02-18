/* eslint-disable @typescript-eslint/restrict-template-expressions */
//export const app = process.env.LOG_LEVEL;

// Load local environment variables from `.env` file
import dotenv from "dotenv";
dotenv.config();

// connections
import { createLogger } from "./logging";
import { createTwitchClient } from "./twitch";
// commands
import { commandMoonpieSet0, commandMoonpieSet24 } from "./commands/moonpie";
import { setupTables, setupInitialData } from "./moonpiedb/setupDatabase";
import * as path from "path";
import { ErrorCodeOpen } from "./database";
import { moonpieChatHandler } from "./moonpieChatHandler";

for (const VARIABLE_NAME of [
  "TWITCH_CHANNEL",
  "TWITCH_NAME",
  "TWITCH_OAUTH_TOKEN",
  "CONFIG_TIMEZONE",
  "DB_FILEPATH",
]) {
  console.log(
    `MOONPIE_CONFIG_${VARIABLE_NAME}=${
      process.env["MOONPIE_CONFIG_" + VARIABLE_NAME]
    }`
  );
}

const logger = createLogger();
logger.info("Start MoonpieBot");

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
      await setupInitialData(databasePath, logger);
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
      ).catch(logger.error);

      if (message.trim().toLowerCase().startsWith("!setmoonpie0")) {
        console.log(tags);
        client
          .say(channel, "DEV command: Your moonpie entry was deleted")
          .catch((err) => logger.error(err));
        commandMoonpieSet0(
          client,
          channel,
          tags.username,
          tags["user-id"],
          tags.id,
          databasePath,
          logger
        ).catch((err) => {
          logger.error(err);
        });
      }
      if (message.trim().toLowerCase().startsWith("!setmoonpie24")) {
        // TODO Use a list of approved users
        commandMoonpieSet24(
          client,
          channel,
          tags.username,
          tags["user-id"],
          tags.id,
          databasePath,
          logger
        ).catch((err) => {
          logger.error(err);
        });
      }
    });
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
