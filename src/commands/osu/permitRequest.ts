// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/chatCommands";
import { checkTwitchBadgeLevel } from "../twitchBadge";
import { osuBeatmapRequestNoBlockedRequestsError } from "../../info/strings/osu/beatmapRequest";
import { OsuRequestsConfig } from "../../info/databases/osuRequestsDb";
import osuRequestsDb from "../../database/osuRequestsDb";
import { regexOsuChatHandlerCommandPermitRequest } from "../../info/regex";
import { sendBeatmapRequest } from "./beatmap";
import { TwitchBadgeLevel } from "../../twitch";
// Type imports
import type {
  ChatMessageHandlerReply,
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler";
import type {
  CommandOsuGenericDataExtraBeatmapRequestsInfo,
  CommandOsuGenericDataOsuApiDbPath,
  CommandOsuGenericDataOsuIrcData,
} from "../osu";

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
      TwitchBadgeLevel.MODERATOR
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
      blockedBeatmapRequest
    );
    data.beatmapRequestsInfo.blockedBeatmapRequest = undefined;

    const commandReplies: ChatMessageHandlerReply[] = [];

    const osuRequestsConfigEntries =
      await osuRequestsDb.requests.osuRequestsConfig.getEntries(
        data.osuApiDbPath,
        logger
      );

    commandReplies.push(
      ...sendBeatmapRequest(
        osuRequestsConfigEntries.find(
          (a) => a.option === OsuRequestsConfig.DETAILED
        )?.optionValue === "true",
        osuRequestsConfigEntries.find(
          (a) => a.option === OsuRequestsConfig.DETAILED_IRC
        )?.optionValue === "true",
        undefined,
        blockedBeatmapRequest.data.id,
        blockedBeatmapRequest.userName,
        blockedBeatmapRequest.comment,
        blockedBeatmapRequest.data,
        data.osuIrcRequestTarget,
        data.osuIrcBot
      )
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
