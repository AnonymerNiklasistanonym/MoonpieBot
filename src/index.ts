// Package imports
import dotenv from "dotenv";
import * as path from "path";
import { mkdirSync, promises as fs } from "fs";
import irc from "irc";
import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
import SpotifyWebApi from "spotify-web-api-node";
// Local imports
import { createLogger } from "./logging";
import { createTwitchClient } from "./twitch";
import { moonpieDbSetupTables } from "./database/moonpieDb";
import { moonpieChatHandler } from "./commands/moonpie";
import { osuChatHandler } from "./commands/osu";
import { name } from "./info";
import { getVersion } from "./version";
import {
  EnvVariable,
  getEnvVariableValue,
  getEnvVariableValueOrDefault,
  getEnvVariableValueOrCustomDefault,
  printEnvVariablesToConsole,
  writeEnvVariableDocumentation,
} from "./env";
import { checkCustomCommand } from "./other/customCommand";
import { registerTimer } from "./other/customTimer";
import { isProcessRunning } from "./other/processInformation";
import { parseTwitchBadgeLevel } from "./other/twitchBadgeParser";
import { pyramidSpammer } from "./other/pyramidSpammer";
import { createStreamCompanionConnection } from "./streamcompanion";
import { createOsuIrcConnection } from "./osuirc";
import { CliVariable, getCliVariableDocumentation } from "./cli";
import { setupSpotifyAuthentication } from "./spotify";
import { spotifyChatHandler } from "./commands/spotify";
import {
  defaultStrings,
  updateStringsMapWithCustomEnvStrings,
  writeStringsVariableDocumentation,
} from "./strings";
import { macroMoonpieBot } from "./messageParser/macros/moonpiebot";
// Type imports
import type { Logger } from "winston";
import type { ErrorWithCode } from "./error";
import type { StreamCompanionData } from "./streamcompanion";
import { generatePluginsAndMacrosMap } from "./messageParser";
import {
  pluginLowercase,
  pluginRandomNumber,
  pluginShowIfEmpty,
  pluginShowIfNotEmpty,
  pluginShowIfNotTrue,
  pluginShowIfNotUndefined,
  pluginShowIfNumberGreaterThan,
  pluginShowIfNumberNotGreaterThan,
  pluginShowIfNumberNotSmallerThan,
  pluginShowIfNumberSmallerThan,
  pluginShowIfStringsNotTheSame,
  pluginShowIfStringsTheSame,
  pluginShowIfTrue,
  pluginShowIfUndefined,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
} from "./messageParser/plugins/general";
import { errorMessageUserNameUndefined } from "./commands";
import { pluginTwitchApi } from "./messageParser/plugins/twitchApi";
import {
  pluginOsuBeatmap,
  pluginOsuMostRecentPlay,
  pluginOsuScore,
  pluginOsuUser,
} from "./messageParser/plugins/osu";
import { pluginStreamCompanion } from "./messageParser/plugins/streamcompanion";

// TODO Move to database tables so they can be changed on the fly
const fileExists = async (path: string) =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  !!(await fs.stat(path).catch(() => false));
export interface CustomTimerJson {
  name?: string;
  channels: string[];
  message: string;
  cronString: string;
}
export interface CustomTimerDataJson {
  timers: CustomTimerJson[];
}
export interface CustomCommandJson {
  name?: string;
  channels: string[];
  message: string;
  regexString: string;
  count?: number;
  userLevel?: "broadcaster" | "mod" | "vip" | "everyone";
}
export interface CustomCommandDataJson {
  commands: CustomCommandJson[];
}

/**
 * Main method that runs the bot.
 *
 * @param logger Logger (used for logging).
 * @param configDir The directory in which all configurations are contained.
 */
export const main = async (logger: Logger, configDir: string) => {
  const pathCustomTimers = path.join(configDir, "customTimers.json");
  const pathCustomCommands = path.join(configDir, "customCommands.json");

  const databasePath = path.resolve(
    configDir,
    getEnvVariableValueOrDefault(EnvVariable.MOONPIE_DATABASE_PATH, configDir)
  );

  const spotifyApiClientId = getEnvVariableValueOrCustomDefault(
    EnvVariable.SPOTIFY_API_CLIENT_ID,
    undefined
  );
  const spotifyApiClientSecret = getEnvVariableValueOrCustomDefault(
    EnvVariable.SPOTIFY_API_CLIENT_SECRET,
    undefined
  );
  const spotifyApiRefreshToken = getEnvVariableValueOrCustomDefault(
    EnvVariable.SPOTIFY_API_REFRESH_TOKEN,
    undefined
  );
  let spotifyWebApi: undefined | SpotifyWebApi = undefined;
  if (
    spotifyApiClientId !== undefined &&
    spotifyApiClientSecret !== undefined
  ) {
    spotifyWebApi = await setupSpotifyAuthentication(
      spotifyApiClientId,
      spotifyApiClientSecret,
      spotifyApiRefreshToken,
      logger
    );
  }

  const osuApiClientId = getEnvVariableValueOrCustomDefault(
    EnvVariable.OSU_API_CLIENT_ID,
    undefined
  );
  const osuApiClientSecret = getEnvVariableValueOrCustomDefault(
    EnvVariable.OSU_API_CLIENT_SECRET,
    undefined
  );
  const osuApiDefaultId = getEnvVariableValueOrCustomDefault(
    EnvVariable.OSU_API_DEFAULT_ID,
    undefined
  );
  const enableOsu =
    osuApiClientId !== undefined &&
    osuApiClientSecret !== undefined &&
    osuApiDefaultId !== undefined;
  const enableOsuBeatmapRequests =
    getEnvVariableValueOrDefault(EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS) ===
    "ON";
  const enableOsuBeatmapRequestsDetailed =
    getEnvVariableValueOrDefault(
      EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED
    ) === "ON";
  const osuIrcPassword = getEnvVariableValueOrCustomDefault(
    EnvVariable.OSU_IRC_PASSWORD,
    undefined
  );
  const osuIrcUsername = getEnvVariableValueOrCustomDefault(
    EnvVariable.OSU_IRC_USERNAME,
    undefined
  );
  const osuIrcRequestTarget = getEnvVariableValueOrCustomDefault(
    EnvVariable.OSU_IRC_REQUEST_TARGET,
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
  const osuStreamCompanionUrl = getEnvVariableValueOrCustomDefault(
    EnvVariable.OSU_STREAM_COMPANION_URL,
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
        logger.debug({
          message: `Add custom command ${
            newCustomCommand.name ? newCustomCommand.name : "no-name"
          }: ${newCustomCommand.regexString} => ${newCustomCommand.message}`,
          section: "customCommands",
        });
      }
      if (newCustomCommands.length > 0) {
        logger.info({
          message: `Added ${newCustomCommands.length} custom command${
            newCustomCommands.length > 1 ? "s" : ""
          }`,
          section: "customCommands",
        });
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

  const twitchApiClientId = getEnvVariableValueOrCustomDefault(
    EnvVariable.TWITCH_API_CLIENT_ID,
    undefined
  );
  const twitchApiAccessToken = getEnvVariableValueOrCustomDefault(
    EnvVariable.TWITCH_API_ACCESS_TOKEN,
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

  // Setup message parser
  const pluginsList = [
    pluginLowercase,
    pluginUppercase,
    pluginRandomNumber,
    pluginShowIfEmpty,
    pluginShowIfNotEmpty,
    pluginShowIfNotUndefined,
    pluginShowIfUndefined,
    pluginShowIfNotTrue,
    pluginShowIfTrue,
    pluginShowIfNumberGreaterThan,
    pluginShowIfNumberSmallerThan,
    pluginShowIfNumberNotGreaterThan,
    pluginShowIfNumberNotSmallerThan,
    pluginShowIfStringsTheSame,
    pluginShowIfStringsNotTheSame,
    pluginTimeInSToHumanReadableString,
    pluginTimeInSToStopwatchString,
  ];
  const macrosList = [macroMoonpieBot];
  await writeEnvVariableDocumentation(path.join(configDir, ".env.example"));
  await writeStringsVariableDocumentation(
    path.join(configDir, ".env.strings.example"),
    pluginsList,
    macrosList
  );
  const strings = updateStringsMapWithCustomEnvStrings(defaultStrings, logger);
  const pluginsAndMacrosMap = generatePluginsAndMacrosMap(
    pluginsList,
    macrosList
  );
  const plugins = pluginsAndMacrosMap.pluginsMap;
  const macros = pluginsAndMacrosMap.macrosMap;
  if (osuApiDefaultId) {
    macros.set("OSU_API", new Map([["DEFAULT_USER_ID", `${osuApiDefaultId}`]]));
  }
  if (osuApiClientId && osuApiClientSecret) {
    const pluginOsuBeatmapReady = pluginOsuBeatmap({
      clientId: parseInt(osuApiClientId),
      clientSecret: osuApiClientSecret,
    });
    const pluginOsuScoreReady = pluginOsuScore({
      clientId: parseInt(osuApiClientId),
      clientSecret: osuApiClientSecret,
    });
    const pluginOsuMostRecentPlayReady = pluginOsuMostRecentPlay({
      clientId: parseInt(osuApiClientId),
      clientSecret: osuApiClientSecret,
    });
    const pluginOsuUserReady = pluginOsuUser({
      clientId: parseInt(osuApiClientId),
      clientSecret: osuApiClientSecret,
    });
    plugins.set(pluginOsuBeatmapReady.id, pluginOsuBeatmapReady.func);
    plugins.set(pluginOsuScoreReady.id, pluginOsuScoreReady.func);
    plugins.set(
      pluginOsuMostRecentPlayReady.id,
      pluginOsuMostRecentPlayReady.func
    );
    plugins.set(pluginOsuUserReady.id, pluginOsuUserReady.func);
  }
  if (osuStreamCompanionCurrentMapData !== undefined) {
    const pluginStreamCompanionReady = pluginStreamCompanion(
      osuStreamCompanionCurrentMapData
    );
    plugins.set(pluginStreamCompanionReady.id, pluginStreamCompanionReady.func);
  }

  // Create TwitchClient and listen to certain events
  const twitchClient = createTwitchClient(
    getEnvVariableValue(EnvVariable.TWITCH_NAME),
    getEnvVariableValue(EnvVariable.TWITCH_OAUTH_TOKEN),
    getEnvVariableValue(EnvVariable.TWITCH_CHANNELS)
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

    // TODO Think about how to document client dependent plugins
    const pluginsChannel = new Map(plugins);
    if (twitchApiClient) {
      for (const plugin of pluginTwitchApi(
        twitchApiClient,
        channel,
        tags["user-id"]
      )) {
        plugins.set(plugin.id, plugin.func);
      }
    }
    pluginsChannel.set("USER", () => {
      if (tags.username === undefined) {
        throw errorMessageUserNameUndefined();
      }
      return `${tags.username}`;
    });

    // Handle all bot commands
    moonpieChatHandler(
      twitchClient,
      channel,
      tags,
      message,
      databasePath,
      getEnvVariableValueOrDefault(EnvVariable.MOONPIE_ENABLE_COMMANDS)?.split(
        ","
      ),
      strings,
      pluginsChannel,
      macros,
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
        getEnvVariableValueOrDefault(EnvVariable.OSU_ENABLE_COMMANDS)?.split(
          ","
        ),
        strings,
        pluginsChannel,
        macros,
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
      const enableCommands = getEnvVariableValueOrDefault(
        EnvVariable.OSU_ENABLE_COMMANDS
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
        strings,
        pluginsChannel,
        macros,
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

    if (spotifyWebApi !== undefined) {
      spotifyChatHandler(
        twitchClient,
        channel,
        tags,
        message,
        spotifyWebApi,
        undefined,
        strings,
        logger
      ).catch((err) => {
        logger.error(err);
        // When the chat handler throws an error write the error message in chat
        const errorInfo = err as ErrorWithCode;
        twitchClient
          .say(
            channel,
            `${tags.username ? "@" + tags.username + " " : ""}Spotify Error: ${
              errorInfo.message
            }${errorInfo.code ? " (" + errorInfo.code + ")" : ""}`
          )
          .catch(logger.error);
      });
    }

    // Check custom commands
    try {
      const pluginsCustomCommands = new Map(pluginsChannel);
      for (const customCommand of customCommands) {
        pluginsCustomCommands.set(
          "COUNT",
          () => `${customCommand.count ? customCommand.count + 1 : 1}`
        );
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
          pluginsCustomCommands,
          macros,
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
          .catch((err) => {
            logger.error(err);
            // When the chat handler throws an error write the error message in chat
            const errorInfo = err as ErrorWithCode;
            twitchClient
              .say(
                channel,
                `${
                  tags.username ? "@" + tags.username + " " : ""
                }Custom Command Error: ${errorInfo.message}${
                  errorInfo.code ? " (" + errorInfo.code + ")" : ""
                }`
              )
              .catch(logger.error);
          });
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
        plugins,
        macros,
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
  void (async () => {
    try {
      // Change the title of the process/terminal
      process.title = `${name} ${getVersion()}`;

      // Get additional command line arguments
      // $ npm run start -- --argument
      // $ node . --argument
      const commandLineArgs = process.argv.slice(2);

      // Catch CLI version request
      if (commandLineArgs.includes(CliVariable.VERSION)) {
        console.log(getVersion());
        process.exit(0);
      }

      // Catch CLI help request
      if (commandLineArgs.includes(CliVariable.HELP)) {
        console.log(
          `moonpiebot [OPTIONS]\n\nOptions:\n${getCliVariableDocumentation()}`
        );
        process.exit(0);
      }

      // Catch custom config directory
      let configDir = process.cwd();
      if (commandLineArgs.includes(CliVariable.CONFIG_DIRECTORY)) {
        const lastIndexOfConfigDir =
          commandLineArgs.lastIndexOf(CliVariable.CONFIG_DIRECTORY) + 1;
        if (lastIndexOfConfigDir >= commandLineArgs.length) {
          throw Error(
            `${CliVariable.CONFIG_DIRECTORY} > Config directory argument is missing`
          );
        }
        // eslint-disable-next-line security/detect-object-injection
        configDir = commandLineArgs[lastIndexOfConfigDir];
        // Create config directory if it doesn't exist
        mkdirSync(configDir, { recursive: true });
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
        !commandLineArgs.includes(CliVariable.DISABLE_CENSORING)
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
        logDir,
        getEnvVariableValueOrDefault(EnvVariable.LOGGING_CONSOLE_LOG_LEVEL),
        getEnvVariableValueOrDefault(EnvVariable.LOGGING_FILE_LOG_LEVEL)
      );

      // Call main method
      try {
        logger.info(`${name} ${getVersion()} was started (logs: '${logDir}')`);
        logger.debug(`Config directory: '${configDir}'`);
        await main(logger, configDir);
        logger.debug(`${name} was closed`);
      } catch (err) {
        logger.error(err);
        logger.debug(`${name} was closed after unexpected error`);
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
