// Package imports
import dotenv from "dotenv";
import * as path from "path";
import { mkdirSync } from "fs";
import irc from "irc";
import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
import SpotifyWebApi from "spotify-web-api-node";
// Local imports
import { createLogger, createLogFunc } from "./logging";
import { createTwitchClient } from "./twitch";
import { moonpieDbSetupTables } from "./database/moonpieDb";
import { moonpieChatHandler } from "./commands/moonpie";
import { osuChatHandler, OsuCommands } from "./commands/osu";
import { name } from "./info";
import { getVersion } from "./version";
import {
  EnvVariable,
  getEnvVariableValueOrDefault,
  getEnvVariableValueOrUndefined,
  printEnvVariablesToConsole,
  writeEnvVariableDocumentation,
} from "./env";
import {
  checkCustomCommand,
  loadCustomCommandsFromFile,
} from "./other/customCommand";
import { loadCustomTimersFromFile, registerTimer } from "./other/customTimer";
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
import { generatePluginsAndMacrosMap } from "./messageParser";
import {
  pluginConvertToShortNumber,
  pluginIfEmpty,
  pluginIfEqual,
  pluginIfFalse,
  pluginIfGreater,
  pluginIfNotEmpty,
  pluginIfNotEqual,
  pluginIfNotGreater,
  pluginIfNotSmaller,
  pluginIfNotUndefined,
  pluginIfSmaller,
  pluginIfTrue,
  pluginIfUndefined,
  pluginLowercase,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToHumanReadableStringShort,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
} from "./messageParser/plugins/general";
import {
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "./commands";
import { pluginTwitchApi } from "./messageParser/plugins/twitchApi";
import {
  pluginOsuBeatmap,
  pluginOsuMostRecentPlay,
  pluginOsuScore,
  pluginOsuUser,
} from "./messageParser/plugins/osu";
import { pluginStreamCompanion } from "./messageParser/plugins/streamcompanion";
import { pluginSpotifyCurrentPreviousSong } from "./messageParser/plugins/spotify";
import { writeJsonFile } from "./other/fileOperations";
// Type imports
import type { Logger } from "winston";
import type { ErrorWithCode } from "./error";
import type { StreamCompanionData } from "./streamcompanion";
import type {
  CustomCommandDataJson,
  CustomCommandJson,
} from "./other/customCommand";
import type { CustomTimerJson } from "./other/customTimer";
import { exportMoonpieCountTableToJson } from "./database/moonpie/backup";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_MAIN = "main";

/**.
 * Main method that runs the bot.
 *
 * ```mermaid
 * graph TB
 *   a["get environment variable values"] --> b;
 *   b["initialize global objects/variables"] --> c;
 *   c["initialize database"] --> d;
 *   d["initialize message parser"] --> e;
 *   e["connect bot logic with Twitch triggers"] --> f["initialize timers"];
 * ```
 *
 * @param logger Logger (used for logging).
 * @param configDir The directory in which all configurations are contained.
 * @param logDir The directory in which all logs are contained.
 */
export const main = async (
  logger: Logger,
  configDir: string,
  logDir: string
) => {
  const pathCustomTimers = path.join(configDir, "customTimers.json");
  const pathCustomCommands = path.join(configDir, "customCommands.json");

  const loggerMain = createLogFunc(logger, LOG_ID_MODULE_MAIN);

  // Read in necessary paths/values from environment variables
  // Twitch connection
  const twitchName = getEnvVariableValueOrUndefined(EnvVariable.TWITCH_NAME);
  const twitchOAuthToken = getEnvVariableValueOrUndefined(
    EnvVariable.TWITCH_OAUTH_TOKEN
  );
  const twitchChannels = getEnvVariableValueOrUndefined(
    EnvVariable.TWITCH_CHANNELS
  );
  // Twitch API
  const twitchApiClientId = getEnvVariableValueOrUndefined(
    EnvVariable.TWITCH_API_CLIENT_ID
  );
  const twitchApiAccessToken = getEnvVariableValueOrUndefined(
    EnvVariable.TWITCH_API_ACCESS_TOKEN
  );
  // > Moonpie
  const pathDatabase = path.resolve(
    configDir,
    getEnvVariableValueOrDefault(EnvVariable.MOONPIE_DATABASE_PATH, configDir)
  );
  const moonpieCooldownHoursString = getEnvVariableValueOrDefault(
    EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS
  );
  let moonpieClaimCooldownHoursNumber: number;
  try {
    moonpieClaimCooldownHoursNumber = parseInt(moonpieCooldownHoursString);
  } catch (err) {
    throw Error(
      `The moonpie claim cooldown hours number string could not be parsed (${moonpieCooldownHoursString})`
    );
  }
  // > Spotify API
  const spotifyApiClientId = getEnvVariableValueOrUndefined(
    EnvVariable.SPOTIFY_API_CLIENT_ID
  );
  const spotifyApiClientSecret = getEnvVariableValueOrUndefined(
    EnvVariable.SPOTIFY_API_CLIENT_SECRET
  );
  const spotifyApiRefreshToken = getEnvVariableValueOrUndefined(
    EnvVariable.SPOTIFY_API_REFRESH_TOKEN
  );
  // > osu! API
  const osuApiClientId = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_API_CLIENT_ID
  );
  const osuApiClientSecret = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_API_CLIENT_SECRET
  );
  const osuApiDefaultId = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_API_DEFAULT_ID
  );
  const osuApiBeatmapRequests = getEnvVariableValueOrDefault(
    EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS
  );
  const osuApiBeatmapRequestsDetailed = getEnvVariableValueOrDefault(
    EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED
  );
  const osuIrcPassword = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_IRC_PASSWORD
  );
  const osuIrcUsername = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_IRC_USERNAME
  );
  const osuIrcRequestTarget = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_IRC_REQUEST_TARGET
  );
  // > osu! StreamCompanion
  const osuStreamCompanionUrl = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_STREAM_COMPANION_URL
  );

  // Initialize global objects
  // Twitch connection
  const twitchClient = createTwitchClient(
    twitchName,
    twitchOAuthToken,
    twitchChannels?.split(" ").filter((a) => a.trim().length !== 0),
    false,
    logger
  );
  // Twitch API
  let twitchApiClient: undefined | ApiClient = undefined;
  if (twitchApiClientId !== undefined && twitchApiAccessToken !== undefined) {
    const authProviderScopes = new StaticAuthProvider(
      twitchApiClientId,
      twitchApiAccessToken
    );
    twitchApiClient = new ApiClient({
      authProvider: authProviderScopes,
    });
  }
  // > Spotify API
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
  // > osu! API
  const enableOsu =
    osuApiClientId !== undefined &&
    osuApiClientSecret !== undefined &&
    osuApiDefaultId !== undefined;
  const enableOsuIrc =
    osuIrcPassword !== undefined &&
    osuIrcUsername !== undefined &&
    osuIrcRequestTarget !== undefined;
  const enableOsuBeatmapRequests = osuApiBeatmapRequests === "ON";
  const enableOsuBeatmapRequestsDetailed =
    osuApiBeatmapRequestsDetailed === "ON";
  let osuIrcBot: undefined | (() => irc.Client) = undefined;
  if (enableOsu && enableOsuBeatmapRequests && enableOsuIrc) {
    osuIrcBot = () =>
      createOsuIrcConnection(osuIrcUsername, osuIrcPassword, logger);
  }
  // > osu! StreamCompanion
  let osuStreamCompanionCurrentMapData:
    | undefined
    | (() => StreamCompanionData | undefined) = undefined;
  if (osuStreamCompanionUrl !== undefined) {
    osuStreamCompanionCurrentMapData = createStreamCompanionConnection(
      osuStreamCompanionUrl,
      logger
    );
  }

  // Load custom commands
  const customCommands: CustomCommandJson[] = [];
  try {
    customCommands.push(
      ...(await loadCustomCommandsFromFile(pathCustomCommands, logger))
    );
  } catch (err) {
    loggerMain.error(err as Error);
  }

  // Load custom timers
  const customTimers: CustomTimerJson[] = [];
  try {
    customTimers.push(
      ...(await loadCustomTimersFromFile(pathCustomTimers, logger))
    );
  } catch (err) {
    loggerMain.error(err as Error);
  }

  // Setup database tables (or do nothing if they already exist)
  await moonpieDbSetupTables(pathDatabase, logger);
  try {
    const databaseBackupData = await exportMoonpieCountTableToJson(
      pathDatabase,
      logger
    );
    const dateObject = new Date();
    const dateDay = `0${dateObject.getDate()}`.slice(-2);
    const DateMonth = `0${dateObject.getMonth() + 1}`.slice(-2);
    const dateYear = dateObject.getFullYear();
    const pathDatabaseBackup = path.join(
      logDir,
      `db_backup_moonpie_${dateYear}-${DateMonth}-${dateDay}.json`
    );
    await writeJsonFile(pathDatabaseBackup, databaseBackupData);
  } catch (err) {
    loggerMain.error(err as Error);
  }

  // Setup message parser
  const pluginsList = [
    pluginConvertToShortNumber,
    pluginIfEmpty,
    pluginIfEqual,
    pluginIfFalse,
    pluginIfGreater,
    pluginIfNotEmpty,
    pluginIfNotEqual,
    pluginIfNotGreater,
    pluginIfNotSmaller,
    pluginIfNotUndefined,
    pluginIfSmaller,
    pluginIfTrue,
    pluginIfUndefined,
    pluginLowercase,
    pluginRandomNumber,
    pluginTimeInSToHumanReadableString,
    pluginTimeInSToHumanReadableStringShort,
    pluginTimeInSToStopwatchString,
    pluginUppercase,
  ];
  const macrosList = [macroMoonpieBot];
  await writeEnvVariableDocumentation(path.join(configDir, ".env.example"));
  await writeStringsVariableDocumentation(
    path.join(configDir, ".env.strings.example"),
    defaultStrings,
    pluginsList,
    macrosList,
    logger
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
  if (spotifyWebApi !== undefined) {
    const pluginSpotifyReady = pluginSpotifyCurrentPreviousSong(spotifyWebApi);
    plugins.set(pluginSpotifyReady.id, pluginSpotifyReady.func);
  }

  // Connect functionality to Twitch connection triggers
  twitchClient.on("connecting", (address, port) => {
    // Triggers when the client is connecting to Twitch
    loggerMain.info(`Connecting to Twitch: ${address}:${port}`);
  });
  twitchClient.on("connected", (address, port) => {
    // Triggers when the client successfully connected to Twitch
    loggerMain.info(`Connected to Twitch: ${address}:${port}`);
  });
  twitchClient.on("disconnected", (reason) => {
    // Triggers when the client was disconnected from Twitch
    loggerMain.info(`Disconnected from Twitch: ${reason}`);
  });
  twitchClient.on("join", (channel, username, self) => {
    // Triggers when a new user joins a Twitch channel that is being listened to
    if (self) {
      // Only catch when the Twitch client itself joins a Twitch channel
      loggerMain.info(
        `Joined the Twitch channel "${channel}" as "${username}"`
      );
      // Easter Egg: Spam pyramids on joining the channel
      if (channel === "#ztalx_") {
        pyramidSpammer(twitchClient, channel, "ztalxWow", 10).catch(
          loggerMain.error
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
    const macrosChannel = new Map(macros);
    if (twitchApiClient) {
      for (const plugin of pluginTwitchApi(
        twitchApiClient,
        channel,
        tags["user-id"]
      )) {
        plugins.set(plugin.id, plugin.func);
      }
    }
    macrosChannel.set(
      "TWITCH",
      new Map([
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        ["USER", `${tags.username}`],
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        ["USER_ID", `${tags["user-id"]}`],
        ["CHANNEL", channel.slice(1)],
      ])
    );
    pluginsChannel.set("USER", () => {
      if (tags.username === undefined) {
        throw errorMessageUserNameUndefined();
      }
      return tags.username;
    });
    pluginsChannel.set("USER_ID", () => {
      if (tags["user-id"] === undefined) {
        throw errorMessageUserIdUndefined();
      }
      return tags["user-id"];
    });
    pluginsChannel.set("CHANNEL", () => channel.slice(1));

    // Handle all bot commands
    moonpieChatHandler(
      twitchClient,
      channel,
      tags,
      message,
      pathDatabase,
      moonpieClaimCooldownHoursNumber,
      getEnvVariableValueOrDefault(EnvVariable.MOONPIE_ENABLE_COMMANDS)?.split(
        ","
      ),
      strings,
      pluginsChannel,
      macrosChannel,
      logger
    ).catch((err) => {
      loggerMain.error(err as Error);
      // When the chat handler throws an error write the error message in chat
      const errorInfo = err as ErrorWithCode;
      twitchClient
        .say(
          channel,
          `${tags.username ? "@" + tags.username + " " : ""}Moonpie Error: ${
            errorInfo.message
          }${errorInfo.code ? " (" + errorInfo.code + ")" : ""}`
        )
        .catch(loggerMain.error);
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
        macrosChannel,
        logger
      ).catch((err) => {
        loggerMain.error(err as Error);
        // When the chat handler throws an error write the error message in chat
        const errorInfo = err as ErrorWithCode;
        twitchClient
          .say(
            channel,
            `${tags.username ? "@" + tags.username + " " : ""}Osu Error: ${
              errorInfo.message
            }${errorInfo.code ? " (" + errorInfo.code + ")" : ""}`
          )
          .catch(loggerMain.error);
      });
    } else if (osuStreamCompanionCurrentMapData !== undefined) {
      // If osu! is not enabled but StreamCompanion is found filter all osu!
      // commands that need the osu API from the function
      // This currently means only allow the NP command which uses
      // StreamCompanion and nothing else
      // TODO Dirty solution, refactor that better in the future
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
        enableCommands.filter((a) => a === OsuCommands.NP),
        strings,
        pluginsChannel,
        macrosChannel,
        logger
      ).catch((err) => {
        loggerMain.error(err as Error);
        // When the chat handler throws an error write the error message in chat
        const errorInfo = err as ErrorWithCode;
        twitchClient
          .say(
            channel,
            `${tags.username ? "@" + tags.username + " " : ""}Osu Error: ${
              errorInfo.message
            }${errorInfo.code ? " (" + errorInfo.code + ")" : ""}`
          )
          .catch(loggerMain.error);
      });
    }

    if (spotifyWebApi !== undefined) {
      spotifyChatHandler(
        twitchClient,
        channel,
        tags,
        message,
        undefined,
        strings,
        pluginsChannel,
        macrosChannel,
        logger
      ).catch((err) => {
        loggerMain.error(err as Error);
        // When the chat handler throws an error write the error message in chat
        const errorInfo = err as ErrorWithCode;
        twitchClient
          .say(
            channel,
            `${tags.username ? "@" + tags.username + " " : ""}Spotify Error: ${
              errorInfo.message
            }${errorInfo.code ? " (" + errorInfo.code + ")" : ""}`
          )
          .catch(loggerMain.error);
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
          strings,
          pluginsCustomCommands,
          macrosChannel,
          logger
        )
          .then((commandExecuted) => {
            if (commandExecuted) {
              if (customCommand.count === undefined) {
                customCommand.count = 1;
              } else {
                customCommand.count += 1;
              }
              // TODO Make this into an external method
              // Save custom command counts to files
              writeJsonFile<CustomCommandDataJson>(pathCustomCommands, {
                $schema: "./customCommands.schema.json",
                commands: customCommands,
              })
                .then(() => {
                  loggerMain.info("Custom commands were saved");
                })
                .catch(loggerMain.error);
            }
          })
          .catch((err) => {
            loggerMain.error(err as Error);
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
              .catch(loggerMain.error);
          });
      }
    } catch (err) {
      loggerMain.error(err as Error);
    }
  });

  process.on("SIGINT", () => {
    // When the process is being force closed catch that and close "safely"
    loggerMain.info("SIGINT was detected");
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
        strings,
        plugins,
        macros,
        logger
      );
    }
  } catch (err) {
    loggerMain.error(err as Error);
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
      loggerMain.info("Try to connect to osu IRC channel");
      osuIrcBotInstance.connect(2, () => {
        loggerMain.info("osu! IRC connection was established");
        osuIrcBotInstance?.say(
          osuIrcRequestTarget,
          `UwU (${name} ${getVersion()})`
        );
        osuIrcBotInstance?.disconnect("", () => {
          osuIrcBotInstance?.conn.end();
          osuIrcBotInstance = undefined;
          loggerMain.info("osu! IRC connection was closed");
        });
      });
    } catch (err) {
      loggerMain.error(
        Error(
          `osu! IRC connection could not be established": ${
            (err as Error).message
          }`
        )
      );
      loggerMain.error(err as Error);
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
      // $ programName --argument
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
        name,
        logDir,
        getEnvVariableValueOrDefault(EnvVariable.LOGGING_CONSOLE_LOG_LEVEL),
        getEnvVariableValueOrDefault(EnvVariable.LOGGING_FILE_LOG_LEVEL)
      );
      const logMain = createLogFunc(logger, "main");

      // Call main method
      try {
        logMain.info(`${name} ${getVersion()} was started (logs: '${logDir}')`);
        logMain.debug(`Config directory: '${configDir}'`);
        logMain.debug(`Node versions: '${JSON.stringify(process.versions)}'`);
        await main(logger, configDir, logDir);
        logMain.debug(`${name} was closed`);
      } catch (err) {
        logMain.error(err as Error);
        logMain.debug(`${name} was closed after unexpected error`);
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
