/*
 * Main method of the bot that connect and sets up everything.
 */

// Package imports
import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
// Relative imports
import {
  createBroadcastScheduledTask,
  stopBroadcastScheduledTask,
} from "./customCommandsBroadcasts/customBroadcast.mjs";
import { createOsuIrcConnection, tryToSendOsuIrcMessage } from "./osuIrc.mjs";
import {
  createStreamCompanionFileConnection,
  createStreamCompanionWebSocketConnection,
} from "./osuStreamCompanion.mjs";
import { createTwitchClient, TwitchClientListener } from "./twitch.mjs";
import { displayName, version } from "./info/general.mjs";
import { Feature, getFeature, getFeatures } from "./info/features.mjs";
import {
  generateMacroMap,
  generatePlugin,
  generatePluginMap,
  updateStringsMapWithCustomEnvStrings,
} from "./messageParser.mjs";
import { MoonpieCommands, OsuCommands } from "./info/chatCommands.mjs";
import { convertRegexToHumanString } from "./other/regexToString.mjs";
import { createLogFunc } from "./logging.mjs";
import { customCommandChatHandler } from "./customCommandsBroadcasts/customCommand.mjs";
import { customCommandsBroadcastsChatHandler } from "./commands/customCommandsBroadcasts.mjs";
import customCommandsBroadcastsDb from "./database/customCommandsBroadcastsDb.mjs";
import { defaultMacros } from "./info/macros.mjs";
import { defaultPlugins } from "./info/plugins.mjs";
import { defaultStringMap } from "./info/strings.mjs";
import { lurkChatHandler } from "./commands/lurk.mjs";
import { macroOsuApi } from "./info/macros/osuApi.mjs";
import { moonpieChatHandler } from "./commands/moonpie.mjs";
import moonpieDb from "./database/moonpieDb.mjs";
import { osuChatHandler } from "./commands/osu.mjs";
import { OsuRequestsConfig } from "./info/databases/osuRequestsDb.mjs";
import osuRequestsDb from "./database/osuRequestsDb.mjs";
import { pluginCountGenerator } from "./info/plugins/count.mjs";
import { pluginsCustomCommandDataGenerator } from "./info/plugins/customDataLogic.mjs";
import { pluginsOsuGenerator } from "./info/plugins/osuApi.mjs";
import { pluginsOsuStreamCompanionGenerator } from "./info/plugins/osuStreamCompanion.mjs";
import { pluginSpotifyGenerator } from "./info/plugins/spotify.mjs";
import { pluginsTwitchApiGenerator } from "./info/plugins/twitchApi.mjs";
import { pluginsTwitchChatGenerator } from "./info/plugins/twitchChat.mjs";
import { runChatMessageHandlerReplyCreator } from "./chatMessageHandler.mjs";
import { setupAndGetSpotifyApiClient } from "./spotify.mjs";
import { spotifyChatHandler } from "./commands/spotify.mjs";
import { SpotifyConfig } from "./database/spotifyDb/requests/spotifyConfig.mjs";
import spotifyDb from "./database/spotifyDb.mjs";
// Type imports
import type { ChatUserstate } from "tmi.js";
import type { CustomBroadcast } from "./customCommandsBroadcasts/customBroadcast.mjs";
import type { CustomCommand } from "./customCommandsBroadcasts/customCommand.mjs";
import type { DeepReadonly } from "./other/types.mjs";
import type { ErrorWithCode } from "./error.mjs";
import type { Logger } from "winston";
import type { MoonpieConfig } from "./info/config/moonpieConfig.mjs";
import type { OsuIrcBotSendMessageFunc } from "./commands/osu/beatmap.mjs";
import type { PluginTwitchApiData } from "./info/plugins/twitchApi.mjs";
import type { PluginTwitchChatData } from "./info/plugins/twitchChat.mjs";
import type { ScheduledTask } from "node-cron";

/** The logging ID of this module. */
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
  logger: Readonly<Logger>,
  config: DeepReadonly<MoonpieConfig>,
): Promise<void> => {
  const loggerModule = createLogFunc(logger, LOG_ID);

  // Get all supported features
  const features = await getFeatures(config, logger);
  loggerModule.info(`Enabled features: (${features.length})`);
  for (const feature of features) {
    loggerModule.info(`- ${feature.id}: ${feature.description}`);
    if (feature.chatCommands.length > 0) {
      loggerModule.info(
        `  (${feature.chatCommands
          .map(
            (a) =>
              `'${
                typeof a.command === "string"
                  ? a.command
                  : convertRegexToHumanString(a.command)
              }' [${a.permission}]`,
          )
          .join(", ")})`,
      );
    }
  }
  const featureAbout = getFeature(features, Feature.ABOUT);
  const featureCcCb = getFeature(features, Feature.CUSTOM_CS_BS);
  const featureLurk = getFeature(features, Feature.LURK);
  const featureMoonpie = getFeature(features, Feature.MOONPIE);
  const featureOsuApi = getFeature(features, Feature.OSU_API);
  const featureOsuMapRequests = getFeature(
    features,
    Feature.OSU_API_BEATMAP_REQUESTS,
  );
  const featureOsuIrc = getFeature(features, Feature.OSU_IRC_BEATMAP_REQUESTS);
  const featureOsuStreamCompanionFile = getFeature(
    features,
    Feature.OSU_STREAM_COMPANION_FILE,
  );
  const featureOsuStreamCompanionWeb = getFeature(
    features,
    Feature.OSU_STREAM_COMPANION_WEB,
  );
  const featureSpotifyApi = getFeature(features, Feature.SPOTIFY_API);
  const featureTwitchApi = getFeature(features, Feature.TWITCH_API);

  // Initialize global objects
  // > Twitch client
  const twitchClient = createTwitchClient(
    config.twitch.name,
    config.twitch.oAuthToken,
    config.twitch.channels,
    config.twitch.debug,
    logger,
  );
  // > Twitch API client
  let twitchApiClient: undefined | ApiClient;
  if (featureTwitchApi?.id === Feature.TWITCH_API) {
    const authProviderScopes = new StaticAuthProvider(
      featureTwitchApi.data.clientId,
      featureTwitchApi.data.accessToken,
    );
    twitchApiClient = new ApiClient({
      authProvider: authProviderScopes,
    });
  }
  // > osu! IRC message sender
  let osuIrcMsgSender: OsuIrcBotSendMessageFunc | undefined;
  let osuIrcRequestTarget: string | undefined;
  if (featureOsuIrc?.id === Feature.OSU_IRC_BEATMAP_REQUESTS) {
    osuIrcRequestTarget = featureOsuIrc.data.requestTarget;
    osuIrcMsgSender = (id: string) =>
      createOsuIrcConnection(
        featureOsuIrc.data.username,
        featureOsuIrc.data.password,
        id,
        logger,
      );
  }
  // > osu! StreamCompanion current map data fetcher
  const osuStreamCompanionCurrentMapData =
    featureOsuStreamCompanionWeb?.id === Feature.OSU_STREAM_COMPANION_WEB
      ? createStreamCompanionWebSocketConnection(
          featureOsuStreamCompanionWeb.data.url,
          logger,
        )
      : featureOsuStreamCompanionFile?.id === Feature.OSU_STREAM_COMPANION_FILE
      ? createStreamCompanionFileConnection(
          featureOsuStreamCompanionFile.data.dirPath,
        )
      : undefined;

  // Setup/Migrate moonpie database
  const setupMigrateBackupMoonpieDatabase = async () => {
    if (featureMoonpie?.id === Feature.MOONPIE) {
      await moonpieDb.setup(featureMoonpie.data.databasePath, logger);
    }
  };

  // Setup/Migrate osu!requests database
  const setupMigrateOsuRequestsConfigDatabase = async () => {
    if (featureOsuMapRequests?.id === Feature.OSU_API_BEATMAP_REQUESTS) {
      await osuRequestsDb.setup(
        featureOsuMapRequests.data.databasePath,
        logger,
      );
      if (featureOsuMapRequests.data.beatmapRequestsDetailed !== undefined) {
        const detailed = featureOsuMapRequests.data.beatmapRequestsDetailed
          ? "true"
          : "false";
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          featureOsuMapRequests.data.databasePath,
          {
            option: OsuRequestsConfig.DETAILED,
            optionValue: detailed,
          },
          logger,
        );
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          featureOsuMapRequests.data.databasePath,
          {
            option: OsuRequestsConfig.DETAILED_IRC,
            optionValue: detailed,
          },
          logger,
        );
      }
      if (featureOsuMapRequests.data.beatmapRequestsRedeemId !== undefined) {
        await osuRequestsDb.requests.osuRequestsConfig.createOrUpdateEntry(
          featureOsuMapRequests.data.databasePath,
          {
            option: OsuRequestsConfig.REDEEM_ID,
            optionValue: featureOsuMapRequests.data.beatmapRequestsRedeemId,
          },
          logger,
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
        logger,
      );
    }
  };

  // Setup/Migrate spotify database
  const setupMigrateSpotifyDatabase = async () => {
    if (featureSpotifyApi?.id === Feature.SPOTIFY_API) {
      await spotifyDb.setup(featureSpotifyApi.data.databasePath, logger);
      if (featureSpotifyApi.data.refreshToken !== undefined) {
        await spotifyDb.requests.spotifyConfig.createOrUpdateEntry(
          featureSpotifyApi.data.databasePath,
          {
            option: SpotifyConfig.REFRESH_TOKEN,
            optionValue: featureSpotifyApi.data.refreshToken,
          },
          logger,
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
  const spotifyWebApi =
    featureSpotifyApi?.id === Feature.SPOTIFY_API
      ? await setupAndGetSpotifyApiClient(
          featureSpotifyApi.data.clientId,
          featureSpotifyApi.data.clientSecret,
          featureSpotifyApi.data.databasePath,
          logger,
        )
      : undefined;

  // Setup message parser
  // > Strings
  const stringMap = updateStringsMapWithCustomEnvStrings(
    defaultStringMap,
    logger,
  );
  // > Macros
  const macroMap = generateMacroMap(defaultMacros);
  // > Plugins
  const pluginMap = generatePluginMap(defaultPlugins);
  // > osu! API macros & plugins
  if (featureOsuApi?.id === Feature.OSU_API) {
    macroMap.set(
      macroOsuApi.id,
      new Map(
        macroOsuApi.generate(
          { osuApiDefaultId: featureOsuApi.data.defaultId },
          logger,
        ),
      ),
    );
    pluginsOsuGenerator.map((plugin) => {
      const pluginReady = generatePlugin(plugin, {
        osuApiV2Credentials: {
          clientId: featureOsuApi.data.clientId,
          clientSecret: featureOsuApi.data.clientSecret,
        },
      });
      pluginMap.set(pluginReady.id, pluginReady.func);
    });
  }
  // > osu! StreamCompanion macros & plugins
  if (osuStreamCompanionCurrentMapData !== undefined) {
    pluginsOsuStreamCompanionGenerator.map((plugin) => {
      const pluginReady = generatePlugin(plugin, {
        streamCompanionDataFunc: osuStreamCompanionCurrentMapData,
      });
      pluginMap.set(pluginReady.id, pluginReady.func);
    });
  }
  // > Spotify API macros & plugins
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
          logger,
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
          logger,
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
          logger,
        );
        customCommandsBroadcastsRefreshHelper.enabledCustomBroadcasts.set(
          customBroadcast.id,
          customBroadcastScheduledTask,
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
    chatHandlerId: string,
  ) => {
    loggerModule.error(err);
    try {
      await twitchClient.say(
        channel,
        `${tags.username ? `@${tags.username} ` : ""}${chatHandlerId} Error: ${
          err.message
        }${err.code ? ` (${err.code})` : ""}`,
      );
    } catch (errFunc) {
      loggerModule.error(errFunc as Error);
    }
  };

  const enabledMoonpieCommands: MoonpieCommands[] = [];
  if (featureAbout?.id === Feature.ABOUT) {
    enabledMoonpieCommands.push(...featureAbout.data.enableCommands);
  }
  if (featureMoonpie?.id === Feature.MOONPIE) {
    enabledMoonpieCommands.push(...featureMoonpie.data.enableCommands);
  }

  const enabledOsuCommands: OsuCommands[] = [];
  if (featureOsuApi?.id === Feature.OSU_API) {
    enabledOsuCommands.push(...featureOsuApi.data.enableCommands);
  }
  if (featureOsuMapRequests?.id === Feature.OSU_API_BEATMAP_REQUESTS) {
    enabledOsuCommands.push(...featureOsuMapRequests.data.enableCommands);
  }
  if (featureOsuStreamCompanionWeb?.id === Feature.OSU_STREAM_COMPANION_WEB) {
    enabledOsuCommands.push(
      ...featureOsuStreamCompanionWeb.data.enableCommands,
    );
  }
  if (featureOsuStreamCompanionFile?.id === Feature.OSU_STREAM_COMPANION_FILE) {
    enabledOsuCommands.push(
      ...featureOsuStreamCompanionFile.data.enableCommands,
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
    tags: Readonly<ChatUserstate>,
    message: string,
    self: boolean,
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
    if (featureAbout || featureMoonpie) {
      try {
        if (featureMoonpie?.id === Feature.MOONPIE) {
          await moonpieChatHandler(
            twitchClient,
            channel,
            tags,
            message,
            {
              enabledCommands: enabledMoonpieCommands,
              moonpieClaimCooldownHours: featureMoonpie.data.claimCooldownHours,
              moonpieDbPath: featureMoonpie.data.databasePath,
            },
            stringMap,
            pluginMapChannel,
            macroMapChannel,
            logger,
          );
        } else if (featureAbout?.id === Feature.ABOUT) {
          await moonpieChatHandler(
            twitchClient,
            channel,
            tags,
            message,
            {
              enabledCommands: enabledMoonpieCommands,
              moonpieClaimCooldownHours: -1,
              moonpieDbPath: "-1",
            },
            stringMap,
            pluginMapChannel,
            macroMapChannel,
            logger,
          );
        }
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Moonpie",
        );
      }
    }

    if (
      featureOsuApi ||
      featureOsuMapRequests ||
      featureOsuStreamCompanionFile ||
      featureOsuStreamCompanionWeb
    ) {
      try {
        if (featureOsuApi?.id === Feature.OSU_API) {
          await osuChatHandler(
            twitchClient,
            channel,
            tags,
            message,
            {
              defaultOsuId: featureOsuApi.data.defaultId,
              enabledCommands: enabledOsuCommands,
              osuApiDbPath: featureOsuApi.data.databasePath,
              osuApiV2Credentials: {
                clientId: featureOsuApi.data.clientId,
                clientSecret: featureOsuApi.data.clientSecret,
              },
              osuIrcBot: osuIrcMsgSender,
              osuIrcRequestTarget,
              osuStreamCompanionCurrentMapData,
            },
            stringMap,
            pluginMapChannel,
            macroMapChannel,
            logger,
          );
        } else if (osuStreamCompanionCurrentMapData !== undefined) {
          await osuChatHandler(
            twitchClient,
            channel,
            tags,
            message,
            {
              enabledCommands: enabledOsuCommands,
              osuStreamCompanionCurrentMapData,
            },
            stringMap,
            pluginMapChannel,
            macroMapChannel,
            logger,
          );
        }
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "osu!",
        );
      }
    }

    if (featureSpotifyApi?.id === Feature.SPOTIFY_API && spotifyWebApi) {
      try {
        await spotifyChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          {
            enabledCommands: featureSpotifyApi.data.enableCommands,
            spotifyWebApi,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger,
        );
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Spotify",
        );
      }
    }

    if (featureLurk?.id === Feature.LURK) {
      try {
        await lurkChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          {
            enabledCommands: featureLurk.data.enableCommands,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger,
        );
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Lurk",
        );
      }
    }

    if (featureCcCb?.id === Feature.CUSTOM_CS_BS) {
      try {
        await customCommandsBroadcastsChatHandler(
          twitchClient,
          channel,
          tags,
          message,
          {
            customCommandsBroadcastsDbPath: featureCcCb.data.databasePath,
            customCommandsBroadcastsRefreshHelper,
            enabledCommands: featureCcCb.data.enableCommands,
          },
          stringMap,
          pluginMapChannel,
          macroMapChannel,
          logger,
        );
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Custom Commands/Broadcasts",
        );
      }

      // Refresh custom commands/broadcasts if necessary
      await refreshCustomCommandsBroadcasts();

      // Check custom commands
      try {
        const pluginsCustomCommands = new Map(pluginMapChannel);
        // Add plugins to manipulate custom command global data
        const customCommandsBroadcastsDatabase = featureCcCb.data.databasePath;
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
            }),
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
                featureCcCb.data.databasePath,
              ),
            );
            if (!executed) {
              continue;
            }
            await customCommandsBroadcastsDb.requests.customCommand.updateEntry(
              featureCcCb.data.databasePath,
              {
                countIncrease: 1,
                id: customCommand.id,
                timestampLastExecution: Date.now(),
              },
              logger,
            );
            customCommandsBroadcastsRefreshHelper.refreshCustomCommands = true;
          } catch (err) {
            await chatHandlerErrorMessage(
              channel,
              tags,
              err as ErrorWithCode,
              `Custom Command ${customCommand.id}`,
            );
          }
        }
      } catch (err) {
        await chatHandlerErrorMessage(
          channel,
          tags,
          err as ErrorWithCode,
          "Custom Command",
        );
      }
    }
  };

  // Connect functionality to Twitch connection triggers
  twitchClient.on(
    TwitchClientListener.NEW_REDEEM,
    (channel, username, rewardType) => {
      // Log when a new redeem was made
      loggerModule.debug(
        `User "${username}" redeemed "${rewardType}" in the channel ` +
          `"${channel}"`,
      );
    },
  );
  twitchClient.on(
    TwitchClientListener.CLIENT_CONNECTING_TO_TWITCH,
    (address, port) => {
      // Log when the client is trying to connect to Twitch
      loggerModule.info(`Connecting to Twitch: ${address}:${port}`);
    },
  );
  twitchClient.on(
    TwitchClientListener.CLIENT_CONNECTED_TO_TWITCH,
    (address, port) => {
      // Log when the client successfully connected to Twitch
      loggerModule.info(`Connected to Twitch: ${address}:${port}`);
    },
  );
  twitchClient.on(
    TwitchClientListener.CLIENT_DISCONNECTED_FROM_TWITCH,
    (reason) => {
      // Log when the client disconnects from Twitch
      loggerModule.info(`Disconnected from Twitch: ${reason}`);
    },
  );
  twitchClient.on(
    TwitchClientListener.USER_JOINED_CHANNEL,
    (channel, username, self) => {
      // Log when the Twitch client itself joins a Twitch channel
      if (self) {
        loggerModule.info(
          `Joined the Twitch channel "${channel}" as "${username}"`,
        );
      }
    },
  );
  let averageCommandHandleTime = 0;
  let averageCommandHandleCount = 0;
  twitchClient.on(
    TwitchClientListener.NEW_MESSAGE,
    (channel, tags, message, self) => {
      const startTime = performance.now();
      onNewMessage(channel, tags, message, self)
        .catch((err) => {
          loggerModule.error(err as Error);
        })
        .finally(() => {
          const endTime = performance.now();
          averageCommandHandleCount++;
          averageCommandHandleTime -=
            averageCommandHandleTime / averageCommandHandleCount;
          averageCommandHandleTime +=
            (endTime - startTime) / averageCommandHandleCount;
          loggerModule.debug(
            `Command was handled in ${
              endTime - startTime
            }ms (average time: ${averageCommandHandleTime}ms ` +
              `N=${averageCommandHandleCount})`,
          );
        });
    },
  );

  process.on("SIGINT", () => {
    // When the process is being force closed catch that and close "safely"
    loggerModule.info("SIGINT was detected");
    process.exit();
  });

  // Connect Twitch client to Twitch
  await twitchClient.connect();

  // Send osu! IRC message when bot is started
  if (osuIrcMsgSender && osuIrcRequestTarget) {
    try {
      await tryToSendOsuIrcMessage(
        osuIrcMsgSender,
        "main",
        osuIrcRequestTarget,
        `UwU (${displayName} ${version})`,
        logger,
      );
    } catch (err) {
      loggerModule.error(err as Error);
    }
  }
};
