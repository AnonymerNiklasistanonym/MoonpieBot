// Package imports
import osuApiV2, { GameMode, ScoresType } from "osu-api-v2";
// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  MacroOsuRpRequest,
  macroOsuRpRequest,
} from "../../messageParser/macros/osuRpRequest";
import {
  osuCommandReplyRp,
  osuCommandReplyRpNotFound,
} from "../../strings/osu/commandReply";
import { errorMessageOsuApiCredentialsUndefined } from "../../error";
import { messageParserById } from "../../messageParser";
// Type imports
import type { CommandDetectorPpRpDataOut, CommandHandlerPpRpData } from "./pp";
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
} from "../../twitch";

/**
 * Regex to recognize the `!rp` command.
 *
 * @example
 * ```text
 * !rp $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexRp = /^\s*!rp(?:\s*|\s.*)$/i;

/**
 * Regex to recognize the `!rp $OPTIONAL_OSU_USER_ID` command.
 *
 * - The first group is the custom osu user ID number.
 *
 * @example
 * ```text
 * !rp 12345 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexRpCustomId = /^\s*!rp\s+([0-9]+)\s*.*$/i;

/**
 * Regex to recognize the `!rp $OPTIONAL_OSU_USER_NAME` command.
 *
 * - The first group is the custom osu user name string.
 *
 * @example
 * ```text
 * !rp osuName $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexRpCustomName = /^\s*!rp\s+(\S+)\s*.*$/i;

/**
 * RP (recently played) command:
 * Send the map that was most recently played in osu (via the web api).
 */
export const commandRp: TwitchChatCommandHandler<
  CommandHandlerPpRpData,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
  CommandDetectorPpRpDataOut
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
    if (data.defaultOsuId === undefined) {
      throw Error("Default OSU ID was undefined");
    }

    const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
      data.osuApiV2Credentials.clientId,
      data.osuApiV2Credentials.clientSecret
    );

    if (data.customOsuId === undefined && data.customOsuName) {
      const userSearchResult = await osuApiV2.search.user(
        oauthAccessToken,
        data.customOsuName
      );
      if (
        userSearchResult?.user?.data !== undefined &&
        Array.isArray(userSearchResult.user.data) &&
        userSearchResult.user.data.length > 0
      ) {
        data.customOsuId = userSearchResult.user.data[0].id;
      }
    }

    const lastPlay = await osuApiV2.users.scores(
      oauthAccessToken,
      data.customOsuId !== undefined ? data.customOsuId : data.defaultOsuId,
      ScoresType.Recent,
      GameMode.osu,
      1,
      0,
      true
    );

    const osuRpRequestMacros = new Map(globalMacros);
    osuRpRequestMacros.set(
      macroOsuRpRequest.id,
      new Map([
        [
          MacroOsuRpRequest.ID,
          `${
            data.customOsuId !== undefined
              ? data.customOsuId
              : data.defaultOsuId
          }`,
        ],
      ])
    );

    let message = "";
    if (lastPlay.length > 0) {
      if (lastPlay[0].beatmap?.id) {
        data.beatmapRequestsInfo.lastBeatmapId = lastPlay[0].beatmap?.id;
      }
      message = await messageParserById(
        osuCommandReplyRp.id,
        globalStrings,
        globalPlugins,
        osuRpRequestMacros,
        logger
      );
    } else {
      message = await messageParserById(
        osuCommandReplyRpNotFound.id,
        globalStrings,
        globalPlugins,
        osuRpRequestMacros,
        logger
      );
    }
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, data) => {
    if (!message.match(regexRp)) {
      return false;
    }
    if (!data.enabledCommands.includes(OsuCommands.RP)) {
      return false;
    }
    const matchId = regexRpCustomId.exec(message);
    const matchName = regexRpCustomName.exec(message);
    return {
      data: {
        customOsuId:
          matchId && matchId.length >= 2 ? parseInt(matchId[1]) : undefined,
        customOsuName:
          matchName && matchName.length >= 2 ? matchName[1] : undefined,
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.RP,
  },
};
