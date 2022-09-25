// Package imports
import osuApiV2, { GameMode, ScoresType } from "osu-api-v2";
// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  osuCommandReplyRp,
  osuCommandReplyRpNotFound,
} from "../../strings/osu/commandReply";
import { errorMessageOsuApiCredentialsUndefined } from "../../error";
import { macroOsuPpRpRequest } from "../../messageParser/macros/osuPpRpRequest";
import { messageParserById } from "../../messageParser";
import { regexOsuChatHandlerCommandRp } from "../../info/regex";
// Type imports
import type {
  CommandPpRpCreateReplyInput,
  CommandPpRpDetectorInput,
  CommandPpRpDetectorOutput,
} from "./pp";
import type {
  RegexOsuChatHandlerCommandRp,
  RegexOsuChatHandlerCommandRpUserId,
  RegexOsuChatHandlerCommandRpUserName,
} from "../../info/regex";
import type { BeatmapRequestsInfo } from "../osu";
import type { TwitchChatCommandHandler } from "../../twitch";

export interface CommandRpCreateReplyInputExtra
  extends CommandPpRpCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}
/**
 * RP (recently played) command:
 * Send the map that was most recently played in osu (via the web api).
 */
export const commandRp: TwitchChatCommandHandler<
  CommandRpCreateReplyInputExtra,
  CommandPpRpDetectorInput,
  CommandPpRpDetectorOutput
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
        Array.isArray(userSearchResult.data) &&
        userSearchResult.data.length > 0
      ) {
        data.customOsuId = userSearchResult.data[0].id;
      }
    }

    const lastPlay = await osuApiV2.users.scores(
      oauthAccessToken,
      data.customOsuId !== undefined ? data.customOsuId : data.defaultOsuId,
      ScoresType.RECENT,
      GameMode.OSU_STANDARD,
      1,
      0,
      true
    );

    const osuRpRequestMacros = new Map(globalMacros);
    osuRpRequestMacros.set(
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

    let message = "";
    if (lastPlay.length > 0) {
      if (lastPlay[0].beatmap?.id) {
        data.beatmapRequestsInfo.lastMentionedBeatmapId =
          lastPlay[0].beatmap?.id;
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
    if (!data.enabledCommands.includes(OsuCommands.RP)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandRp);
    if (!match) {
      return false;
    }
    const matchGroups: undefined | RegexOsuChatHandlerCommandRp = match.groups;
    if (!matchGroups) {
      throw Error("RegexOsuChatHandlerCommandRp groups undefined");
    }
    if ((matchGroups as RegexOsuChatHandlerCommandRpUserId).osuUserId) {
      return {
        data: {
          customOsuId: parseInt(
            (matchGroups as RegexOsuChatHandlerCommandRpUserId).osuUserId
          ),
        },
      };
    }
    if ((matchGroups as RegexOsuChatHandlerCommandRpUserName).osuUserName) {
      return {
        data: {
          customOsuName: (matchGroups as RegexOsuChatHandlerCommandRpUserName)
            .osuUserName,
        },
      };
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.RP,
  },
};
