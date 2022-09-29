// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  osuBeatmapRequestNoBlockedRequestsError,
  osuBeatmapRequestPermissionError,
} from "../../strings/osu/beatmapRequest";
import {
  parseTwitchBadgeLevel,
  TwitchBadgeLevels,
} from "../../other/twitchBadgeParser";
import { BeatmapRequestsInfo } from "../osu";
import { regexOsuChatHandlerCommandPermitRequest } from "../../info/regex";
import { sendBeatmapRequest } from "./beatmap";
// Type imports
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerReply,
} from "../../twitch";
import type { EMPTY_OBJECT } from "../../info/other";
import type { OsuIrcBotSendMessageFunc } from "./beatmap";

export type CommandBeatmapPermitRequestCreateReplyInput = EMPTY_OBJECT;
export interface CommandBeatmapPermitRequestCreateReplyInputExtra
  extends CommandBeatmapPermitRequestCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
  enableOsuBeatmapRequestsDetailed?: boolean;
  osuIrcBot?: OsuIrcBotSendMessageFunc;
  osuIrcRequestTarget?: string;
}
export interface CommandBeatmapPermitRequestDetectorInput {
  enabledCommands: string[];
}
/**
 * Post information about the last blocked request in chat and send them
 * if enabled via IRC to the client.
 */
export const commandBeatmapPermitRequest: TwitchChatCommandHandler<
  CommandBeatmapPermitRequestCreateReplyInputExtra,
  CommandBeatmapPermitRequestDetectorInput
> = {
  createReply: (channel, tags, data) => {
    const twitchBadgeLevel = parseTwitchBadgeLevel(tags);
    if (
      twitchBadgeLevel !== TwitchBadgeLevels.BROADCASTER &&
      twitchBadgeLevel !== TwitchBadgeLevels.MODERATOR
    ) {
      return {
        isError: true,
        messageId: osuBeatmapRequestPermissionError.id,
      };
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

    const commandReplies: TwitchChatCommandHandlerReply[] = [];

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
