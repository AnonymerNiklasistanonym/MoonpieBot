// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import {
  errorMessageEnabledCommandsUndefined,
  errorMessageOsuApiCredentialsUndefined,
} from "../../error";
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  MacroOsuScoreRequest,
  macroOsuScoreRequest,
} from "../../messageParser/macros/osuScoreRequest";
import {
  osuScore,
  osuScoreErrorNoBeatmap,
  osuScoreErrorNotFound,
} from "../../strings/osu/commandReply";
import { convertOsuScoreToMacros } from "../../messageParser/plugins/osu";
import { createLogFunc } from "../../logging";
import { messageParserById } from "../../messageParser";
import { NOT_FOUND_STATUS_CODE } from "../../info/other";
import { pluginOsuScoreId } from "../../messageParser/plugins/osuApi";
// Type imports
import type { OsuApiV2Credentials } from "../osu";
import type { OsuApiV2WebRequestError } from "osu-api-v2";
import type { TwitchChatCommandHandler } from "../../twitch";

/**
 * Regex to recognize the `!score osuName $OPTIONAL_TEXT_WITH_SPACES` command.
 *
 * - The first group is the custom osu user name string.
 *
 * @example
 * ```text
 * !score osuName $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexScore = /^\s*!score\s+(\S+)\s*.*$/i;

export interface CommandHandlerScoreDataBase {
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials?: OsuApiV2Credentials;
}

export interface CommandHandlerScoreData extends CommandHandlerScoreDataBase {
  /**
   * The osu beatmap ID.
   */
  beatmapId?: number;
}

export interface CommandDetectorScoreData {
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
  CommandHandlerScoreData,
  CommandDetectorScoreData
> = {
  info: {
    id: OsuCommands.SCORE,
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
  },
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!message.match(regexScore)) {
      return false;
    }
    if (!enabledCommands.includes(OsuCommands.SCORE)) {
      return false;
    }
    const match = regexScore.exec(message);
    if (!match) {
      return false;
    }
    return {
      data: {
        osuUserName: match[1],
      },
    };
  },
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
      new Map([
        [MacroOsuScoreRequest.BEATMAP_ID, `${data.beatmapId}`],
        [MacroOsuScoreRequest.USER_NAME, data.osuUserName],
      ])
    );

    const logCmdBeatmap = createLogFunc(logger, LOG_ID_CHAT_HANDLER_OSU, {
      subsection: OsuCommands.SCORE,
    });

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
        pluginOsuScoreId,
        new Map(convertOsuScoreToMacros(beatmapScore))
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
};
