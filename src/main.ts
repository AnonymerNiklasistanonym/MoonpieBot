/*
 * Main method of the bot that connect and sets up everything.
 */

// Package imports
import { ApiClient } from "@twurple/api";
import path from "path";
import { StaticAuthProvider } from "@twurple/auth";
// Local imports
import { createOsuIrcConnection, tryToSendOsuIrcMessage } from "./osuIrc";
import {
  createStreamCompanionFileConnection,
  createStreamCompanionWebSocketConnection,
} from "./osuStreamCompanion";
import {
  createTwitchClient,
  runTwitchCommandHandler,
  TwitchClientListener,
} from "./twitch";
import {
  defaultMacros,
  defaultPlugins,
  generateMacroMap,
  generatePlugin,
  generatePluginMap,
} from "./messageParser";
import {
  defaultStringMap,
  updateStringsMapWithCustomEnvStrings,
} from "./strings";
import { EnvVariable, EnvVariableNone, EnvVariableOnOff } from "./info/env";
import {
  getEnvVariableValueOrDefault,
  getEnvVariableValueOrUndefined,
} from "./env";
import {
  pluginsCustomCommandDataGenerator,
  pluginsCustomCommandGenerator,
} from "./messageParser/plugins/customDataLogic";
import { createBroadcastScheduledTask } from "./customCommandsBroadcasts/customBroadcast";
import { createLogFunc } from "./logging";
import { customCommandChatHandler } from "./customCommandsBroadcasts/customCommand";
import customCommandsBroadcastsDb from "./database/customCommandsBroadcastsDb";
import { fileNameDatabaseBackups } from "./info/fileNames";
import { getVersionFromObject } from "./version";
import { macroOsuApi } from "./messageParser/macros/osuApi";
import { moonpieChatHandler } from "./commands/moonpie";
import moonpieDb from "./database/moonpieDb";
import { name } from "./info/general";
import { osuChatHandler } from "./commands/osu";
import { OsuCommands } from "./info/commands";
import osuRequestsDb from "./database/osuRequestsDb";
import { pluginsOsuGenerator } from "./messageParser/plugins/osuApi";
import { pluginsOsuStreamCompanionGenerator } from "./messageParser/plugins/osuStreamCompanion";
import { pluginSpotifyGenerator } from "./messageParser/plugins/spotify";
import { pluginsTwitchApiGenerator } from "./messageParser/plugins/twitchApi";
import { pluginsTwitchChatGenerator } from "./messageParser/plugins/twitchChat";
import { setupSpotifyAuthentication } from "./spotify";
import { spotifyChatHandler } from "./commands/spotify";
import { SpotifyConfig } from "./database/spotifyDb/requests/spotifyConfig";
import spotifyDb from "./database/spotifyDb";
import { version } from "./info/version";
import { writeJsonFile } from "./other/fileOperations";
// Type imports
import type { ChatUserstate } from "tmi.js";
import type { ErrorWithCode } from "./error";
import type { Logger } from "winston";
import type { OsuIrcBotSendMessageFunc } from "./commands/osu/beatmap";
import type { PluginTwitchApiData } from "./messageParser/plugins/twitchApi";
import type { PluginTwitchChatData } from "./messageParser/plugins/twitchChat";
import type { ScheduledTask } from "node-cron";
import type SpotifyWebApi from "spotify-web-api-node";
import type { StreamCompanionConnection } from "./osuStreamCompanion";

/**
 * The logging ID of this module.
 */
const LOG_ID = "main";

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
): Promise<void> => {
  const loggerMain = createLogFunc(logger, LOG_ID);

  // Read in paths/values from environment variables
  // Twitch connection
  const twitchName = getEnvVariableValueOrUndefined(EnvVariable.TWITCH_NAME);
  const twitchOAuthToken = getEnvVariableValueOrUndefined(
    EnvVariable.TWITCH_OAUTH_TOKEN
  );
  const twitchChannels = getEnvVariableValueOrUndefined(
    EnvVariable.TWITCH_CHANNELS
  );
  const twitchDebug =
    getEnvVariableValueOrUndefined(EnvVariable.TWITCH_DEBUG) ===
    EnvVariableOnOff.ON;
  // Twitch API
  const twitchApiClientId = getEnvVariableValueOrUndefined(
    EnvVariable.TWITCH_API_CLIENT_ID
  );
  const twitchApiAccessToken = getEnvVariableValueOrUndefined(
    EnvVariable.TWITCH_API_ACCESS_TOKEN
  );
  // > Moonpie
  const pathDatabaseMoonpie = path.resolve(
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
  // > Spotify
  const pathDatabaseSpotify = path.resolve(
    configDir,
    getEnvVariableValueOrDefault(EnvVariable.SPOTIFY_DATABASE_PATH, configDir)
  );
  const spotifyEnableCommands = getEnvVariableValueOrDefault(
    EnvVariable.SPOTIFY_ENABLE_COMMANDS,
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
  const osuApiBeatmapRequests =
    getEnvVariableValueOrDefault(
      EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS,
      configDir
    ) === EnvVariableOnOff.ON;
  const osuApiBeatmapRequestsDetailed =
    getEnvVariableValueOrDefault(
      EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED,
      configDir
    ) === EnvVariableOnOff.ON;
  const pathDatabaseOsuApi = path.resolve(
    configDir,
    getEnvVariableValueOrDefault(
      EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DATABASE_PATH,
      configDir
    )
  );
  const osuApiBeatmapRequestsRedeemId = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_REDEEM_ID
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
  const osuStreamCompanionDirPath = getEnvVariableValueOrUndefined(
    EnvVariable.OSU_STREAM_COMPANION_DIR_PATH
  );
  // > Custom commands and broadcasts
  const pathDatabaseCustomCommandsBroadcasts = path.resolve(
    configDir,
    getEnvVariableValueOrDefault(
      EnvVariable.CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH,
      configDir
    )
  );

  // Initialize global objects
  // Twitch connection
  const twitchClientChannels = twitchChannels
    ?.split(" ")
    .filter((a) => a.trim().length !== 0);
  const twitchClient = createTwitchClient(
    twitchName,
    twitchOAuthToken,
    twitchClientChannels,
    twitchDebug,
    logger
  );
  // Twitch API
  let twitchApiClient: undefined | ApiClient;
  if (twitchApiClientId && twitchApiAccessToken) {
    const authProviderScopes = new StaticAuthProvider(
      twitchApiClientId,
      twitchApiAccessToken
    );
    twitchApiClient = new ApiClient({
      authProvider: authProviderScopes,
    });
  }
  // > osu! API
  const enableOsu = osuApiClientId && osuApiClientSecret && osuApiDefaultId;
  const enableOsuIrc = osuIrcPassword && osuIrcUsername && osuIrcRequestTarget;
  const enableOsuBeatmapRequests = osuApiBeatmapRequests;
  const enableOsuBeatmapRequestsDetailed = osuApiBeatmapRequestsDetailed;
  const enableOsuBeatmapRequestsRedeemId = osuApiBeatmapRequestsRedeemId;
  // Remove commands that should not be usable if map requests are off
  if (!enableOsuBeatmapRequests) {
    for (const command of [
      OsuCommands.LAST_REQUEST,
      OsuCommands.PERMIT_REQUEST,
      OsuCommands.REQUESTS,
    ]) {
      const indexCommand = osuEnableCommands.findIndex((a) => a === command);
      if (indexCommand > -1) {
        osuEnableCommands.splice(indexCommand, 1);
      }
    }
  }
  let osuIrcBot: OsuIrcBotSendMessageFunc | undefined;
  if (enableOsu && enableOsuBeatmapRequests && enableOsuIrc) {
    osuIrcBot = (id: string) =>
      createOsuIrcConnection(osuIrcUsername, osuIrcPassword, id, logger);
  }
  // > osu! StreamCompanion
  let osuStreamCompanionCurrentMapData: undefined | StreamCompanionConnection;
  if (osuStreamCompanionUrl) {
    osuStreamCompanionCurrentMapData = createStreamCompanionWebSocketConnection(
      osuStreamCompanionUrl,
      logger
    );
  } else if (osuStreamCompanionDirPath) {
    osuStreamCompanionCurrentMapData = createStreamCompanionFileConnection(
      osuStreamCompanionDirPath,
      logger
    );
  }

  // Setup/Migrate/Backup moonpie database
  const setupMigrateBackupMoonpieDatabase = async () => {
    // Only touch the database if it will be used
    if (
      moonpieEnableCommands.length > 0 &&
      !(
        moonpieEnableCommands.length === 1 &&
        moonpieEnableCommands.includes(EnvVariableNone.NONE)
      )
    ) {
      // Setup database tables (or do nothing if they already exist)
      await moonpieDb.setup(pathDatabaseMoonpie, logger);
      const databaseBackupData =
        await moonpieDb.backup.exportMoonpieCountTableToJson(
          pathDatabaseMoonpie,
          logger
        );
      const pathDatabaseBackup = path.join(logDir, fileNameDatabaseBackups());
      await writeJsonFile(pathDatabaseBackup, databaseBackupData);
    }
  };

  // Setup/Migrate osu!requests database
  const setupMigrateOsuRequestsDatabase = async () => {
    // Only touch the database if it will be used
    if (
      enableOsu &&
      osuEnableCommands.length > 0 &&
      !(
        osuEnableCommands.length === 1 &&
        osuEnableCommands.includes(EnvVariableNone.NONE)
      )
    ) {
      // Setup database tables (or do nothing if they already exist)
      await osuRequestsDb.setup(pathDatabaseOsuApi, logger);
    }
  };

  // Setup/Migrate custom commands/broadcasts database
  const setupMigrateCustomCommandsBroadcastsDatabase = async () => {
    // Setup database tables (or do nothing if they already exist)
    await customCommandsBroadcastsDb.setup(
      pathDatabaseCustomCommandsBroadcasts,
      logger
    );
  };

  // Setup/Migrate spotify database
  const setupMigrateSpotifyDatabase = async () => {
    // Only touch the moonpie database if it will be used
    if (
      spotifyApiClientId !== undefined &&
      spotifyApiClientSecret !== undefined
    ) {
      // Setup database tables (or do nothing if they already exist)
      await spotifyDb.setup(pathDatabaseSpotify, logger);
      if (spotifyApiRefreshToken !== undefined) {
        await spotifyDb.requests.spotifyConfig.createOrUpdateEntry(
          pathDatabaseSpotify,
          {
            option: SpotifyConfig.REFRESH_TOKEN,
            optionValue: spotifyApiRefreshToken,
          },
          logger
        );
      }
    }
  };

  // Run all file related async methods in parallel
  await Promise.all([
    setupMigrateBackupMoonpieDatabase(),
    setupMigrateCustomCommandsBroadcastsDatabase(),
    setupMigrateOsuRequestsDatabase(),
    setupMigrateSpotifyDatabase(),
  ]);

  // Setup Spotify API
  let spotifyWebApi: undefined | SpotifyWebApi;
  if (spotifyApiClientId && spotifyApiClientSecret) {
    spotifyWebApi = await setupSpotifyAuthentication(
      spotifyApiClientId,
      spotifyApiClientSecret,
      pathDatabaseSpotify,
      logger
    );
  }

  // Setup message parser
  const stringMap = updateStringsMapWithCustomEnvStrings(
    defaultStringMap,
    logger
  );
  const macroMap = generateMacroMap(defaultMacros);
  const pluginMap = generatePluginMap(defaultPlugins);
  if (osuApiDefaultId) {
    macroMap.set(
      macroOsuApi.id,
      new Map(macroOsuApi.generate({ osuApiDefaultId }))
    );
  }
  if (osuApiClientId && osuApiClientSecret) {
    pluginsOsuGenerator.map((plugin) => {
      const pluginReady = generatePlugin(plugin, {
        osuApiV2Credentials: {
          clientId: parseInt(osuApiClientId),
          clientSecret: osuApiClientSecret,
        },
      });
      pluginMap.set(pluginReady.id, pluginReady.func);
    });
  }
  const temp = osuStreamCompanionCurrentMapData;
  if (temp !== undefined) {
    pluginsOsuStreamCompanionGenerator.map((plugin) => {
      const pluginReady = generatePlugin(plugin, {
        streamCompanionDataFunc: temp,
      });
      pluginMap.set(pluginReady.id, pluginReady.func);
    });
  }
  if (spotifyWebApi !== undefined) {
    const pluginSpotifyReady = generatePlugin(pluginSpotifyGenerator, {
      spotifyWebApi,
    });
    pluginMap.set(pluginSpotifyReady.id, pluginSpotifyReady.func);
  }

  // Setup custom commands
  const customCommands =
    await customCommandsBroadcastsDb.requests.customCommand.getEntries(
      pathDatabaseCustomCommandsBroadcasts,
      logger
    );

  // Setup custom broadcasts
  const customBroadcasts =
    await customCommandsBroadcastsDb.requests.customBroadcast.getEntries(
      pathDatabaseCustomCommandsBroadcasts,
      logger
    );
  const customBroadcastsScheduledTasks = new Map<string, ScheduledTask>();
  for (const customBroadcast of customBroadcasts) {
    const customBroadcastScheduledTask = createBroadcastScheduledTask(
      twitchClient,
      twitchClientChannels ? twitchClientChannels : [],
      customBroadcast,
      stringMap,
      pluginMap,
      macroMap,
      logger
    );
    customBroadcastsScheduledTasks.set(
      customBroadcast.id,
      customBroadcastScheduledTask
    );
  }

  /**
   * Run this method every time a new message is detected.
   * This is a method on it's own in order to maybe support more than twitch in
   * the future and to decouple it from the Twitch event logic.
   *
   * @param channel The Twitch channel (#channel_name).
   * @param tags The Twitch message tags.
   * @param message The message.
   * @param self True if the message was written by this client.
   */
  const onNewMessage = async (
    channel: string,
    tags: ChatUserstate,
    message: string,
    self: boolean
  ): Promise<void> => {
    // Ignore messages written by the Twitch client
    if (self) {
      return;
    }

    const pluginMapChannel = new Map(pluginMap);
    const macroMapChannel = new Map(macroMap);
    const tempTwitchApiClient = twitchApiClient;
    if (tempTwitchApiClient !== undefined) {
      pluginsTwitchApiGenerator.forEach((a) => {
        const plugin = generatePlugin<PluginTwitchApiData>(a, {
          channelName: channel.slice(1),
          twitchApiClient: tempTwitchApiClient,
          twitchUserId: tags["user-id"],
        });
        pluginMapChannel.set(plugin.id, plugin.func);
      });
    }
    pluginsTwitchChatGenerator.forEach((a) => {
      const plugin = generatePlugin<PluginTwitchChatData>(a, {
        channelName: channel.slice(1),
        userId: tags["user-id"],
        userName: tags.username,
      });
      pluginMapChannel.set(plugin.id, plugin.func);
    });

    // Handle all bot commands
    try {
      await moonpieChatHandler(
        twitchClient,
        channel,
        tags,
        message,
        {
          enabledCommands: moonpieEnableCommands,
          moonpieClaimCooldownHours: moonpieClaimCooldownHoursNumber,
          moonpieDbPath: pathDatabaseMoonpie,
        },
        stringMap,
        pluginMapChannel,
        macroMapChannel,
        logger
      );
    } catch (err) {
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
    }

    if (enableOsu || osuStreamCompanionCurrentMapData !== undefined) {
      try {
        await osuChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          enableOsu
            ? {
                defaultOsuId: parseInt(osuApiDefaultId),
                enableOsuBeatmapRequests,
                enableOsuBeatmapRequestsDetailed,
                enableOsuBeatmapRequestsRedeemId,
                enabledCommands: osuEnableCommands,
                osuApiDbPath: pathDatabaseOsuApi,
                osuApiV2Credentials: {
                  clientId: parseInt(osuApiClientId),
                  clientSecret: osuApiClientSecret,
                },
                osuIrcBot,
                osuIrcRequestTarget,
                osuStreamCompanionCurrentMapData,
              }
            : {
                enabledCommands: osuEnableCommands.filter(
                  (a) => a === OsuCommands.NP || a === OsuCommands.COMMANDS
                ),
                osuStreamCompanionCurrentMapData,
              },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger
        );
      } catch (err) {
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
      }
    }

    if (spotifyWebApi !== undefined) {
      try {
        await spotifyChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          {
            enabledCommands: spotifyEnableCommands,
            spotifyWebApi,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger
        );
      } catch (err) {
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
      }
    }

    // Check custom commands
    try {
      const pluginsCustomCommands = new Map(pluginMapChannel);
      // Add plugins to manipulate custom command global data
      pluginsCustomCommandDataGenerator.forEach((a) => {
        const plugin = generatePlugin(a, {
          databasePath: pathDatabaseCustomCommandsBroadcasts,
        });
        pluginsCustomCommands.set(plugin.id, plugin.func);
      });
      for (const customCommand of customCommands) {
        const pluginsCustomCommand = new Map(pluginsCustomCommands);
        // Add plugins to manipulate custom command
        pluginsCustomCommandGenerator.forEach((a) => {
          const plugin = generatePlugin(a, { customCommand });
          pluginsCustomCommand.set(plugin.id, plugin.func);
        });

        const executed = await runTwitchCommandHandler(
          twitchClient,
          channel,
          tags,
          message,
          {},
          stringMap,
          pluginsCustomCommand,
          macroMapChannel,
          logger,
          customCommandChatHandler(
            customCommand,
            pathDatabaseCustomCommandsBroadcasts
          )
        );
        if (!executed) {
          continue;
        }
        customCommand.count += 1;
        customCommand.timestampLastExecution = Date.now();
        await customCommandsBroadcastsDb.requests.customCommand.updateEntry(
          pathDatabaseCustomCommandsBroadcasts,
          {
            countIncrease: 1,
            id: customCommand.id,
            timestampLastExecution: customCommand.timestampLastExecution,
          },
          logger
        );
      }
    } catch (err) {
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
    }
  };

  // Connect functionality to Twitch connection triggers
  twitchClient.on(
    TwitchClientListener.NEW_REDEEM,
    (channel, username, rewardType) => {
      // Log when a new redeem was made
      loggerMain.debug(
        `User "${username}" redeemed "${rewardType}" in the channel "${channel}"`
      );
    }
  );
  twitchClient.on(
    TwitchClientListener.CLIENT_CONNECTING_TO_TWITCH,
    (address, port) => {
      // Log when the client is trying to connect to Twitch
      loggerMain.info(`Connecting to Twitch: ${address}:${port}`);
    }
  );
  twitchClient.on(
    TwitchClientListener.CLIENT_CONNECTED_TO_TWITCH,
    (address, port) => {
      // Log when the client successfully connected to Twitch
      loggerMain.info(`Connected to Twitch: ${address}:${port}`);
    }
  );
  twitchClient.on(
    TwitchClientListener.CLIENT_DISCONNECTED_FROM_TWITCH,
    (reason) => {
      // Log when the client disconnects from Twitch
      loggerMain.info(`Disconnected from Twitch: ${reason}`);
    }
  );
  twitchClient.on(
    TwitchClientListener.USER_JOINED_CHANNEL,
    (channel, username, self) => {
      // Log when the Twitch client itself joins a Twitch channel
      if (self) {
        loggerMain.info(
          `Joined the Twitch channel "${channel}" as "${username}"`
        );
      }
    }
  );
  twitchClient.on(
    TwitchClientListener.NEW_MESSAGE,
    (channel, tags, message, self) => {
      onNewMessage(channel, tags, message, self).catch((err) => {
        loggerMain.error(err as Error);
      });
    }
  );

  process.on("SIGINT", () => {
    // When the process is being force closed catch that and close "safely"
    loggerMain.info("SIGINT was detected");
    process.exit();
  });

  // Connect Twitch client to Twitch
  await twitchClient.connect();

  // Send osu! IRC message when bot is started
  if (enableOsu && osuIrcBot && osuIrcRequestTarget) {
    try {
      await tryToSendOsuIrcMessage(
        osuIrcBot,
        "main",
        osuIrcRequestTarget,
        `UwU (${name} ${getVersionFromObject(version)})`,
        logger
      );
    } catch (err) {
      loggerMain.error(err as Error);
    }
  }
};
