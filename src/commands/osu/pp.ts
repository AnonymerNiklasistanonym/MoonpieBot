// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import { errorMessageOsuApiCredentialsUndefined } from "../../error";
import { macroOsuPpRpRequest } from "../../messageParser/macros/osuPpRpRequest";
import { messageParserById } from "../../messageParser";
import { osuCommandReplyPp } from "../../strings/osu/commandReply";
import { regexOsuChatHandlerCommandPp } from "../../info/regex";
// Type imports
import type { BeatmapRequestsInfo, OsuApiV2Credentials } from "../osu";
import type {
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerEnabledCommandsDetectorDataIn,
} from "../../twitch";

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

export interface CommandDetectorPpRpDataOut {
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
 * PP (from performance points) command:
 * Get performance/general information of an Osu account.
 */
export const commandPp: TwitchChatCommandHandler<
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
      macroOsuPpRpRequest.id,
      new Map(
        macroOsuPpRpRequest.generate({
          id:
            data.customOsuId !== undefined
              ? data.customOsuId
              : data.defaultOsuId,
        })
      )
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
  detect: (_tags, message, data) => {
    const match = message.match(regexOsuChatHandlerCommandPp);
    if (!match) {
      return false;
    }
    if (!data.enabledCommands.includes(OsuCommands.PP)) {
      return false;
    }
    return {
      data: {
        customOsuId: match[1] ? parseInt(match[1]) : undefined,
        customOsuName: match[2],
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.PP,
  },
};
