// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/chatCommands";
import {
  osuScore,
  osuScoreErrorNoBeatmap,
  osuScoreErrorNotFound,
} from "../../info/strings/osu/commandReply";
import { createLogFunc } from "../../logging";
import { macroOsuScore } from "../../info/macros/osuApi";
import { macroOsuScoreRequest } from "../../info/macros/osuScoreRequest";
import { NOT_FOUND_STATUS_CODE } from "../../other/web";
import { regexOsuChatHandlerCommandScore } from "../../info/regex";
import { removeWhitespaceEscapeChatCommand } from "../../other/whiteSpaceChecker";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler";
import type {
  CommandOsuGenericDataExtraBeatmapRequestsInfo,
  CommandOsuGenericDataOsuApiV2Credentials,
} from "../osu";
import type { OsuApiV2WebRequestError } from "osu-api-v2";
import type { RegexOsuChatHandlerCommandScore } from "../../info/regex";

export interface CommandScoreDetectorOutput {
  /**
   * The osu account name for which the score should be fetched.
   */
  osuUserName: string;
}
/**
 * Score command:
 * Get the score of the last requested map of either the default user or a
 * custom supplied user.
 */
export const commandScore: ChatMessageHandlerReplyCreator<
  CommandOsuGenericDataOsuApiV2Credentials &
    CommandOsuGenericDataExtraBeatmapRequestsInfo,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandScoreDetectorOutput
> = {
  createReply: async (_channel, _tags, data, logger) => {
    if (data.beatmapRequestsInfo.lastMentionedBeatmapId === undefined) {
      return {
        isError: true,
        messageId: osuScoreErrorNoBeatmap.id,
      };
    }

    const osuBeatmapRequestMacros = new Map();

    const logCmdBeatmap = createLogFunc(
      logger,
      LOG_ID_CHAT_HANDLER_OSU,
      OsuCommands.SCORE
    );

    const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
      data.osuApiV2Credentials.clientId,
      data.osuApiV2Credentials.clientSecret
    );

    // Get beatmap and if found the current top score and convert them into a
    // message for Twitch and IRC channel
    try {
      const user = await osuApiV2.search.user(
        oauthAccessToken,
        data.osuUserName
      );
      const userId = user.data[0].id;
      const beatmapScore = await osuApiV2.beatmaps.scores.users(
        oauthAccessToken,
        data.beatmapRequestsInfo.lastMentionedBeatmapId,
        userId
      );
      osuBeatmapRequestMacros.set(
        macroOsuScore.id,
        new Map(macroOsuScore.generate({ beatmapScore }))
      );
      // Check for user score
      osuBeatmapRequestMacros.set(
        macroOsuScoreRequest.id,
        new Map(
          macroOsuScoreRequest.generate({
            beatmapId: data.beatmapRequestsInfo.lastMentionedBeatmapId,
            userName:
              beatmapScore.score.user?.username !== undefined
                ? beatmapScore.score.user?.username
                : data.osuUserName,
          })
        )
      );
    } catch (err) {
      osuBeatmapRequestMacros.set(
        macroOsuScoreRequest.id,
        new Map(
          macroOsuScoreRequest.generate({
            beatmapId: data.beatmapRequestsInfo.lastMentionedBeatmapId,
            userName: data.osuUserName,
          })
        )
      );
      if (
        (err as OsuApiV2WebRequestError).statusCode === NOT_FOUND_STATUS_CODE
      ) {
        logCmdBeatmap.warn((err as OsuApiV2WebRequestError).message);
        return {
          additionalMacros: osuBeatmapRequestMacros,
          isError: true,
          messageId: osuScoreErrorNotFound.id,
        };
      } else {
        throw err;
      }
    }

    return {
      additionalMacros: osuBeatmapRequestMacros,
      messageId: osuScore.id,
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.SCORE)) {
      return false;
    }
    if (!message.match(regexOsuChatHandlerCommandScore)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandScore);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as
      | undefined
      | RegexOsuChatHandlerCommandScore;
    if (!matchGroups) {
      throw Error("RegexOsuChatHandlerCommandScore groups undefined");
    }
    const osuUserName = removeWhitespaceEscapeChatCommand(
      matchGroups.osuUserName
    );
    return { data: { osuUserName } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.SCORE,
  },
};
