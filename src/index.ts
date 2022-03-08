// Package imports
import dotenv from "dotenv";
import * as path from "path";
import { promises as fs } from "fs";
// Local imports
import { createLogger } from "./logging";
import { createTwitchClient } from "./twitch";
import { moonpieDbSetupTables } from "./database/moonpieDb";
import { moonpieChatHandler } from "./commands/moonpie";
import { osuChatHandler } from "./commands/osu";
import { name } from "./info";
import { getVersion } from "./version";
import {
  CliVariable,
  getCliVariableValue,
  getCliVariableValueDefault,
  printCliVariablesToConsole,
} from "./cli";
import { registerTimer } from "./other/timerTest";
// Type imports
import type { Logger } from "winston";
import type { ErrorWithCode } from "./error";

/** Path to the root directory of the source code */
const pathToRootDir = path.join(__dirname, "..", "..");

const pathCustomTimersFile = path.join(__dirname, "..", "customTimers.json");
const fileExists = async (path: string) =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  !!(await fs.stat(path).catch(() => false));
interface CustomTimerJson {
  channels: string[];
  message: string;
  cronString: string;
}

/**
 * Main method that runs the bot
 *
 * @param logger The global logger
 * @param logDir The directory in which the logs should be saved
 */
const main = async (logger: Logger, logDir: string) => {
  logger.info(`Start ${name} ${getVersion()} (logs directory: '${logDir}')`);

  const databasePath = getCliVariableValueDefault(
    CliVariable.DB_FILEPATH,
    path.join(pathToRootDir, "moonpie.db")
  );

  const osuClientId = getCliVariableValueDefault(
    CliVariable.OSU_CLIENT_ID,
    undefined
  );
  const osuClientSecret = getCliVariableValueDefault(
    CliVariable.OSU_CLIENT_SECRET,
    undefined
  );
  const osuDefaultId = getCliVariableValueDefault(
    CliVariable.OSU_DEFAULT_ID,
    undefined
  );
  const enableOsu =
    osuClientId !== undefined &&
    osuClientSecret !== undefined &&
    osuDefaultId !== undefined;
  const enableOsuBeatmapRecognition =
    getCliVariableValueDefault(CliVariable.OSU_RECOGNIZE_MAPS, undefined) ===
    "ON";
  if (!enableOsu) {
    logger.info("Osu features are disabled since not all variables were set");
  }

  await moonpieDbSetupTables(databasePath, logger);

  // Create TwitchClient and listen to certain events
  const twitchClient = createTwitchClient(
    getCliVariableValue(CliVariable.TWITCH_NAME),
    getCliVariableValue(CliVariable.TWITCH_OAUTH_TOKEN),
    getCliVariableValue(CliVariable.TWITCH_CHANNELS)
      ?.split(" ")
      .filter((a) => a.trim().length !== 0),
    logger
  );
  twitchClient.on("connecting", (address, port) => {
    // Triggers when the client is connecting to Twitch
    logger.info(`Connecting to Twitch: ${address}:${port}`);
  });
  twitchClient.on("connected", (address, port) => {
    // Triggers when the client successfully connected to Twitch
    logger.info(`Connected to Twitch: ${address}:${port}`);
  });
  twitchClient.on("disconnected", (reason) => {
    // Triggers when the client was disconnected from Twitch
    logger.info(`Disconnected from Twitch: ${reason}`);
  });
  twitchClient.on("join", (channel, username, self) => {
    // Triggers when a new user joins a Twitch channel that is being listened to
    if (self) {
      // Only catch when the Twitch client itself joins a Twitch channel
      logger.info(`Joined the Twitch channel "${channel}" as "${username}"`);
      // Easter Egg: Spam pyramids on joining the channel
      const channelToSpam = "#ztalx_";
      const emoteToSpam = " ztalxWow ";
      const pyramidHeight = 10;
      if (channel === channelToSpam) {
        for (let i = 0; i < pyramidHeight - 1; i++) {
          twitchClient
            .say(channel, emoteToSpam.repeat(i + 1))
            .catch(console.error);
        }
        for (let i = 0; i < pyramidHeight; i++) {
          twitchClient
            .say(channel, emoteToSpam.repeat(pyramidHeight - i))
            .catch(console.error);
        }
      }
    }
  });
  twitchClient.on("message", (channel, tags, message, self) => {
    // Triggers when a new message is being sent in a Twitch channel that is
    // being listened to

    if (self) {
      // Ignore messages written by the Twitch client
      return;
    }

    // Handle all bot commands
    moonpieChatHandler(
      twitchClient,
      channel,
      tags,
      message,
      databasePath,
      logger
    ).catch((err) => {
      logger.error(err);
      // When the chat handler throws an error write the error message in chat
      const errorInfo = err as ErrorWithCode;
      twitchClient
        .say(
          channel,
          `${tags.username ? "@" + tags.username + " " : ""}Moonpie Error: ${
            errorInfo.message
          }${errorInfo.code ? " (" + errorInfo.code + ")" : ""}`
        )
        .catch(logger.error);
    });

    if (enableOsu) {
      osuChatHandler(
        twitchClient,
        channel,
        tags,
        message,
        {
          clientId: parseInt(osuClientId),
          clientSecret: osuClientSecret,
        },
        parseInt(osuDefaultId),
        enableOsuBeatmapRecognition,
        logger
      ).catch((err) => {
        logger.error(err);
        // When the chat handler throws an error write the error message in chat
        const errorInfo = err as ErrorWithCode;
        twitchClient
          .say(
            channel,
            `${tags.username ? "@" + tags.username + " " : ""}Osu Error: ${
              errorInfo.message
            }${errorInfo.code ? " (" + errorInfo.code + ")" : ""}`
          )
          .catch(logger.error);
      });
    }
  });

  process.on("SIGINT", () => {
    // When the process is being force closed catch that and close safely
    logger.info("SIGINT was detected");
    process.exit();
  });

  // Connect Twitch client to Twitch
  await twitchClient.connect();

  // Register custom timers
  try {
    if (await fileExists(pathCustomTimersFile)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(pathCustomTimersFile);
      const customTimers = JSON.parse(content.toString()) as CustomTimerJson[];
      for (const customTimer of customTimers) {
        registerTimer(
          twitchClient,
          customTimer.channels,
          customTimer.message,
          customTimer.cronString,
          logger
        );
      }
    }
  } catch (err) {
    logger.error(err);
  }
};

// Check if this file is the entry point, otherwise don't run the main method
const isEntryPoint = () => require.main === module;
if (isEntryPoint()) {
  try {
    // Load environment variables if existing from the .env file
    dotenv.config();
    // Print for debugging the (private/secret) environment values to the console
    printCliVariablesToConsole();

    // Create logger
    const logDir = getCliVariableValueDefault(
      CliVariable.DIR_LOGS,
      path.join(pathToRootDir, "logs")
    );
    const logger = createLogger(logDir);

    // Call main method
    main(logger, logDir).catch((err) => {
      logger.error(err);
      throw err;
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
