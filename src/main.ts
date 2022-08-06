/*
 * Main method of the bot that connect and sets up everything.
 */

// Package imports
import path from "path";
import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
import irc from "irc";
// Local imports
import { createOsuIrcConnection, tryToSendOsuIrcMessage } from "./osuirc";
import { EnvVariable, EnvVariableNone, EnvVariableOnOff } from "./info/env";
import { MacroOsuApi, macroOsuApiId } from "./messageParser/macros/osuApi";
import {
  getEnvVariableValueOrDefault,
  getEnvVariableValueOrUndefined,
  writeEnvVariableDocumentation,
} from "./env";
import { OsuCommands, osuChatHandler } from "./commands/osu";
import {
  checkCustomCommand,
  loadCustomCommandsFromFile,
} from "./customCommandsTimers/customCommand";
import {
  defaultStrings,
  updateStringsMapWithCustomEnvStrings,
  writeStringsVariableDocumentation,
} from "./strings";
import {
  loadCustomTimersFromFile,
  registerTimer,
} from "./customCommandsTimers/customTimer";
import {
  pluginConvertToShortNumber,
  pluginHelp,
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
  pluginOsuBeatmap,
  pluginOsuMostRecentPlay,
  pluginOsuScore,
  pluginOsuUser,
} from "./messageParser/plugins/osu";
import { createLogFunc } from "./logging";
import { createStreamCompanionConnection } from "./streamcompanion";
import { createTwitchClient } from "./twitch";
import {
  getPluginsCustomCommand,
  getPluginsCustomCommandData,
} from "./messageParser/plugins/customCommand";
import { exportMoonpieCountTableToJson } from "./database/moonpie/backup";
import { generatePluginsAndMacrosMap } from "./messageParser";
import { getVersion } from "./version";
import { macroMoonpieBot } from "./messageParser/macros/moonpiebot";
import { moonpieChatHandler } from "./commands/moonpie";
import { moonpieDbSetupTables } from "./database/moonpieDb";
import { name } from "./info/general";
import { parseTwitchBadgeLevel } from "./other/twitchBadgeParser";
import { pluginSpotifyCurrentPreviousSong } from "./messageParser/plugins/spotify";
import { pluginsTwitchChat } from "./messageParser/plugins/twitchChat";
import { getPluginOsuStreamCompanion } from "./messageParser/plugins/streamcompanion";
import { pluginsTwitchApi } from "./messageParser/plugins/twitchApi";
import { pyramidSpammer } from "./other/pyramidSpammer";
import { setupSpotifyAuthentication } from "./spotify";
import { spotifyChatHandler } from "./commands/spotify";
import { writeJsonFile } from "./other/fileOperations";
// Type imports
import type { CustomCommandsJson } from "./customCommandsTimers/customCommand";
import type { CustomTimer } from "./customCommandsTimers/customTimer";
import type { ErrorWithCode } from "./error";
import type { Logger } from "winston";
import type SpotifyWebApi from "spotify-web-api-node";
import type { StreamCompanionData } from "./streamcompanion";

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
    EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS,
    configDir
  );
  let moonpieClaimCooldownHoursNumber: number;
  try {
    moonpieClaimCooldownHoursNumber = parseInt(moonpieCooldownHoursString);
  } catch (err) {
    throw Error(
      `The moonpie claim cooldown hours number string could not be parsed (${moonpieCooldownHoursString})`
    );
  }
  const moonpieEnableCommands = getEnvVariableValueOrDefault(
    EnvVariable.MOONPIE_ENABLE_COMMANDS,
    configDir
  ).split(",");
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
    EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS,
    configDir
  );
  const osuApiBeatmapRequestsDetailed = getEnvVariableValueOrDefault(
    EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED,
    configDir
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
  const osuEnableCommands = getEnvVariableValueOrDefault(
    EnvVariable.OSU_ENABLE_COMMANDS,
    configDir
  ).split(",");
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
  const enableOsuBeatmapRequests =
    osuApiBeatmapRequests === EnvVariableOnOff.ON;
  const enableOsuBeatmapRequestsDetailed =
    osuApiBeatmapRequestsDetailed === EnvVariableOnOff.ON;
  let osuIrcBot: undefined | ((id: string) => irc.Client) = undefined;
  if (enableOsu && enableOsuBeatmapRequests && enableOsuIrc) {
    osuIrcBot = (id: string) =>
      createOsuIrcConnection(osuIrcUsername, osuIrcPassword, id, logger);
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
  const customCommands: CustomCommandsJson = {
    commands: [],
    data: [],
  };
  try {
    const data = await loadCustomCommandsFromFile(pathCustomCommands, logger);
    customCommands.commands.push(...data.customCommands);
    if (data.customCommandsGlobalData) {
      if (customCommands.data === undefined) {
        customCommands.data = [];
      }
      customCommands.data.push(...data.customCommandsGlobalData);
    }
  } catch (err) {
    loggerMain.error(err as Error);
  }

  // Load custom timers
  const customTimers: CustomTimer[] = [];
  try {
    customTimers.push(
      ...(await loadCustomTimersFromFile(pathCustomTimers, logger))
    );
  } catch (err) {
    loggerMain.error(err as Error);
  }

  // Only touch the moonpie database if it will be used
  if (
    moonpieEnableCommands.length > 0 &&
    !(
      moonpieEnableCommands.length == 1 &&
      moonpieEnableCommands.includes(EnvVariableNone.NONE)
    )
  ) {
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
  }

  // Setup message parser
  const pluginsList = [
    pluginConvertToShortNumber,
    pluginHelp,
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
  await writeEnvVariableDocumentation(
    path.join(configDir, ".env.example"),
    configDir
  );
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
    macros.set(
      macroOsuApiId,
      new Map([[MacroOsuApi.DEFAULT_USER_ID, `${osuApiDefaultId}`]])
    );
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
    const pluginStreamCompanionReady = getPluginOsuStreamCompanion(
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
      pluginsTwitchApi(twitchApiClient, channel, tags["user-id"]).forEach(
        (plugin) => {
          pluginsChannel.set(plugin.id, plugin.func);
        }
      );
    }
    const generalChannelPlugins = pluginsTwitchChat(
      tags["user-id"],
      tags.username,
      channel.slice(1)
    );
    for (const generalChannelPlugin of generalChannelPlugins) {
      pluginsChannel.set(generalChannelPlugin.id, generalChannelPlugin.func);
    }

    // Handle all bot commands
    moonpieChatHandler(
      twitchClient,
      channel,
      tags,
      message,
      pathDatabase,
      moonpieClaimCooldownHoursNumber,
      moonpieEnableCommands,
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
        osuEnableCommands,
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
        osuEnableCommands.filter((a) => a === OsuCommands.NP),
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
      // Add plugins to manipulate custom command global data
      const genPluginsCustomCommandData =
        getPluginsCustomCommandData(customCommands);
      for (const pluginCustomCommandData of genPluginsCustomCommandData) {
        pluginsCustomCommands.set(
          pluginCustomCommandData.id,
          pluginCustomCommandData.func
        );
      }
      for (const customCommand of customCommands.commands) {
        const pluginsCustomCommand = new Map(pluginsCustomCommands);
        // Add plugins to manipulate custom command
        const genPluginsCustomCommand = getPluginsCustomCommand(customCommand);
        for (const pluginCustomCommand of genPluginsCustomCommand) {
          pluginsCustomCommand.set(
            pluginCustomCommand.id,
            pluginCustomCommand.func
          );
        }
        checkCustomCommand(
          twitchClient,
          channel,
          tags,
          message,
          parseTwitchBadgeLevel(tags),
          customCommand,
          strings,
          pluginsCustomCommand,
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
              // Save custom command counts to files
              writeJsonFile<CustomCommandsJson>(pathCustomCommands, {
                $schema: "./customCommands.schema.json",
                ...customCommands,
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
  if (enableOsu && osuIrcBot && osuIrcRequestTarget) {
    try {
      await tryToSendOsuIrcMessage(
        osuIrcBot,
        "main",
        osuIrcRequestTarget,
        `UwU (${name} ${getVersion()})`,
        logger
      );
    } catch (err) {
      loggerMain.error(err as Error);
    }
  }
};