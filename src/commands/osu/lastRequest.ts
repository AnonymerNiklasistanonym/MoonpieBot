// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  osuBeatmapRequestNoRequestsError,
  osuBeatmapRequestPermissionError,
} from "../../strings/osu/beatmapRequest";
import {
  parseTwitchBadgeLevel,
  TwitchBadgeLevels,
} from "../../other/twitchBadgeParser";
import { BeatmapRequestsInfo } from "../osu";
import { regexOsuChatHandlerCommandLastRequest } from "../../info/regex";
import { sendBeatmapRequest } from "./beatmap";
// Type imports
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerReply,
} from "../../twitch";
import type { EMPTY_OBJECT } from "../../info/other";
import type { OsuIrcBotSendMessageFunc } from "./beatmap";
import type { RegexOsuChatHandlerCommandLastRequest } from "../../info/regex";

export type CommandBeatmapLastRequestCreateReplyInput = EMPTY_OBJECT;
export interface CommandBeatmapLastRequestCreateReplyInputExtra
  extends CommandBeatmapLastRequestCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
  enableOsuBeatmapRequestsDetailed?: boolean;
  osuIrcBot?: OsuIrcBotSendMessageFunc;
  osuIrcRequestTarget?: string;
}
export interface CommandBeatmapLastRequestDetectorOutput {
  beatmapRequestCount: number;
}
export interface CommandBeatmapLastRequestDetectorInput {
  enabledCommands: string[];
}
/**
 * Post information about the last beatmap request in chat and resend them
 * if enabled via IRC to the client.
 */
export const commandBeatmapLastRequest: TwitchChatCommandHandler<
  CommandBeatmapLastRequestCreateReplyInputExtra,
  CommandBeatmapLastRequestDetectorInput,
  CommandBeatmapLastRequestDetectorOutput
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

    if (data.beatmapRequestCount < 1) {
      data.beatmapRequestCount = 1;
    }

    if (data.beatmapRequestsInfo.previousBeatmapRequests.length < 1) {
      return {
        isError: true,
        messageId: osuBeatmapRequestNoRequestsError.id,
      };
    }

    const commandReplies: TwitchChatCommandHandlerReply[] = [];
    const previousBeatmapRequests =
      data.beatmapRequestsInfo.previousBeatmapRequests
        .slice(0, data.beatmapRequestCount)
        .reverse();

    for (const previousBeatmapRequest of previousBeatmapRequests) {
      data.beatmapRequestsInfo.lastMentionedBeatmapId =
        previousBeatmapRequest.data.id;

      commandReplies.push(
        ...sendBeatmapRequest(
          data.enableOsuBeatmapRequestsDetailed,
          undefined,
          {
            channelName: channel.slice(1),
            userId: previousBeatmapRequest.userId,
            userName: previousBeatmapRequest.userName,
          },
          previousBeatmapRequest.data.id,
          previousBeatmapRequest.comment,
          previousBeatmapRequest.data,
          data.osuIrcRequestTarget,
          data.osuIrcBot
        )
      );
    }
    return commandReplies;
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.LAST_REQUEST)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandLastRequest);
    if (!match) {
      return false;
    }
    const matchGroups: undefined | RegexOsuChatHandlerCommandLastRequest =
      match.groups;
    if (!matchGroups) {
      throw Error("RegexOsuChatHandlerCommandLastRequest groups undefined");
    }
    if (matchGroups.lastRequestCount !== undefined) {
      return {
        data: {
          beatmapRequestCount: parseInt(matchGroups.lastRequestCount),
        },
      };
    }
    return { data: { beatmapRequestCount: 1 } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.REQUESTS,
  },
};
