// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  osuScore,
  osuScoreErrorNoBeatmap,
  osuScoreErrorNotFound,
} from "../../strings/osu/commandReply";
import { createLogFunc } from "../../logging";
import { errorMessageOsuApiCredentialsUndefined } from "../../error";
import { macroOsuScore } from "../../messageParser/macros/osuApi";
import { macroOsuScoreRequest } from "../../messageParser/macros/osuScoreRequest";
import { NOT_FOUND_STATUS_CODE } from "../../info/other";
import { regexOsuChatHandlerCommandScore } from "../../info/regex";
// Type imports
import type { BeatmapRequestsInfo, OsuApiV2Credentials } from "../osu";
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { OsuApiV2WebRequestError } from "osu-api-v2";
import type { RegexOsuChatHandlerCommandScore } from "../../info/regex";

export interface CommandScoreCreateReplyInput {
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials?: Readonly<OsuApiV2Credentials>;
}
export interface CommandScoreCreateReplyInputExtra
  extends CommandScoreCreateReplyInput {
  /**
   * The osu beatmap requests info.
   */
  beatmapRequestsInfo: BeatmapRequestsInfo;
}
export type CommandScoreDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
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
export const commandScore: TwitchChatCommandHandler<
  CommandScoreCreateReplyInputExtra,
  CommandScoreDetectorInput,
  CommandScoreDetectorOutput
> = {
  createReply: async (_channel, _tags, data, logger) => {
    if (data.osuApiV2Credentials === undefined) {
      throw errorMessageOsuApiCredentialsUndefined();
    }

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
    let osuUserName = matchGroups.osuUserName;
    if (osuUserName.startsWith("'") && osuUserName.endsWith("'")) {
      osuUserName = osuUserName.substring(1, osuUserName.length - 1);
    }
    return { data: { osuUserName } };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.SCORE,
  },
};
