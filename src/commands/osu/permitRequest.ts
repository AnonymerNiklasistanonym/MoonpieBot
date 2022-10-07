// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import { checkTwitchBadgeLevel } from "../twitchBadge";
import { osuBeatmapRequestNoBlockedRequestsError } from "../../info/strings/osu/beatmapRequest";
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
  CommandOsuGenericDataOsuIrcData,
} from "../osu";

export interface CommandBeatmapPermitRequestCreateReplyInput
  extends CommandOsuGenericDataOsuIrcData {
  enableOsuBeatmapRequestsDetailed?: boolean;
}
/**
 * Post information about the last blocked request in chat and send them
 * if enabled via IRC to the client.
 */
export const commandBeatmapPermitRequest: ChatMessageHandlerReplyCreator<
  CommandBeatmapPermitRequestCreateReplyInput &
    CommandOsuGenericDataExtraBeatmapRequestsInfo,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands
> = {
  createReply: (channel, tags, data) => {
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

    commandReplies.push(
      ...sendBeatmapRequest(
        data.enableOsuBeatmapRequestsDetailed,
        undefined,
        {
          channelName: channel.slice(1),
          userId: blockedBeatmapRequest.userId,
          userName: blockedBeatmapRequest.userName,
        },
        blockedBeatmapRequest.data.id,
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
