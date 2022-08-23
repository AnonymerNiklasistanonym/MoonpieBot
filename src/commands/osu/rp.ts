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
import type { BeatmapRequestsInfo } from "../osu";
import type { RegexOsuChatHandlerCommandRp } from "../../info/regex";
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
    return {
      data: {
        customOsuId: matchGroups.osuUserId
          ? parseInt(matchGroups.osuUserId)
          : undefined,
        customOsuName: matchGroups.osuUserName,
      },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.RP,
  },
};
