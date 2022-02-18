/* eslint-disable @typescript-eslint/restrict-template-expressions */
//export const app = process.env.LOG_LEVEL;

// Load local environment variables from `.env` file
import dotenv from "dotenv";
dotenv.config();

// connections
import { createLogger } from "./logging";
import { createTwitchConnection } from "./twitch";
// commands
import { commandHello } from "./commands/hello";
import {
  commandMoonpie,
  commandMoonpieSet0,
  commandMoonpieSet24,
  commandMoonpieTop10,
} from "./commands/moonpie";
import { setupTables, setupInitialData } from "./moonpiedb/setupDatabase";
import * as path from "path";
import { ErrorCodeOpen } from "./database";

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

const client = createTwitchConnection(
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

      // Catch messages that start with '!hello'
      if (message.trim().toLowerCase().startsWith("!hello")) {
        logger.info(
          `Detected command '!hello' by ${tags?.username} in message ${tags?.id}`
        );
        commandHello(client, channel, tags.username, tags.id, logger).catch(
          (err) => {
            logger.error(err);
          }
        );
      }

      // Catch messages that start with '!moonpie'
      if (message.trim().toLowerCase().startsWith("!moonpie")) {
        logger.info(
          `Detected command '!moonpie' by ${tags?.username} in message ${tags?.id}`
        );
        commandMoonpie(
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

      // TODO !setmoonpie

      // TODO !addmoonpie

      // TODO !removemoonpie

      // TODO !moonpieleaderboard

      if (message.trim().toLowerCase().startsWith("!moonpieleaderboard")) {
        commandMoonpieTop10(
          client,
          channel,
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
