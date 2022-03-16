// Package imports
import dotenv from "dotenv";
import * as path from "path";
import { promises as fs } from "fs";
import irc from "irc";
import { ApiClient } from "@twurple/api";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
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
import { checkCustomCommand } from "./other/customCommand";
import { registerTimer } from "./other/customTimer";
import { isProcessRunning } from "./other/processInformation";
// Type imports
import type { Logger } from "winston";
import type { ErrorWithCode } from "./error";

/** Path to the root directory of the source code. */
const pathToRootDir = path.join(__dirname, "..");

// TODO Move to database tables so they can be changed on the fly
const pathCustomTimers = path.join(pathToRootDir, "customTimers.json");
const pathCustomCommands = path.join(pathToRootDir, "customCommands.json");
const fileExists = async (path: string) =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  !!(await fs.stat(path).catch(() => false));
interface CustomTimerJson {
  name?: string;
  channels: string[];
  message: string;
  cronString: string;
}
interface CustomCommandJson {
  name?: string;
  channels: string[];
  message: string;
  regexString: string;
  count?: number;
  userLevel?: "broadcaster" | "mod" | "vip" | "everyone";
}

/**
 * Main method that runs the bot.
 *
 * @param logger Logger (used for global logs).
 * @param logDir The directory in which the logs should be saved.
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
  const osuIrcPassword = getCliVariableValueDefault(
    CliVariable.OSU_IRC_PASSWORD,
    undefined
  );
  const osuIrcUsername = getCliVariableValueDefault(
    CliVariable.OSU_IRC_USERNAME,
    undefined
  );
  const osuIrcRequestTarget = getCliVariableValueDefault(
    CliVariable.OSU_IRC_REQUEST_TARGET,
    undefined
  );
  const enableOsuIrc =
    osuIrcPassword !== undefined &&
    osuIrcUsername !== undefined &&
    osuIrcRequestTarget !== undefined;

  let osuIrcBot: (() => irc.Client) | undefined = undefined;
  if (enableOsu && enableOsuBeatmapRecognition && enableOsuIrc) {
    // TODO Handle authentication errors
    osuIrcBot = () => {
      const creationDate = new Date().toISOString();
      const osuIrcBotInstance = new irc.Client("irc.ppy.sh", osuIrcUsername, {
        channels: [
          /*"#osu"*/
        ],
        password: osuIrcPassword,
        port: 6667,
        autoConnect: false,
      });
      osuIrcBotInstance.addListener(
        "message",
        (from: string, to: string, text: string, message: string) => {
          logger.info(
            "message: " +
              JSON.stringify({ creationDate, from, to, text, message })
          );
        }
      );
      osuIrcBotInstance.addListener(
        "pm",
        (from: string, to: string, text: string, message: string) => {
          logger.info(
            `pm: ${JSON.stringify({ creationDate, from, to, text, message })}`
          );
        }
      );
      osuIrcBotInstance.addListener("error", (message: string) => {
        logger.info(`IRC error: ${JSON.stringify({ creationDate, message })}`);
      });
      osuIrcBotInstance.addListener("registered", (info: string) => {
        logger.info(`Registered: ${JSON.stringify({ creationDate, info })}`);
      });
      osuIrcBotInstance.addListener("selfMessage", (info: string) => {
        logger.info(`Message sent: ${JSON.stringify({ creationDate, info })}`);
      });
      return osuIrcBotInstance;
    };
  }
  if (!enableOsu) {
    logger.info("Osu features are disabled since not all variables were set");
  } else if (!enableOsuBeatmapRecognition) {
    logger.info(
      "Osu beatmap recognition features are disabled since not all variables were set"
    );
  } else if (!enableOsuIrc) {
    logger.info(
      "Osu IRC features are disabled since not all variables were set"
    );
  }

  // Load custom commands
  const customCommands: CustomCommandJson[] = [];
  try {
    if (await fileExists(pathCustomCommands)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(pathCustomCommands);
      customCommands.push(
        ...(JSON.parse(content.toString()) as CustomCommandJson[])
      );
    }
  } catch (err) {
    logger.error(err);
  }

  // Load custom timers
  const customTimers: CustomTimerJson[] = [];
  try {
    if (await fileExists(pathCustomTimers)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(pathCustomTimers);
      customTimers.push(
        ...(JSON.parse(content.toString()) as CustomTimerJson[])
      );
    }
  } catch (err) {
    logger.error(err);
  }

  await moonpieDbSetupTables(databasePath, logger);

  const twitchClientId = getCliVariableValueDefault(
    CliVariable.TWITCH_CLIENT_ID,
    undefined
  );
  const twitchClientSecret = getCliVariableValueDefault(
    CliVariable.TWITCH_CLIENT_SECRET,
    undefined
  );
  const enableTwitchApiCalls =
    twitchClientId !== undefined && twitchClientSecret !== undefined;
  let twitchApiClient: ApiClient | undefined = undefined;
  if (!enableTwitchApiCalls) {
    logger.info(
      "Twitch API features are disabled since not all variables were set"
    );
  } else {
    const authProvider = new ClientCredentialsAuthProvider(
      twitchClientId,
      twitchClientSecret
    );
    twitchApiClient = new ApiClient({
      authProvider,
    });
  }

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
        osuIrcBot,
        osuIrcRequestTarget,
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

    // Check custom commands
    try {
      for (const customCommand of customCommands) {
        checkCustomCommand(
          twitchClient,
          channel,
          tags,
          message,
          customCommand.channels,
          customCommand.message,
          customCommand.regexString,
          customCommand.userLevel,
          customCommand.name,
          customCommand.count ? customCommand.count + 1 : 1,
          twitchApiClient,
          logger
        )
          .then((commandExecuted) => {
            if (commandExecuted) {
              if (customCommand.count === undefined) {
                customCommand.count = 1;
              } else {
                customCommand.count += 1;
              }
              // Save custom command counts to files
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              fs.writeFile(
                pathCustomCommands,
                JSON.stringify(customCommands, undefined, 4)
              )
                .then(() => {
                  logger.info("Custom commands were saved");
                })
                .catch(logger.error);
            }
          })
          .catch(logger.error);
      }
    } catch (err) {
      logger.error(err);
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
    for (const customTimer of customTimers) {
      registerTimer(
        twitchClient,
        customTimer.channels,
        customTimer.message,
        customTimer.cronString,
        twitchApiClient,
        logger
      );
    }
  } catch (err) {
    logger.error(err);
  }

  // Check if IRC bot is working
  if (
    enableOsu &&
    osuIrcBot &&
    osuIrcRequestTarget &&
    (await isProcessRunning("osu"))
  ) {
    try {
      let osuIrcBotInstance: undefined | irc.Client = osuIrcBot();
      logger.info("Try to connect to osu IRC channel");
      osuIrcBotInstance.connect(2, () => {
        logger.info("osu! IRC connection was established");
        osuIrcBotInstance?.say(osuIrcRequestTarget, "UwU");
        osuIrcBotInstance?.disconnect("", () => {
          osuIrcBotInstance?.conn.end();
          osuIrcBotInstance = undefined;
          logger.info(
            `osu! IRC connection was closed": ${JSON.stringify(
              osuIrcBotInstance
            )}`
          );
        });
      });
    } catch (err) {
      logger.error(
        `osu! IRC connection could not be established": ${
          (err as Error).message
        }`
      );
      logger.error(err);
    }
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
