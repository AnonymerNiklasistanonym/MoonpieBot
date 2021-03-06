// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import {
  errorMessageOsuApiCredentialsUndefined,
  LOG_ID_COMMAND_OSU,
} from "../osu";
import { isProcessRunning } from "../../other/processInformation";
import { TwitchBadgeLevels } from "../../other/twitchBadgeParser";
import { messageParserById } from "../../messageParser";
import {
  osuBeatmapRequest,
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestCurrentlyOn,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNotFound,
  osuBeatmapRequestPermissionError,
  osuBeatmapRequestTurnedOff,
  osuBeatmapRequestTurnedOn,
} from "../../strings/osu/beatmapRequest";
// Type imports
import type { OsuApiV2WebRequestError } from "osu-api-v2";
import type { Client as IrcClient } from "irc";
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { OsuApiV2Credentials } from "../osu";
import type { Macros, Plugins } from "../../messageParser";
import type { Strings } from "../../strings";

/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param osuApiV2Credentials The osu API (v2) credentials.
 * @param beatmapId The recognized osu beatmap ID.
 * @param comment The recognized comment to the beatmap.
 * @param detailedBeatmapInformation Print detailed beatmap information.
 * @param osuIrcBot The osu IRC instance (used for sending requests to osu
 * client using IRC).
 * @param osuIrcRequestTarget The osu account ID to whom the IRC request should
 * be sent to.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for global logs).
 */
export const commandBeatmap = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials | undefined,
  beatmapId: number,
  comment: string | undefined,
  detailedBeatmapInformation: undefined | boolean,
  osuIrcBot: (() => IrcClient) | undefined,
  osuIrcRequestTarget: undefined | string,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }
  if (osuApiV2Credentials === undefined) {
    throw errorMessageOsuApiCredentialsUndefined();
  }

  const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
    osuApiV2Credentials.clientId,
    osuApiV2Credentials.clientSecret
  );

  const osuBeatmapRequestMacros = new Map(globalMacros);
  osuBeatmapRequestMacros.set(
    "OSU_BEATMAP_REQUEST",
    new Map([
      ["ID", `${beatmapId}`],
      [
        "COMMENT",
        `${
          comment !== undefined && comment.trim().length > 0
            ? comment.trim()
            : ""
        }`,
      ],
    ])
  );

  // Get beatmap and if found the current top score and convert them into a
  // message for Twitch and IRC channel
  let beatmapInformationWasFound = false;
  let messageRequest = "";
  let messageRequestIrc = "";
  try {
    await osuApiV2.beatmaps.get(oauthAccessToken, beatmapId);
    beatmapInformationWasFound = true;
    // Check for user score
  } catch (err) {
    if ((err as OsuApiV2WebRequestError).statusCode === 404) {
      logger.warn(err);
      const errorMessage = await messageParserById(
        osuBeatmapRequestNotFound.id,
        globalStrings,
        globalPlugins,
        osuBeatmapRequestMacros,
        logger
      );
      throw Error(errorMessage);
    } else {
      throw err;
    }
  }

  if (detailedBeatmapInformation) {
    messageRequest = await messageParserById(
      osuBeatmapRequestDetailed.id,
      globalStrings,
      globalPlugins,
      osuBeatmapRequestMacros,
      logger
    );
    messageRequestIrc = await messageParserById(
      osuBeatmapRequestIrcDetailed.id,
      globalStrings,
      globalPlugins,
      osuBeatmapRequestMacros,
      logger
    );
  } else {
    messageRequest = await messageParserById(
      osuBeatmapRequest.id,
      globalStrings,
      globalPlugins,
      osuBeatmapRequestMacros,
      logger
    );
    messageRequestIrc = await messageParserById(
      osuBeatmapRequestIrc.id,
      globalStrings,
      globalPlugins,
      osuBeatmapRequestMacros,
      logger
    );
  }

  // Send response to Twitch channel and if found to IRC channel
  await Promise.all([
    client.say(channel, messageRequest).then((sentMessage) => {
      logTwitchMessageCommandReply(
        logger,
        messageId,
        sentMessage,
        LOG_ID_COMMAND_OSU,
        "beatmap"
      );
    }),
    new Promise<void>((resolve, reject) => {
      if (!beatmapInformationWasFound) {
        logger.debug(
          "osu! beatmap information was not found, stop attempt sending beatmap over IRC channel"
        );
        return resolve();
      }
      isProcessRunning("osu")
        .then((osuIsRunning) => {
          if (!osuIsRunning) {
            logger.debug(
              "osu! was not found running, stop attempt sending beatmap over IRC channel"
            );
            return resolve();
          }
          if (
            osuIrcRequestTarget !== undefined &&
            osuIrcBot !== undefined &&
            osuIsRunning
          ) {
            logger.info("Try to create an osu IRC connection");
            try {
              let osuIrcBotInstance: undefined | IrcClient = osuIrcBot();
              logger.info("Try to connect to osu IRC channel");
              osuIrcBotInstance.connect(2, () => {
                logger.info("osu! IRC connection was established");
                for (const messagePart of messageRequestIrc.split(
                  "%NEWLINE%"
                )) {
                  osuIrcBotInstance?.say(osuIrcRequestTarget, messagePart);
                }
                osuIrcBotInstance?.disconnect("", () => {
                  osuIrcBotInstance?.conn.end();
                  osuIrcBotInstance = undefined;
                  logger.info("osu! IRC connection was closed");
                  return resolve();
                });
              });
            } catch (err) {
              return reject(err);
            }
          } else {
            return resolve();
          }
        })
        .catch(reject);
    }),
  ]);
};

/**
 * Enable or disable beatmap requests.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param twitchBadgeLevel The Twitch badge level (used for permission control).
 * @param enable If true enable requests, otherwise disable requests.
 * @param customDisableMessage A custom disable message.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for global logs).
 */
export const commandSetBeatmapRequests = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  twitchBadgeLevel: TwitchBadgeLevels,
  enable: boolean,
  customDisableMessage: string | undefined,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }

  if (twitchBadgeLevel != TwitchBadgeLevels.BROADCASTER) {
    const errorMessage = await messageParserById(
      osuBeatmapRequestPermissionError.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    throw Error(errorMessage);
  }

  let message;
  let osuCommandId;
  if (enable) {
    osuCommandId = "beatmap_requests_on";
    message = await messageParserById(
      osuBeatmapRequestTurnedOn.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
  } else {
    osuCommandId = "beatmap_requests_off";
    const macros = new Map(globalMacros);
    macros.set(
      "BEATMAP_REQUEST",
      new Map([
        [
          "CUSTOM_MESSAGE",
          customDisableMessage !== undefined ? customDisableMessage : "",
        ],
      ])
    );
    message = await messageParserById(
      osuBeatmapRequestTurnedOff.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
  }
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_OSU,
    osuCommandId
  );
};

/**
 * Error message when beatmap requests are disabled.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param customDisableMessage A custom disable message.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for global logs).
 */
export const commandBeatmapWhenDisabled = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  customDisableMessage: string | undefined,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }

  const macros = new Map(globalMacros);
  macros.set(
    "BEATMAP_REQUEST",
    new Map([
      [
        "CUSTOM_MESSAGE",
        customDisableMessage !== undefined ? customDisableMessage : "",
      ],
    ])
  );
  const message = await messageParserById(
    osuBeatmapRequestCurrentlyOff.id,
    globalStrings,
    globalPlugins,
    macros,
    logger
  );
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_OSU,
    "beatmap_requests_disabled"
  );
};

/**
 * Status message to beatmap requests.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param enable If true enable requests, otherwise disable requests.
 * @param customDisableMessage A custom disable message.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for global logs).
 */
export const commandBeatmapRequestsStatus = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  enable: boolean,
  customDisableMessage: string | undefined,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }

  let message;
  if (enable) {
    message = await messageParserById(
      osuBeatmapRequestCurrentlyOn.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
  } else {
    const macros = new Map(globalMacros);
    macros.set(
      "BEATMAP_REQUEST",
      new Map([
        [
          "CUSTOM_MESSAGE",
          customDisableMessage !== undefined ? customDisableMessage : "",
        ],
      ])
    );
    message = await messageParserById(
      osuBeatmapRequestCurrentlyOff.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
  }
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_OSU,
    "beatmap_requests_disabled"
  );
};
