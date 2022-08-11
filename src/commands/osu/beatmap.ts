// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import {
  MacroOsuBeatmapRequest,
  macroOsuBeatmapRequest,
  MacroOsuBeatmapRequests,
  macroOsuBeatmapRequests,
} from "../../messageParser/macros/osuBeatmapRequest";
import { NOT_FOUND_STATUS_CODE, notUndefined } from "../../info/other";
import {
  osuBeatmapRequest,
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNotFound,
} from "../../strings/osu/beatmapRequest";
import { convertOsuBeatmapToMacros } from "../../messageParser/plugins/osu";
import { createLogFunc } from "../../logging";
import { errorMessageOsuApiCredentialsUndefined } from "../../error";
import { LOG_ID_CHAT_HANDLER_OSU } from "../../info/commands";
import { messageParserById } from "../../messageParser";
import { pluginOsuBeatmapId } from "../../messageParser/plugins/osuApi";
import { tryToSendOsuIrcMessage } from "../../osuIrc";
// Type imports
import type { BeatmapRequestsInfo, OsuApiV2Credentials } from "../osu";
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerReply,
} from "../../twitch";
import type { Beatmap } from "osu-api-v2";
import type { Client as IrcClient } from "irc";
import type { OsuApiV2WebRequestError } from "osu-api-v2";

export type OsuIrcBotSendMessageFunc = (logId: string) => IrcClient;

/**
 * Regex that matches osu beatmap URLs in any message.
 *
 * - The first group is the osu beatmap ID number in the format `https://osu.ppy.sh/beatmaps/$ID`.
 * - The second group is the osu beatmap ID number in the format `https://osu.ppy.sh/beatmapsets/MAPSETID#osu/$ID`.
 * - The third group is the optional comment string.
 *
 * @example
 * ```text
 * $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 * @example
 * ```text
 * $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmaps/2587891 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexBeatmapUrl =
  // eslint-disable-next-line security/detect-unsafe-regex
  /https:\/\/osu\.ppy\.sh\/(?:beatmaps\/(\d+)|beatmapsets\/\d+#\S+\/(\d+))\s*(?:\s+(.+?))?(?:\s*$|$)/i;

export interface CommandHandlerBeatmapDataBase {
  /**
   * The default osu user ID.
   */
  defaultOsuId?: number;
  enableOsuBeatmapRequests?: boolean;
  enableOsuBeatmapRequestsDetailed?: boolean;
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials?: OsuApiV2Credentials;
  osuIrcBot?: OsuIrcBotSendMessageFunc;
  osuIrcRequestTarget?: string;
}
export interface CommandHandlerBeatmapData
  extends CommandHandlerBeatmapDataBase {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}
export interface BeatmapRequest {
  beatmapId: number;
  comment?: string;
}

export interface CommandDetectorBeatmapData {
  /**
   * The found beatmap requests.
   */
  beatmapRequests: BeatmapRequest[];
}

/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 */
export const commandBeatmap: TwitchChatCommandHandler<
  CommandHandlerBeatmapData,
  CommandDetectorBeatmapData
> = {
  createReply: async (
    client,
    channel,
    _tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    if (data.osuApiV2Credentials === undefined) {
      throw errorMessageOsuApiCredentialsUndefined();
    }

    const logCmdBeatmap = createLogFunc(
      logger,
      LOG_ID_CHAT_HANDLER_OSU,
      "beatmap"
    );

    const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
      data.osuApiV2Credentials.clientId,
      data.osuApiV2Credentials.clientSecret
    );

    if (!data.enableOsuBeatmapRequests) {
      const macros = new Map(globalMacros);
      macros.set(
        macroOsuBeatmapRequests.id,
        new Map([
          [
            MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
            data.beatmapRequestsInfo.beatmapRequestsOffMessage
              ? data.beatmapRequestsInfo.beatmapRequestsOffMessage
              : "",
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
      return { sentMessage };
    }

    const commandReplies: TwitchChatCommandHandlerReply[] = [];

    for (const beatmapRequest of data.beatmapRequests) {
      const osuBeatmapRequestMacros = new Map(globalMacros);
      osuBeatmapRequestMacros.set(
        macroOsuBeatmapRequest.id,
        new Map([
          [MacroOsuBeatmapRequest.ID, `${beatmapRequest.beatmapId}`],
          [
            MacroOsuBeatmapRequest.COMMENT,
            `${
              beatmapRequest.comment && beatmapRequest.comment.trim().length > 0
                ? beatmapRequest.comment.trim()
                : ""
            }`,
          ],
        ])
      );

      // Get beatmap and if found the current top score and convert them into a
      // message for Twitch and IRC channel
      let messageRequest = "";
      let messageRequestIrc = "";
      let beatmap: Beatmap | undefined;
      try {
        beatmap = await osuApiV2.beatmaps.get(
          oauthAccessToken,
          beatmapRequest.beatmapId
        );
        if (beatmap) {
          data.beatmapRequestsInfo.lastBeatmapId = beatmap.id;
        }
        osuBeatmapRequestMacros.set(
          pluginOsuBeatmapId,
          new Map(convertOsuBeatmapToMacros(beatmap))
        );
        // Check for user score
      } catch (err) {
        if (
          (err as OsuApiV2WebRequestError).statusCode === NOT_FOUND_STATUS_CODE
        ) {
          logCmdBeatmap.warn((err as OsuApiV2WebRequestError).message);
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

      if (data.enableOsuBeatmapRequestsDetailed) {
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
      const sentMessage = await client.say(channel, messageRequest);

      if (beatmap === undefined) {
        logCmdBeatmap.debug(
          "osu! beatmap information was not found, stop attempt sending beatmap over IRC channel"
        );
      } else if (data.osuIrcRequestTarget && data.osuIrcBot !== undefined) {
        logCmdBeatmap.info(
          "Try to send beatmap request via osu! IRC connection"
        );
        await tryToSendOsuIrcMessage(
          data.osuIrcBot,
          "commandBeatmap",
          data.osuIrcRequestTarget,
          messageRequestIrc,
          logger
        );
      }
      commandReplies.push({ sentMessage });
    }
    return commandReplies;
  },
  detect: (_tags, message) => {
    if (!message.match(regexBeatmapUrl)) {
      return false;
    }
    if (message.startsWith("@")) {
      // Ignore map replies
      return false;
    }
    const osuBeatmapUrlBegin = "https://osu.ppy.sh/beatmaps";
    const beatmapRequests: BeatmapRequest[] = message
      .split(osuBeatmapUrlBegin)
      .map((a) => `${osuBeatmapUrlBegin}${a}`)
      .map((a) => {
        const match = a.match(regexBeatmapUrl);
        if (!match) {
          return;
        }
        const beatmapId =
          match[1] !== undefined ? parseInt(match[1]) : parseInt(match[2]);
        // eslint-disable-next-line no-magic-numbers
        const comment: string | undefined = match[3] ? match[3] : undefined;
        return { beatmapId, comment };
      })
      .filter(notUndefined);
    if (beatmapRequests.length === 0) {
      return false;
    }
    return { data: { beatmapRequests } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: "beatmap",
  },
};
