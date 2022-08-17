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
import { defaultPlugins, generatePlugin } from "./messageParser/plugins";
import {
  defaultStringMap,
  updateStringsMapWithCustomEnvStrings,
} from "./strings";
import { EnvVariable, EnvVariableNone, EnvVariableOnOff } from "./info/env";
import {
  fileNameCustomCommands,
  fileNameCustomTimers,
  fileNameDatabaseBackups,
} from "./info/fileNames";
import {
  getCustomCommand,
  loadCustomCommandsFromFile,
} from "./customCommandsTimers/customCommand";
import {
  getEnvVariableValueOrDefault,
  getEnvVariableValueOrUndefined,
} from "./env";
import {
  loadCustomTimersFromFile,
  registerTimer,
} from "./customCommandsTimers/customTimer";
import { moonpieDbBackup, moonpieDbSetupTables } from "./database/moonpieDb";
import {
  pluginsCustomCommandDataGenerator,
  pluginsCustomCommandGenerator,
} from "./messageParser/plugins/customCommand";
import { createLogFunc } from "./logging";
import { defaultMacros } from "./messageParser/macros";
import { generateMacroPluginMap } from "./messageParser";
import { getVersionFromObject } from "./version";
import { macroOsuApi } from "./messageParser/macros/osuApi";
import { moonpieChatHandler } from "./commands/moonpie";
import { name } from "./info/general";
import { osuChatHandler } from "./commands/osu";
import { OsuCommands } from "./info/commands";
import { pluginsOsuGenerator } from "./messageParser/plugins/osuApi";
import { pluginsOsuStreamCompanionGenerator } from "./messageParser/plugins/osuStreamCompanion";
import { pluginSpotifyGenerator } from "./messageParser/plugins/spotify";
import { pluginsTwitchApiGenerator } from "./messageParser/plugins/twitchApi";
import { pluginsTwitchChatGenerator } from "./messageParser/plugins/twitchChat";
import { setupSpotifyAuthentication } from "./spotify";
import { spotifyChatHandler } from "./commands/spotify";
import { version } from "./info/version";
import { writeJsonFile } from "./other/fileOperations";
// Type imports
import type { CustomCommandsJson } from "./customCommandsTimers/customCommand";
import type { CustomTimer } from "./customCommandsTimers/customTimer";
import type { ErrorWithCode } from "./error";
import type { Logger } from "winston";
import type { OsuIrcBotSendMessageFunc } from "./commands/osu/beatmap";
import type { PluginTwitchApiData } from "./messageParser/plugins/twitchApi";
import type { PluginTwitchChatData } from "./messageParser/plugins/twitchChat";
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
  const pathCustomTimers = path.join(configDir, fileNameCustomTimers);
  const pathCustomCommands = path.join(configDir, fileNameCustomCommands);

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
  const spotifyEnableCommands = getEnvVariableValueOrDefault(
    EnvVariable.SPOTIFY_ENABLE_COMMANDS,
    configDir
  ).split(",");
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

  // Initialize global objects
  // Twitch connection
  const twitchClient = createTwitchClient(
    twitchName,
    twitchOAuthToken,
    twitchChannels?.split(" ").filter((a) => a.trim().length !== 0),
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
  // > Spotify API
  let spotifyWebApi: undefined | SpotifyWebApi;
  if (spotifyApiClientId && spotifyApiClientSecret) {
    spotifyWebApi = await setupSpotifyAuthentication(
      spotifyApiClientId,
      spotifyApiClientSecret,
      spotifyApiRefreshToken,
      logger
    );
  }
  // > osu! API
  const enableOsu = osuApiClientId && osuApiClientSecret && osuApiDefaultId;
  const enableOsuIrc = osuIrcPassword && osuIrcUsername && osuIrcRequestTarget;
  const enableOsuBeatmapRequests = osuApiBeatmapRequests;
  const enableOsuBeatmapRequestsDetailed = osuApiBeatmapRequestsDetailed;
  const enableOsuBeatmapRequestsRedeemId = osuApiBeatmapRequestsRedeemId;
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

  // Load custom commands/timers from files
  const customCommands: CustomCommandsJson = {
    commands: [],
    data: [],
  };
  const customTimers: CustomTimer[] = [];
  const loadCustomCommands = async () => {
    const data = await loadCustomCommandsFromFile(pathCustomCommands, logger);
    customCommands.commands.push(...data.customCommands);
    if (data.customCommandsGlobalData) {
      if (customCommands.data === undefined) {
        customCommands.data = [];
      }
      customCommands.data.push(...data.customCommandsGlobalData);
    }
  };
  const loadCustomTimers = async () => {
    customTimers.push(
      ...(await loadCustomTimersFromFile(pathCustomTimers, logger))
    );
  };

  // Setup/Migrate/Backup moonpie database
  const setupMigrateBackupMoonpieDatabase = async () => {
    // Only touch the moonpie database if it will be used
    if (
      moonpieEnableCommands.length > 0 &&
      !(
        moonpieEnableCommands.length === 1 &&
        moonpieEnableCommands.includes(EnvVariableNone.NONE)
      )
    ) {
      // Setup database tables (or do nothing if they already exist)
      await moonpieDbSetupTables(pathDatabase, logger);
      const databaseBackupData =
        await moonpieDbBackup.exportMoonpieCountTableToJson(
          pathDatabase,
          logger
        );
      const pathDatabaseBackup = path.join(logDir, fileNameDatabaseBackups());
      await writeJsonFile(pathDatabaseBackup, databaseBackupData);
    }
  };

  // Run all file related async methods in parallel
  await Promise.all([
    loadCustomCommands(),
    loadCustomTimers(),
    setupMigrateBackupMoonpieDatabase(),
  ]);

  // Setup message parser
  const stringMap = updateStringsMapWithCustomEnvStrings(
    defaultStringMap,
    logger
  );
  const macroPluginMap = generateMacroPluginMap(defaultPlugins, defaultMacros);
  if (osuApiDefaultId) {
    macroPluginMap.macroMap.set(
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
      macroPluginMap.pluginMap.set(pluginReady.id, pluginReady.func);
    });
  }
  const temp = osuStreamCompanionCurrentMapData;
  if (temp !== undefined) {
    pluginsOsuStreamCompanionGenerator.map((plugin) => {
      const pluginReady = generatePlugin(plugin, {
        streamCompanionDataFunc: temp,
      });
      macroPluginMap.pluginMap.set(pluginReady.id, pluginReady.func);
    });
  }
  if (spotifyWebApi !== undefined) {
    const pluginSpotifyReady = generatePlugin(pluginSpotifyGenerator, {
      spotifyWebApi,
    });
    macroPluginMap.pluginMap.set(
      pluginSpotifyReady.id,
      pluginSpotifyReady.func
    );
  }

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
      // Ignore messages written by the Twitch client
      if (self) {
        return;
      }

      const pluginMapChannel = new Map(macroPluginMap.pluginMap);
      const macroMapChannel = new Map(macroPluginMap.macroMap);
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
      moonpieChatHandler(
        twitchClient,
        channel,
        tags,
        message,
        {
          enabledCommands: moonpieEnableCommands,
          moonpieClaimCooldownHours: moonpieClaimCooldownHoursNumber,
          moonpieDbPath: pathDatabase,
        },
        stringMap,
        pluginMapChannel,
        macroMapChannel,
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
            defaultOsuId: parseInt(osuApiDefaultId),
            enableOsuBeatmapRequests,
            enableOsuBeatmapRequestsDetailed,
            enableOsuBeatmapRequestsRedeemId,
            enabledCommands: osuEnableCommands,
            osuApiV2Credentials: {
              clientId: parseInt(osuApiClientId),
              clientSecret: osuApiClientSecret,
            },
            osuIrcBot,
            osuIrcRequestTarget,
            osuStreamCompanionCurrentMapData,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
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
          {
            // TODO Fix this later - either create a new handler or block the commands automatically
            enabledCommands: osuEnableCommands.filter(
              (a) => a === OsuCommands.NP
            ),
            osuStreamCompanionCurrentMapData,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
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
          {
            enabledCommands: spotifyEnableCommands,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger
        ).catch((err) => {
          loggerMain.error(err as Error);
          // When the chat handler throws an error write the error message in chat
          const errorInfo = err as ErrorWithCode;
          twitchClient
            .say(
              channel,
              `${
                tags.username ? "@" + tags.username + " " : ""
              }Spotify Error: ${errorInfo.message}${
                errorInfo.code ? " (" + errorInfo.code + ")" : ""
              }`
            )
            .catch(loggerMain.error);
        });
      }

      // Check custom commands
      try {
        const pluginsCustomCommands = new Map(pluginMapChannel);
        // Add plugins to manipulate custom command global data
        pluginsCustomCommandDataGenerator.forEach((a) => {
          const plugin = generatePlugin(a, { customCommands });
          pluginsCustomCommands.set(plugin.id, plugin.func);
        });
        for (const customCommand of customCommands.commands.filter((a) =>
          a.channels.includes(channel.slice(1))
        )) {
          const pluginsCustomCommand = new Map(pluginsCustomCommands);
          // Add plugins to manipulate custom command
          pluginsCustomCommandGenerator.forEach((a) => {
            const plugin = generatePlugin(a, { customCommand });
            pluginsCustomCommand.set(plugin.id, plugin.func);
          });

          runTwitchCommandHandler(
            twitchClient,
            channel,
            tags,
            message,
            {},
            stringMap,
            pluginsCustomCommand,
            macroMapChannel,
            logger,
            getCustomCommand(customCommand)
          )
            .then((executed) => {
              if (!executed) {
                return;
              }
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
    }
  );

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
        stringMap,
        macroPluginMap.pluginMap,
        macroPluginMap.macroMap,
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
        `UwU (${name} ${getVersionFromObject(version)})`,
        logger
      );
    } catch (err) {
      loggerMain.error(err as Error);
    }
  }
};
