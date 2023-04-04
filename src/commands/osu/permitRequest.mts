// Relative imports
import {
  LOG_ID_CHAT_HANDLER_OSU,
  OsuCommands,
} from "../../info/chatCommands.mjs";
import { checkTwitchBadgeLevel } from "../twitchBadge.mjs";
import { osuBeatmapRequestNoBlockedRequestsError } from "../../info/strings/osu/beatmapRequest.mjs";
import { OsuRequestsConfig } from "../../info/databases/osuRequestsDb.mjs";
import osuRequestsDb from "../../database/osuRequestsDb.mjs";
import { regexOsuChatHandlerCommandPermitRequest } from "../../info/regex.mjs";
import { sendBeatmapRequest } from "./beatmap.mjs";
import { TwitchBadgeLevel } from "../../twitch.mjs";
// Type imports
import type {
  ChatMessageHandlerReply,
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type {
  CommandOsuGenericDataExtraBeatmapRequestsInfo,
  CommandOsuGenericDataOsuApiDbPath,
  CommandOsuGenericDataOsuIrcData,
} from "../osu.mjs";

/**
 * Post information about the last blocked request in chat and send them
 * if enabled via IRC to the client.
 */
export const commandBeatmapPermitRequest: ChatMessageHandlerReplyCreator<
  CommandOsuGenericDataOsuIrcData &
    CommandOsuGenericDataExtraBeatmapRequestsInfo &
    CommandOsuGenericDataOsuApiDbPath,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR,
      logger,
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
    }

    const blockedBeatmapRequest =
      data.beatmapRequestsInfo.blockedBeatmapRequest;

    if (blockedBeatmapRequest === undefined) {
      return {
        isError: true,
        messageId: osuBeatmapRequestNoBlockedRequestsError.id,
      };
    }

    data.beatmapRequestsInfo.lastMentionedBeatmapId =
      blockedBeatmapRequest.data.id;
    data.beatmapRequestsInfo.previousBeatmapRequests.unshift(
      blockedBeatmapRequest,
    );
    data.beatmapRequestsInfo.blockedBeatmapRequest = undefined;

    const commandReplies: ChatMessageHandlerReply[] = [];

    const osuRequestsConfigEntries =
      await osuRequestsDb.requests.osuRequestsConfig.getEntries(
        data.osuApiDbPath,
        logger,
      );

    commandReplies.push(
      ...sendBeatmapRequest(
        osuRequestsConfigEntries.find(
          (a) => a.option === OsuRequestsConfig.DETAILED,
        )?.optionValue === "true",
        osuRequestsConfigEntries.find(
          (a) => a.option === OsuRequestsConfig.DETAILED_IRC,
        )?.optionValue === "true",
        undefined,
        blockedBeatmapRequest.data.id,
        blockedBeatmapRequest.userName,
        logger,
        blockedBeatmapRequest.comment,
        blockedBeatmapRequest.data,
        data.osuIrcRequestTarget,
        data.osuIrcBot,
      ),
    );

    return commandReplies;
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.PERMIT_REQUEST)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandPermitRequest);
    if (!match) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.REQUESTS,
  },
};
