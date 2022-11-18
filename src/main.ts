/*
 * Main method of the bot that connect and sets up everything.
 */

// Package imports
import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
// Local imports
import {
  createBroadcastScheduledTask,
  stopBroadcastScheduledTask,
} from "./customCommandsBroadcasts/customBroadcast";
import { createOsuIrcConnection, tryToSendOsuIrcMessage } from "./osuIrc";
import {
  createStreamCompanionFileConnection as createStreamCompanionFile,
  createStreamCompanionWebSocketConnection as createStreamCompanionWebSocket,
} from "./osuStreamCompanion";
import { createTwitchClient, TwitchClientListener } from "./twitch";
import {
  generateMacroMap,
  generatePlugin,
  generatePluginMap,
  updateStringsMapWithCustomEnvStrings,
} from "./messageParser";
import { MoonpieCommands, OsuCommands } from "./info/commands";
import { createLogFunc } from "./logging";
import { customCommandChatHandler } from "./customCommandsBroadcasts/customCommand";
import { customCommandsBroadcastsChatHandler } from "./commands/customCommandsBroadcasts";
import customCommandsBroadcastsDb from "./database/customCommandsBroadcastsDb";
import { defaultMacros } from "./info/macros";
import { defaultPlugins } from "./info/plugins";
import { defaultStringMap } from "./info/strings";
import { getVersionFromObject } from "./version";
import { lurkChatHandler } from "./commands/lurk";
import { macroOsuApi } from "./info/macros/osuApi";
import { moonpieChatHandler } from "./commands/moonpie";
import moonpieDb from "./database/moonpieDb";
import { name } from "./info/general";
import { osuChatHandler } from "./commands/osu";
import { OsuRequestsConfig } from "./info/databases/osuRequestsDb";
import osuRequestsDb from "./database/osuRequestsDb";
import { pluginCountGenerator } from "./info/plugins/count";
import { pluginsCustomCommandDataGenerator } from "./info/plugins/customDataLogic";
import { pluginsOsuGenerator } from "./info/plugins/osuApi";
import { pluginsOsuStreamCompanionGenerator } from "./info/plugins/osuStreamCompanion";
import { pluginSpotifyGenerator } from "./info/plugins/spotify";
import { pluginsTwitchApiGenerator } from "./info/plugins/twitchApi";
import { pluginsTwitchChatGenerator } from "./info/plugins/twitchChat";
import { runChatMessageHandlerReplyCreator } from "./chatMessageHandler";
import { setupSpotifyAuthentication } from "./spotify";
import { spotifyChatHandler } from "./commands/spotify";
import { SpotifyConfig } from "./database/spotifyDb/requests/spotifyConfig";
import spotifyDb from "./database/spotifyDb";
import { version } from "./info/version";
// Type imports
import type { ChatUserstate } from "tmi.js";
import type { CustomBroadcast } from "./customCommandsBroadcasts/customBroadcast";
import type { CustomCommand } from "./customCommandsBroadcasts/customCommand";
import type { DeepReadonly } from "./other/types";
import type { ErrorWithCode } from "./error";
import type { Logger } from "winston";
import type { MoonpieConfig } from "./info/config/moonpieConfig";
import type { OsuIrcBotSendMessageFunc } from "./commands/osu/beatmap";
import type { PluginTwitchApiData } from "./info/plugins/twitchApi";
import type { PluginTwitchChatData } from "./info/plugins/twitchChat";
import type { ScheduledTask } from "node-cron";
import type SpotifyWebApi from "spotify-web-api-node";

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
 * @param config The configuration information.
 * @param logDir The directory in which all logs are contained.
 */
export const main = async (
  logger: Logger,
  config: DeepReadonly<MoonpieConfig>
): Promise<void> => {
  const loggerMain = createLogFunc(logger, LOG_ID);

  // Initialize global objects
  // Twitch connection
  const twitchClient = createTwitchClient(
    config.twitch.name,
    config.twitch.oAuthToken,
    config.twitch.channels,
    config.twitch.debug,
    logger
  );
  // Twitch API
  let twitchApiClient: undefined | ApiClient;
  if (
    config?.twitchApi?.clientId !== undefined &&
    config?.twitchApi?.accessToken !== undefined
  ) {
    const authProviderScopes = new StaticAuthProvider(
      config.twitchApi.clientId,
      config.twitchApi.accessToken
    );
    twitchApiClient = new ApiClient({
      authProvider: authProviderScopes,
    });
  }
  // > osu! API
  /** If this is true it means that osu API credentials were found. */
  const enableOsuApi =
    config.osuApi !== undefined &&
    config.osuApi?.clientId !== undefined &&
    config.osuApi?.clientSecret !== undefined &&
    config.osuApi?.defaultId !== undefined;
  /** If this is true it means that osu IRC credentials were found. */
  const enableOsuIrc =
    config.osuIrc !== undefined &&
    config.osuIrc?.password !== undefined &&
    config.osuIrc?.username !== undefined &&
    config.osuIrc?.requestTarget !== undefined;
  // > osu! IRC
  let osuIrcBot: OsuIrcBotSendMessageFunc | undefined;
  if (enableOsuIrc) {
    const osuIrcUsername = config.osuIrc.username;
    const osuIrcPassword = config.osuIrc.password;
    osuIrcBot = (id: string) =>
      createOsuIrcConnection(osuIrcUsername, osuIrcPassword, id, logger);
  }
  // > osu! StreamCompanion
  /**
   * If this is not undefined it means there is a function to get the current
   * map data via a StreamCompanion interface.
   */
  const osuStreamCompanionCurrentMapData = config?.osuStreamCompanion?.url
    ? createStreamCompanionWebSocket(config?.osuStreamCompanion.url, logger)
    : config?.osuStreamCompanion?.dirPath
    ? createStreamCompanionFile(config?.osuStreamCompanion?.dirPath, logger)
    : undefined;
  /** If this is true it means that osu StreamCompanion func exists. */
  const enableOsuStreamCompanion =
    osuStreamCompanionCurrentMapData !== undefined;
  // > Spotify API
  /** If this is true it means that spotify API credentials were found. */
  const enableSpotifyApi =
    config.spotify !== undefined &&
    config.spotifyApi !== undefined &&
    config.spotifyApi?.clientId !== undefined &&
    config.spotifyApi?.clientSecret !== undefined;

  // Setup/Migrate moonpie database
  const setupMigrateBackupMoonpieDatabase = async () => {
    // Only touch the database if it will be used
    if (
      config.moonpie !== undefined &&
      config.moonpie.enableCommands.filter(
        (a) => a !== MoonpieCommands.COMMANDS && a !== MoonpieCommands.ABOUT
      ).length > 0
    ) {
      // Setup database tables (or do nothing if they already exist)
      await moonpieDb.setup(config.moonpie.databasePath, logger);
    }
  };

  // Setup/Migrate osu!requests database
  const setupMigrateOsuRequestsConfigDatabase = async () => {
    // Only touch the database if it will be used
    if (
      config.osu !== undefined &&
      config.osu.enableCommands.filter(
        (a) => a !== OsuCommands.COMMANDS && a !== OsuCommands.NP
      ).length > 0 &&
      enableOsuApi
    ) {
      // Setup database tables (or do nothing if they already exist)
      await osuRequestsDb.setup(config.osuApi.databasePath, logger);
      if (config.osuApi.beatmapRequestsDetailed !== undefined) {
        const detailed =
          config.osuApi.beatmapRequestsDetailed === true ? "true" : "false";
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          config.osuApi.databasePath,
          {
            option: OsuRequestsConfig.DETAILED,
            optionValue: detailed,
          },
          logger
        );
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          config.osuApi.databasePath,
          {
            option: OsuRequestsConfig.DETAILED_IRC,
            optionValue: detailed,
          },
          logger
        );
      }
      if (config.osuApi.beatmapRequestsRedeemId !== undefined) {
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          config.osuApi.databasePath,
          {
            option: OsuRequestsConfig.REDEEM_ID,
            optionValue: config.osuApi.beatmapRequestsRedeemId,
          },
          logger
        );
      }
    }
  };

  // Setup/Migrate custom commands/broadcasts database
  const setupMigrateCustomCommandsBroadcastsDatabase = async () => {
    if (config.customCommandsBroadcasts !== undefined) {
      // Setup database tables (or do nothing if they already exist)
      await customCommandsBroadcastsDb.setup(
        config.customCommandsBroadcasts.databasePath,
        logger
      );
    }
  };

  // Setup/Migrate spotify database
  const setupMigrateSpotifyDatabase = async () => {
    if (enableSpotifyApi) {
      // Setup database tables (or do nothing if they already exist)
      await spotifyDb.setup(config.spotify.databasePath, logger);
      if (config.spotifyApi.refreshToken !== undefined) {
        await spotifyDb.requests.spotifyConfig.createOrUpdateEntry(
          config.spotify.databasePath,
          {
            option: SpotifyConfig.REFRESH_TOKEN,
            optionValue: config.spotifyApi.refreshToken,
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
    setupMigrateOsuRequestsConfigDatabase(),
    setupMigrateSpotifyDatabase(),
  ]);

  // Setup Spotify API
  let spotifyWebApi: undefined | SpotifyWebApi;
  if (enableSpotifyApi) {
    spotifyWebApi = await setupSpotifyAuthentication(
      config.spotifyApi.clientId,
      config.spotifyApi.clientSecret,
      config.spotify.databasePath,
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
  if (enableOsuApi) {
    macroMap.set(
      macroOsuApi.id,
      new Map(
        macroOsuApi.generate({ osuApiDefaultId: config.osuApi.defaultId })
      )
    );
    const osuApiClientId = config.osuApi.clientId;
    const osuApiClientSecret = config.osuApi.clientSecret;
    pluginsOsuGenerator.map((plugin) => {
      const pluginReady = generatePlugin(plugin, {
        osuApiV2Credentials: {
          clientId: osuApiClientId,
          clientSecret: osuApiClientSecret,
        },
      });
      pluginMap.set(pluginReady.id, pluginReady.func);
    });
  }
  if (osuStreamCompanionCurrentMapData !== undefined) {
    pluginsOsuStreamCompanionGenerator.map((plugin) => {
      const pluginReady = generatePlugin(plugin, {
        streamCompanionDataFunc: osuStreamCompanionCurrentMapData,
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
  const customCommandsBroadcastsRefreshHelper = {
    enabledCustomBroadcasts: new Map<string, ScheduledTask>(),
    refreshCustomBroadcasts: true,
    refreshCustomCommands: true,
  };
  let customCommands: CustomCommand[] = [];
  let customBroadcasts: CustomBroadcast[] = [];
  const refreshCustomCommandsBroadcasts = async () => {
    if (
      config.customCommandsBroadcasts !== undefined &&
      customCommandsBroadcastsRefreshHelper.refreshCustomCommands
    ) {
      logger.debug("Refresh custom commands...");
      customCommandsBroadcastsRefreshHelper.refreshCustomCommands = false;
      customCommands =
        await customCommandsBroadcastsDb.requests.customCommand.getEntries(
          config.customCommandsBroadcasts.databasePath,
          undefined,
          logger
        );
    }
    if (
      config.customCommandsBroadcasts !== undefined &&
      customCommandsBroadcastsRefreshHelper.refreshCustomBroadcasts
    ) {
      logger.debug("Refresh custom broadcasts...");
      customCommandsBroadcastsRefreshHelper.refreshCustomBroadcasts = false;
      customBroadcasts =
        await customCommandsBroadcastsDb.requests.customBroadcast.getEntries(
          config.customCommandsBroadcasts.databasePath,
          undefined,
          logger
        );
      // Stop all old running custom broadcasts
      for (const [
        customBroadcastId,
        scheduledTask,
      ] of customCommandsBroadcastsRefreshHelper.enabledCustomBroadcasts) {
        stopBroadcastScheduledTask(scheduledTask, customBroadcastId, logger);
      }
      customCommandsBroadcastsRefreshHelper.enabledCustomBroadcasts.clear();
      // Start new custom broadcasts
      for (const customBroadcast of customBroadcasts) {
        const customBroadcastScheduledTask = createBroadcastScheduledTask(
          twitchClient,
          config.twitch.channels,
          customBroadcast,
          stringMap,
          pluginMap,
          macroMap,
          logger
        );
        customCommandsBroadcastsRefreshHelper.enabledCustomBroadcasts.set(
          customBroadcast.id,
          customBroadcastScheduledTask
        );
      }
    }
  };
  await refreshCustomCommandsBroadcasts();

  // Use this method to notify the user about unexpected chat handler errors
  const chatHandlerErrorMessage = async (
    channel: string,
    tags: ChatUserstate,
    err: ErrorWithCode,
    chatHandlerId: string
  ) => {
    loggerMain.error(err);
    try {
      await twitchClient.say(
        channel,
        `${tags.username ? `@${tags.username} ` : ""}${chatHandlerId} Error: ${
          err.message
        }${err.code ? ` (${err.code})` : ""}`
      );
    } catch (errFunc) {
      loggerMain.error(errFunc as Error);
    }
  };

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
    if (config.moonpie) {
      try {
        await moonpieChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          {
            enabledCommands: config.moonpie.enableCommands,
            moonpieClaimCooldownHours: config.moonpie.claimCooldownHours,
            moonpieDbPath: config.moonpie.databasePath,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger
        );
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Moonpie"
        );
      }
    }

    if (
      config.osu !== undefined &&
      (enableOsuApi || enableOsuStreamCompanion)
    ) {
      try {
        if (enableOsuApi) {
          await osuChatHandler(
            twitchClient,
            channel,
            tags,
            message,
            {
              defaultOsuId: config.osuApi.defaultId,
              enableOsuBeatmapRequests:
                config.osu.enableCommands.includes(OsuCommands.REQUESTS) &&
                config.osuApi.beatmapRequests !== false,
              enabledCommands:
                config.osuApi.beatmapRequests === false
                  ? config.osu.enableCommands.filter(
                      (a) => a !== OsuCommands.REQUESTS
                    )
                  : config.osu.enableCommands,
              osuApiDbPath: config.osuApi.databasePath,
              osuApiV2Credentials: {
                clientId: config.osuApi.clientId,
                clientSecret: config.osuApi.clientSecret,
              },
              osuIrcBot,
              osuIrcRequestTarget: config.osuIrc?.requestTarget,
              osuStreamCompanionCurrentMapData,
            },
            stringMap,
            pluginMapChannel,
            macroMapChannel,
            logger
          );
        } else if (enableOsuStreamCompanion) {
          await osuChatHandler(
            twitchClient,
            channel,
            tags,
            message,
            {
              // If osu api credentials are not available only allow the
              // !osu commands and !np command to be enabled
              enabledCommands: config.osu.enableCommands.filter(
                (a) => a === OsuCommands.NP || a === OsuCommands.COMMANDS
              ),
              osuStreamCompanionCurrentMapData,
            },
            stringMap,
            pluginMapChannel,
            macroMapChannel,
            logger
          );
        }
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "osu!"
        );
      }
    }

    if (enableSpotifyApi && spotifyWebApi !== undefined) {
      try {
        await spotifyChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          {
            enabledCommands: config.spotify.enableCommands,
            spotifyWebApi,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger
        );
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Spotify"
        );
      }
    }

    if (config.lurk !== undefined) {
      try {
        await lurkChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          {
            enabledCommands: config.lurk.enableCommands,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger
        );
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Lurk"
        );
      }
    }

    if (config.customCommandsBroadcasts !== undefined) {
      try {
        await customCommandsBroadcastsChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          {
            customCommandsBroadcastsDbPath:
              config.customCommandsBroadcasts.databasePath,
            customCommandsBroadcastsRefreshHelper,
            enabledCommands: config.customCommandsBroadcasts.enableCommands,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger
        );
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Custom Commands/Broadcasts"
        );
      }

      // Refresh custom commands/broadcasts if necessary (maybe a new one was added)
      await refreshCustomCommandsBroadcasts();

      // Check custom commands
      try {
        const pluginsCustomCommands = new Map(pluginMapChannel);
        // Add plugins to manipulate custom command global data
        const customCommandsBroadcastsDatabase =
          config.customCommandsBroadcasts.databasePath;
        pluginsCustomCommandDataGenerator.forEach((a) => {
          const plugin = generatePlugin(a, {
            databasePath: customCommandsBroadcastsDatabase,
          });
          pluginsCustomCommands.set(plugin.id, plugin.func);
        });
        for (const customCommand of customCommands) {
          const pluginsCustomCommand = new Map(pluginsCustomCommands);
          // Add plugins to manipulate custom command
          pluginsCustomCommand.set(
            pluginCountGenerator.id,
            pluginCountGenerator.generate({
              count: customCommand.count,
            })
          );

          try {
            const executed = await runChatMessageHandlerReplyCreator(
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
                config.customCommandsBroadcasts.databasePath
              )
            );
            if (!executed) {
              continue;
            }
            await customCommandsBroadcastsDb.requests.customCommand.updateEntry(
              config.customCommandsBroadcasts.databasePath,
              {
                countIncrease: 1,
                id: customCommand.id,
                timestampLastExecution: Date.now(),
              },
              logger
            );
            customCommandsBroadcastsRefreshHelper.refreshCustomCommands = true;
          } catch (err) {
            await chatHandlerErrorMessage(
              channel,
              tags,
              err as ErrorWithCode,
              `Custom Command ${customCommand.id}`
            );
          }
        }
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Custom Command"
        );
      }
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
  let averageCommandHandleTime = 0;
  let averageCommandHandleCount = 0;
  twitchClient.on(
    TwitchClientListener.NEW_MESSAGE,
    (channel, tags, message, self) => {
      const startTime = performance.now();
      onNewMessage(channel, tags, message, self)
        .catch((err) => {
          loggerMain.error(err as Error);
        })
        .finally(() => {
          const endTime = performance.now();
          averageCommandHandleCount++;
          averageCommandHandleTime -=
            averageCommandHandleTime / averageCommandHandleCount;
          averageCommandHandleTime +=
            (endTime - startTime) / averageCommandHandleCount;
          loggerMain.debug(
            `Command was handled in ${
              endTime - startTime
            }ms (average time: ${averageCommandHandleTime}ms N=${averageCommandHandleCount})`
          );
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
  if (enableOsuIrc && osuIrcBot) {
    try {
      await tryToSendOsuIrcMessage(
        osuIrcBot,
        "main",
        config.osuIrc.requestTarget,
        `UwU (${name} ${getVersionFromObject(version)})`,
        logger
      );
    } catch (err) {
      loggerMain.error(err as Error);
    }
  }
};
