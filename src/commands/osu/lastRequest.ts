// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import { checkTwitchBadgeLevel } from "../twitchBadge";
import { osuBeatmapRequestNoRequestsError } from "../../info/strings/osu/beatmapRequest";
import { OsuRequestsConfig } from "../../info/databases/osuRequestsDb";
import osuRequestsDb from "../../database/osuRequestsDb";
import { regexOsuChatHandlerCommandLastRequest } from "../../info/regex";
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
import type { RegexOsuChatHandlerCommandLastRequest } from "../../info/regex";

export interface CommandBeatmapLastRequestCreateReplyInput
  extends CommandOsuGenericDataOsuIrcData {
  enableOsuBeatmapRequestsDetailed?: boolean;
}
export interface CommandBeatmapLastRequestDetectorOutput {
  beatmapRequestCount: number;
}
/**
 * Post information about the last beatmap request in chat and resend them
 * if enabled via IRC to the client.
 */
export const commandBeatmapLastRequest: ChatMessageHandlerReplyCreator<
  CommandBeatmapLastRequestCreateReplyInput &
    CommandOsuGenericDataExtraBeatmapRequestsInfo &
    CommandOsuGenericDataOsuApiDbPath,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandBeatmapLastRequestDetectorOutput
> = {
  createReply: async (_channel, tags, data, logger) => {
    const twitchBadgeLevelCheck = checkTwitchBadgeLevel(
      tags,
      TwitchBadgeLevel.MODERATOR
    );
    if (twitchBadgeLevelCheck !== undefined) {
      return twitchBadgeLevelCheck;
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

    const commandReplies: ChatMessageHandlerReply[] = [];
    const previousBeatmapRequests =
      data.beatmapRequestsInfo.previousBeatmapRequests
        .slice(0, data.beatmapRequestCount)
        .reverse();

    const osuRequestsConfigEntries =
      await osuRequestsDb.requests.osuRequestsConfig.getEntries(
        data.osuApiDbPath,
        logger
      );
    const detailedReply =
      osuRequestsConfigEntries.find(
        (a) => a.option === OsuRequestsConfig.DETAILED
      )?.optionValue === "true";

    for (const previousBeatmapRequest of previousBeatmapRequests) {
      data.beatmapRequestsInfo.lastMentionedBeatmapId =
        previousBeatmapRequest.data.id;

      commandReplies.push(
        ...sendBeatmapRequest(
          detailedReply,
          undefined,
          previousBeatmapRequest.data.id,
          previousBeatmapRequest.userName,
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
