// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import {
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequests,
} from "../../messageParser/macros/osuBeatmapRequest";
import { NOT_FOUND_STATUS_CODE, notUndefined } from "../../info/other";
import {
  osuBeatmapRequest,
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNoRedeem,
  osuBeatmapRequestNotFound,
} from "../../strings/osu/beatmapRequest";
import {
  regexOsuBeatmapIdFromUrl,
  RegexOsuBeatmapIdFromUrlDEPRECATED,
  regexOsuBeatmapUrlSplitter,
} from "../../info/regex";
import { createLogFunc } from "../../logging";
import { errorMessageOsuApiCredentialsUndefined } from "../../error";
import { LOG_ID_CHAT_HANDLER_OSU } from "../../info/commands";
import { macroOsuBeatmap } from "../../messageParser/macros/osuApi";
import { messageParserById } from "../../messageParser";
import { tryToSendOsuIrcMessage } from "../../osuIrc";
// Type imports
import type { BeatmapRequestsInfo, OsuApiV2Credentials } from "../osu";
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerReply,
} from "../../twitch";
import type { Beatmap } from "osu-api-v2";
import type { Client as IrcClient } from "irc";
import type { OsuApiV2WebRequestError } from "osu-api-v2";

export type OsuIrcBotSendMessageFunc = (logId: string) => IrcClient;
export interface BeatmapRequest {
  beatmapId: number;
  comment?: string;
}

export interface CommandBeatmapCreateReplyInput {
  /**
   * The default osu user ID.
   */
  defaultOsuId?: number;
  enableOsuBeatmapRequests?: boolean;
  enableOsuBeatmapRequestsDetailed?: boolean;
  /**
   * If string not empty/undefined check if the beatmap request was redeemed or
   * just a normal chat message.
   */
  enableOsuBeatmapRequestsRedeemId?: string;
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials?: OsuApiV2Credentials;
  osuIrcBot?: OsuIrcBotSendMessageFunc;
  osuIrcRequestTarget?: string;
}
export interface CommandBeatmapCreateReplyInputExtra
  extends CommandBeatmapCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}
export interface CommandBeatmapDetectorOutput {
  /**
   * The found beatmap requests.
   */
  beatmapRequests: BeatmapRequest[];
}
export type CommandBeatmapDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
export interface CommandBeatmapDetectorInputExtra
  extends CommandBeatmapDetectorInput {
  enableOsuBeatmapRequests?: boolean;
}
/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 */
export const commandBeatmap: TwitchChatCommandHandler<
  CommandBeatmapCreateReplyInputExtra,
  CommandBeatmapDetectorInputExtra,
  CommandBeatmapDetectorOutput
> = {
  createReply: async (
    client,
    channel,
    tags,
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

    if (
      data.enableOsuBeatmapRequestsRedeemId !== undefined &&
      tags["custom-reward-id"] !== data.enableOsuBeatmapRequestsRedeemId
    ) {
      const message = await messageParserById(
        osuBeatmapRequestNoRedeem.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      const sentMessage = await client.say(channel, message);
      return { sentMessage };
    }

    const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
      data.osuApiV2Credentials.clientId,
      data.osuApiV2Credentials.clientSecret
    );

    if (!data.enableOsuBeatmapRequests) {
      const macros = new Map(globalMacros);
      macros.set(
        macroOsuBeatmapRequests.id,
        new Map(
          macroOsuBeatmapRequests.generate({
            customMessage: data.beatmapRequestsInfo.beatmapRequestsOffMessage,
          })
        )
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
        new Map(
          macroOsuBeatmapRequest.generate({
            comment: beatmapRequest.comment?.trim(),
            id: beatmapRequest.beatmapId,
          })
        )
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
          macroOsuBeatmap.id,
          new Map(macroOsuBeatmap.generate({ beatmap }))
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
  detect: (_tags, message, data) => {
    if (!data.enableOsuBeatmapRequests) {
      return false;
    }
    if (!message.match(regexOsuBeatmapIdFromUrl)) {
      return false;
    }
    if (message.trimStart().startsWith("@")) {
      // Ignore map replies
      return false;
    }
    const beatmapRequests: BeatmapRequest[] = regexOsuBeatmapUrlSplitter(
      message
    )
      .map((a) => {
        const match = a.match(regexOsuBeatmapIdFromUrl);
        if (!match) {
          return;
        }
        let beatmapId;
        if (match[RegexOsuBeatmapIdFromUrlDEPRECATED.B] !== undefined) {
          beatmapId = match[RegexOsuBeatmapIdFromUrlDEPRECATED.B];
        }
        if (match[RegexOsuBeatmapIdFromUrlDEPRECATED.BEATMAPS] !== undefined) {
          beatmapId = match[RegexOsuBeatmapIdFromUrlDEPRECATED.BEATMAPS];
        }
        if (match[RegexOsuBeatmapIdFromUrlDEPRECATED.BEATMAPSETS] !== undefined) {
          beatmapId = match[RegexOsuBeatmapIdFromUrlDEPRECATED.BEATMAPSETS];
        }
        if (beatmapId !== undefined) {
          return {
            beatmapId: parseInt(beatmapId),
            comment: match[RegexOsuBeatmapIdFromUrlDEPRECATED.COMMENT],
          };
        }
        return;
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
