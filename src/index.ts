// Package imports
import dotenv from "dotenv";
import * as path from "path";
import { promises as fs } from "fs";
import irc from "irc";
import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
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
  getCliVariableValueOrDefault,
  getCliVariableValueOrCustomDefault,
  printCliVariablesToConsole,
  writeCliVariableDocumentation,
} from "./cli";
import { checkCustomCommand } from "./other/customCommand";
import { registerTimer } from "./other/customTimer";
import { isProcessRunning } from "./other/processInformation";
import { parseTwitchBadgeLevel } from "./other/twitchBadgeParser";
import { pyramidSpammer } from "./other/pyramidSpammer";
import { createStreamCompanionConnection } from "./streamcompanion";
import { createOsuIrcConnection } from "./osuirc";
// Type imports
import type { Logger } from "winston";
import type { ErrorWithCode } from "./error";
import type { StreamCompanionData } from "./streamcompanion";

/** Path to the root directory of the source code. */
//const pathToRootDir = path.join(__dirname, "..");
/** Path to the directory where the bot is executed from. */
const pathToCwdDir = process.cwd();

// TODO Move to database tables so they can be changed on the fly
const pathCustomTimers = path.join(pathToCwdDir, "customTimers.json");
const pathCustomCommands = path.join(pathToCwdDir, "customCommands.json");
const fileExists = async (path: string) =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  !!(await fs.stat(path).catch(() => false));
interface CustomTimerJson {
  name?: string;
  channels: string[];
  message: string;
  cronString: string;
}
interface CustomTimerDataJson {
  timers: CustomTimerJson[];
}
interface CustomCommandJson {
  name?: string;
  channels: string[];
  message: string;
  regexString: string;
  count?: number;
  userLevel?: "broadcaster" | "mod" | "vip" | "everyone";
}
interface CustomCommandDataJson {
  commands: CustomCommandJson[];
}

/**
 * Main method that runs the bot.
 *
 * @param logger Logger (used for global logs).
 * @param logDir The directory in which the logs should be saved.
 */
const main = async (logger: Logger, logDir: string) => {
  logger.info(`Start ${name} ${getVersion()} (logs directory: '${logDir}')`);

  await writeCliVariableDocumentation(path.join(pathToCwdDir, ".env.example"));

  const databasePath = getCliVariableValueOrDefault(
    CliVariable.MOONPIE_DATABASE_PATH
  );

  const osuApiClientId = getCliVariableValueOrCustomDefault(
    CliVariable.OSU_API_CLIENT_ID,
    undefined
  );
  const osuApiClientSecret = getCliVariableValueOrCustomDefault(
    CliVariable.OSU_API_CLIENT_SECRET,
    undefined
  );
  const osuApiDefaultId = getCliVariableValueOrCustomDefault(
    CliVariable.OSU_API_DEFAULT_ID,
    undefined
  );
  const enableOsu =
    osuApiClientId !== undefined &&
    osuApiClientSecret !== undefined &&
    osuApiDefaultId !== undefined;
  const enableOsuBeatmapRequests =
    getCliVariableValueOrDefault(CliVariable.OSU_API_RECOGNIZE_MAP_REQUESTS) ===
    "ON";
  const enableOsuBeatmapRequestsDetailed =
    getCliVariableValueOrDefault(
      CliVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED
    ) === "ON";
  const osuIrcPassword = getCliVariableValueOrCustomDefault(
    CliVariable.OSU_IRC_PASSWORD,
    undefined
  );
  const osuIrcUsername = getCliVariableValueOrCustomDefault(
    CliVariable.OSU_IRC_USERNAME,
    undefined
  );
  const osuIrcRequestTarget = getCliVariableValueOrCustomDefault(
    CliVariable.OSU_IRC_REQUEST_TARGET,
    undefined
  );
  const enableOsuIrc =
    osuIrcPassword !== undefined &&
    osuIrcUsername !== undefined &&
    osuIrcRequestTarget !== undefined;

  let osuIrcBot: (() => irc.Client) | undefined = undefined;
  if (enableOsu && enableOsuBeatmapRequests && enableOsuIrc) {
    osuIrcBot = () =>
      createOsuIrcConnection(osuIrcUsername, osuIrcPassword, logger);
  }
  const osuStreamCompanionUrl = getCliVariableValueOrCustomDefault(
    CliVariable.OSU_STREAM_COMPANION_URL,
    undefined
  );
  let osuStreamCompanionCurrentMapData:
    | (() => StreamCompanionData | undefined)
    | undefined = undefined;
  if (osuStreamCompanionUrl !== undefined) {
    osuStreamCompanionCurrentMapData = createStreamCompanionConnection(
      osuStreamCompanionUrl,
      logger
    );
  }
  if (!enableOsu && osuStreamCompanionCurrentMapData !== undefined) {
    logger.info(
      "Osu features besides the StreamCompanion integration are disabled since not all variables were set"
    );
  } else if (!enableOsu) {
    logger.info("Osu features are disabled since not all variables were set");
  } else {
    if (!enableOsuBeatmapRequests) {
      logger.info(
        "Osu beatmap recognition features are disabled since not all variables were set"
      );
    } else if (!enableOsuIrc) {
      logger.info(
        "Osu IRC features are disabled since not all variables were set"
      );
    }
    if (osuStreamCompanionCurrentMapData === undefined) {
      logger.info(
        "Osu StreamCompanion beatmap recognition features are disabled since not all variables were set"
      );
    }
  }

  // Load custom commands
  const customCommands: CustomCommandJson[] = [];
  try {
    if (await fileExists(pathCustomCommands)) {
      logger.info("Found custom command file");
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(pathCustomCommands);
      const newCustomCommands = (
        JSON.parse(content.toString()) as CustomCommandDataJson
      ).commands;
      for (const newCustomCommand of newCustomCommands) {
        logger.info(
          `Add custom command ${
            newCustomCommand.name ? newCustomCommand.name : "no-name"
          }: ${newCustomCommand.regexString} => ${newCustomCommand.message}`
        );
      }
      customCommands.push(...newCustomCommands);
    }
  } catch (err) {
    logger.error(err);
  }

  // Load custom timers
  const customTimers: CustomTimerJson[] = [];
  try {
    if (await fileExists(pathCustomTimers)) {
      logger.info("Found custom timers file");
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(pathCustomTimers);
      const newCustomTimers = (
        JSON.parse(content.toString()) as CustomTimerDataJson
      ).timers;
      for (const newCustomTimer of newCustomTimers) {
        logger.info(
          `Add custom command ${
            newCustomTimer.name ? newCustomTimer.name : "no-name"
          }: ${newCustomTimer.message} [${newCustomTimer.cronString}]`
        );
      }
      customTimers.push(...newCustomTimers);
    }
  } catch (err) {
    logger.error(err);
  }

  await moonpieDbSetupTables(databasePath, logger);

  const twitchApiClientId = getCliVariableValueOrCustomDefault(
    CliVariable.TWITCH_API_CLIENT_ID,
    undefined
  );
  const twitchApiAccessToken = getCliVariableValueOrCustomDefault(
    CliVariable.TWITCH_API_ACCESS_TOKEN,
    undefined
  );
  const enableTwitchApiCalls =
    twitchApiClientId !== undefined && twitchApiAccessToken !== undefined;
  let twitchApiClient: ApiClient | undefined = undefined;
  if (!enableTwitchApiCalls) {
    logger.info(
      "Twitch API features are disabled since not all variables were set"
    );
  } else {
    const authProviderScopes = new StaticAuthProvider(
      twitchApiClientId,
      twitchApiAccessToken
    );
    twitchApiClient = new ApiClient({
      authProvider: authProviderScopes,
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
      if (channel === "#ztalx_") {
        pyramidSpammer(twitchClient, channel, "ztalxWow", 10).catch(
          logger.error
        );
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
      getCliVariableValueOrDefault(CliVariable.MOONPIE_ENABLE_COMMANDS)?.split(
        ","
      ),
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
          clientId: parseInt(osuApiClientId),
          clientSecret: osuApiClientSecret,
        },
        parseInt(osuApiDefaultId),
        enableOsuBeatmapRequests,
        enableOsuBeatmapRequestsDetailed,
        osuIrcBot,
        osuIrcRequestTarget,
        osuStreamCompanionCurrentMapData,
        getCliVariableValueOrDefault(CliVariable.OSU_ENABLE_COMMANDS)?.split(
          ","
        ),
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
    } else if (osuStreamCompanionCurrentMapData !== undefined) {
      // Dirty solution to enable !np bot functionality only without any other
      // osu! tokens or credentials, refactor that better in the future
      const enableCommands = getCliVariableValueOrDefault(
        CliVariable.OSU_ENABLE_COMMANDS
      )?.split(",");
      osuChatHandler(
        twitchClient,
        channel,
        tags,
        message,
        undefined,
        0,
        false,
        false,
        undefined,
        undefined,
        osuStreamCompanionCurrentMapData,
        enableCommands === undefined
          ? ["np"]
          : enableCommands.filter((a) => a === "np"),
        logger
      ).catch((err) => {
        logger.error(err);
        // When the chat handler throws an error write the error message in chat
        const errorInfo = err as ErrorWithCode;
        twitchClient
          .say(
            channel,
            `${
              tags.username ? "@" + tags.username + " " : ""
            }Osu StreamCompanion Error: ${errorInfo.message}${
              errorInfo.code ? " (" + errorInfo.code + ")" : ""
            }`
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
          parseTwitchBadgeLevel(tags),
          customCommand.channels,
          customCommand.message,
          customCommand.regexString,
          customCommand.userLevel,
          customCommand.name,
          customCommand.count ? customCommand.count + 1 : 1,
          twitchApiClient,
          // TODO Add macro for StreamCompanion
          // osuStreamCompanionCurrentMapData,
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
                JSON.stringify(
                  {
                    $schema: "./customCommands.schema.json",
                    commands: customCommands,
                  },
                  undefined,
                  4
                )
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
        // TODO Add macro for StreamCompanion
        //osuStreamCompanionCurrentMapData,
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
        osuIrcBotInstance?.say(
          osuIrcRequestTarget,
          `UwU (${name} ${getVersion()})`
        );
        osuIrcBotInstance?.disconnect("", () => {
          osuIrcBotInstance?.conn.end();
          osuIrcBotInstance = undefined;
          logger.info("osu! IRC connection was closed");
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
    process.title = `${name} ${getVersion()}`;

    // Get additional command line arguments
    // $ npm run start -- --argument
    // $ node . --no-censoring
    const commandLineArgs = process.argv.slice(2);

    if (commandLineArgs.includes("--version")) {
      console.log(getVersion());
      process.exit(0);
    }

    // Load environment variables if existing from the .env file
    dotenv.config();
    // Print for debugging the (private/secret) environment values to the console
    // (censor critical variables if not explicitly enabled)
    printCliVariablesToConsole(!commandLineArgs.includes("--no-censoring"));

    // Create logger
    const logDir = getCliVariableValueOrDefault(
      CliVariable.LOGGING_DIRECTORY_PATH
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
