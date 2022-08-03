// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import {
  LOG_ID_CHAT_HANDLER_OSU,
  LOG_ID_COMMAND_OSU,
  errorMessageOsuApiCredentialsUndefined,
} from "../osu";
import {
  convertOsuScoreToMacros,
  osuScorePluginMacroName,
} from "../../messageParser/plugins/osu";
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import {
  osuScore,
  osuScoreNoBeatmap,
  osuScoreNotFound,
} from "../../strings/osu/commandReply";
import { createLogFunc } from "../../logging";
import { messageParserById } from "../../messageParser";
// Type imports
import type { Macros, Plugins } from "../../messageParser";
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { OsuApiV2Credentials } from "../osu";
import type { OsuApiV2WebRequestError } from "osu-api-v2";
import type { Strings } from "../../strings";

/**
 * Post information about a osu Beatmap in the chat and if existing also show
 * the current top score of the default osu User in the chat.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param osuApiV2Credentials The osu API (v2) credentials.
 * @param beatmapId The osu beatmap ID.
 * @param osuUserName The osu account name for which the score should be fetched.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for global logs).
 */
export const commandScore = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials | undefined,
  beatmapId: number | undefined,
  osuUserName: string | undefined,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }
  if (osuApiV2Credentials === undefined) {
    throw errorMessageOsuApiCredentialsUndefined();
  }
  if (osuUserName === undefined) {
    throw Error("Unable to reply to message! (osuUserName is undefined)");
  }

  const logCmdBeatmap = createLogFunc(logger, LOG_ID_CHAT_HANDLER_OSU, {
    subsection: "score",
  });

  const osuBeatmapRequestMacros = new Map(globalMacros);
  osuBeatmapRequestMacros.set(
    "OSU_SCORE_REQUEST",
    new Map([
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      ["BEATMAP_ID", `${beatmapId}`],
      ["USER_NAME", osuUserName],
    ])
  );

  if (beatmapId === undefined) {
    const message = await messageParserById(
      osuScoreNoBeatmap.id,
      globalStrings,
      globalPlugins,
      osuBeatmapRequestMacros,
      logger
    );
    const sentMessage = await client.say(channel, message);
    logTwitchMessageCommandReply(
      logger,
      messageId,
      sentMessage,
      LOG_ID_COMMAND_OSU,
      "beatmap"
    );
    return;
  }

  const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
    osuApiV2Credentials.clientId,
    osuApiV2Credentials.clientSecret
  );

  // Get beatmap and if found the current top score and convert them into a
  // message for Twitch and IRC channel
  try {
    const user = await osuApiV2.search.user(oauthAccessToken, osuUserName);
    const userId = user.user.data[0].id;
    const beatmapScore = await osuApiV2.beatmaps.scores.users(
      oauthAccessToken,
      beatmapId,
      userId
    );
    osuBeatmapRequestMacros.set(
      osuScorePluginMacroName,
      new Map(convertOsuScoreToMacros(beatmapScore))
    );
    // Check for user score
  } catch (err) {
    if ((err as OsuApiV2WebRequestError).statusCode === 404) {
      logCmdBeatmap.warn((err as OsuApiV2WebRequestError).message);
      const errorMessage = await messageParserById(
        osuScoreNotFound.id,
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

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_OSU,
    "score"
  );
};
