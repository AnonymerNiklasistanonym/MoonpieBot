/* eslint-disable @typescript-eslint/restrict-template-expressions */
//export const app = process.env.LOG_LEVEL;

// Load local environment variables from `.env` file
import dotenv from "dotenv";
dotenv.config();

// connections
import { createLogger } from "./logging";
import { createTwitchClient } from "./twitch";
// commands
import { moonpieDbSetupTables } from "./database/moonpieDb";
import * as path from "path";
import { moonpieChatHandler } from "./commands/moonpie";
import { name } from "./info";
import { getVersion } from "./version";
import {
  CliVariable,
  getCliVariableValue,
  getCliVariableValueDefault,
  printCliVariablesToConsole,
} from "./cli";
// Type imports
import type { Logger } from "winston";

const pathToRoot = path.join(__dirname, "..", "..");

const main = async (logger: Logger, logDir: string) => {
  logger.info(`Start ${name} ${getVersion()} (logs directory: '${logDir}')`);

  const databasePath = getCliVariableValueDefault(
    CliVariable.DB_FILEPATH,
    path.join(pathToRoot, "moonpie.db")
  );

  await moonpieDbSetupTables(databasePath, logger);

  const client = createTwitchClient(
    getCliVariableValue(CliVariable.TWITCH_NAME),
    getCliVariableValue(CliVariable.TWITCH_OAUTH_TOKEN),
    getCliVariableValue(CliVariable.TWITCH_CHANNELS)
      ?.split(" ")
      .filter((a) => a.trim().length !== 0),
    logger
  );

  // Get when connecting to chat
  client.on("connecting", (address, port) => {
    logger.info(`Connecting to Twitch: ${address}:${port}`);
  });
  // Get when connected to chat
  client.on("connected", (address, port) => {
    logger.info(`Connected to Twitch: ${address}:${port}`);
  });
  // Get when disconnected from chat
  client.on("disconnected", (reason) => {
    logger.info(`Disconnected from Twitch: ${reason}`);
  });
  // Get when someone joins the chat
  client.on("join", (channel, username, self) => {
    if (self) {
      logger.info(`Joined the Twitch channel "${channel}" as "${username}"`);
    }
  });
  // Get when a message is being written in chat
  client.on("message", (channel, tags, message, self) => {
    // Ignore messages written by the bot
    if (self) return;
    // Handle !moonpie commands
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

  process.on("SIGINT", () => {
    logger.info("SIGINT was detected");
    process.exit();
  });

  // Connect to Twitch
  await client.connect();
};

try {
  printCliVariablesToConsole();

  const logDir = getCliVariableValueDefault(
    CliVariable.DIR_LOGS,
    path.join(pathToRoot, "logs")
  );
  const logger = createLogger(logDir);

  main(logger, logDir).catch((err) => {
    logger.error(err);
    throw err;
  });
} catch (err) {
  console.error(err);
  process.exit(1);
}
