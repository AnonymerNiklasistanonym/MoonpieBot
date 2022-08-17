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
import { messageParserById } from "../../messageParser";
import { NOT_FOUND_STATUS_CODE } from "../../info/other";
import { regexOsuChatHandlerCommandScore } from "../../info/regex";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { OsuApiV2Credentials } from "../osu";
import type { OsuApiV2WebRequestError } from "osu-api-v2";

export interface CommandScoreCreateReplyInput {
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials?: OsuApiV2Credentials;
}
export interface CommandScoreCreateReplyInputExtra
  extends CommandScoreCreateReplyInput {
  /**
   * The osu beatmap ID.
   */
  beatmapId?: number;
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

    if (data.beatmapId === undefined) {
      const errorMessage = await messageParserById(
        osuScoreErrorNoBeatmap.id,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      );
      throw Error(errorMessage);
    }

    const osuBeatmapRequestMacros = new Map(globalMacros);
    osuBeatmapRequestMacros.set(
      macroOsuScoreRequest.id,
      new Map(
        macroOsuScoreRequest.generate({
          beatmapId: data.beatmapId,
          userName: data.osuUserName,
        })
      )
    );

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
      const userId = user.user.data[0].id;
      const beatmapScore = await osuApiV2.beatmaps.scores.users(
        oauthAccessToken,
        data.beatmapId,
        userId
      );
      osuBeatmapRequestMacros.set(
        macroOsuScore.id,
        new Map(macroOsuScore.generate({ beatmapScore }))
      );
      // Check for user score
    } catch (err) {
      if (
        (err as OsuApiV2WebRequestError).statusCode === NOT_FOUND_STATUS_CODE
      ) {
        logCmdBeatmap.warn((err as OsuApiV2WebRequestError).message);
        const errorMessage = await messageParserById(
          osuScoreErrorNotFound.id,
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

    const message = await messageParserById(
      osuScore.id,
      globalStrings,
      globalPlugins,
      osuBeatmapRequestMacros,
      logger
    );

    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, data) => {
    if (!message.match(regexOsuChatHandlerCommandScore)) {
      return false;
    }
    if (!data.enabledCommands.includes(OsuCommands.SCORE)) {
      return false;
    }
    const match = regexOsuChatHandlerCommandScore.exec(message);
    if (!match) {
      return false;
    }
    return {
      data: {
        osuUserName: match[1],
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.SCORE,
  },
};
