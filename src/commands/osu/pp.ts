// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
// Local imports
import {
  errorMessageEnabledCommandsUndefined,
  errorMessageOsuApiCredentialsUndefined,
} from "../../error";
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  MacroOsuPpRequest,
  macroOsuPpRequest,
} from "../../messageParser/macros/osuPpRequest";
import { messageParserById } from "../../messageParser";
import { osuCommandReplyPp } from "../../strings/osu/commandReply";
// Type imports
import type { BeatmapRequestsInfo, OsuApiV2Credentials } from "../osu";
import type { TwitchChatCommandHandler } from "../../twitch";

export interface CommandHandlerPpRpDataBase {
  /**
   * Default osu Account ID (used for checking for existing scores).
   */
  defaultOsuId?: number;
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials?: OsuApiV2Credentials;
}

export interface CommandHandlerPpRpData extends CommandHandlerPpRpDataBase {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}

export interface CommandDetectorPpRpData {
  /**
   * Custom osu account ID (use this over the default osu
   * account ID and over the not undefined custom osu name if not undefined).
   */
  customOsuId?: number;
  /**
   * The osu account name (use this over the default osu
   * account ID if not undefined).
   */
  customOsuName?: string;
}

/**
 * Regex to recognize the `!pp` command.
 *
 * @example
 * ```text
 * !pp $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexPp = /^\s*!pp(?:\s*|\s.*)$/i;

/**
 * Regex to recognize the `!pp $OPTIONAL_OSU_USER_ID` command.
 *
 * - The first group is the custom osu ID number.
 *
 * @example
 * ```text
 * !pp 12345 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexPpCustomId = /^\s*!pp\s+([0-9]+)\s*.*$/i;

/**
 * Regex to recognize the `!pp $OPTIONAL_OSU_USER_NAME` command.
 *
 * - The first group is the custom osu user name string.
 *
 * @example
 * ```text
 * !pp osuName $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexPpCustomName = /^\s*!pp\s+(\S+)\s*.*$/i;

/**
 * PP (from performance points) command:
 * Get performance/general information of an Osu account.
 */
export const commandPp: TwitchChatCommandHandler<
  CommandHandlerPpRpData,
  CommandDetectorPpRpData
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

    if (data.customOsuId === undefined && data.customOsuName !== undefined) {
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

    await osuApiV2.users.id(
      oauthAccessToken,
      data.customOsuId !== undefined ? data.customOsuId : data.defaultOsuId,
      GameMode.osu
    );

    const osuPpRequestMacros = new Map(globalMacros);
    osuPpRequestMacros.set(
      macroOsuPpRequest.id,
      new Map([
        [
          MacroOsuPpRequest.ID,
          `${
            data.customOsuId !== undefined
              ? data.customOsuId
              : data.defaultOsuId
          }`,
        ],
      ])
    );

    const message = await messageParserById(
      osuCommandReplyPp.id,
      globalStrings,
      globalPlugins,
      osuPpRequestMacros,
      logger
    );

    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!message.match(regexPp)) {
      return false;
    }
    if (!enabledCommands.includes(OsuCommands.PP)) {
      return false;
    }
    const matchId = regexPpCustomId.exec(message);
    const matchName = regexPpCustomName.exec(message);
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
    id: OsuCommands.PP,
  },
};
