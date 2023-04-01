// Package imports
import osuApiV2, { GameMode, ScoresType } from "osu-api-v2";
// Relative imports
import {
  LOG_ID_CHAT_HANDLER_OSU,
  OsuCommands,
} from "../../info/chatCommands.mjs";
import {
  osuCommandReplyRp,
  osuCommandReplyRpNotFound,
} from "../../info/strings/osu/commandReply.mjs";
import { errorMessageDefaultOsuIdUndefined } from "../../error.mjs";
import { macroOsuPpRpRequest } from "../../info/macros/osuPpRpRequest.mjs";
import { regexOsuChatHandlerCommandRp } from "../../info/regex.mjs";
import { removeWhitespaceEscapeChatCommandGroup } from "../../other/whiteSpaceChecker.mjs";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type {
  CommandPpRpCreateReplyInput,
  CommandPpRpDetectorOutput,
} from "./pp.mjs";
import type { BeatmapRequestsInfo } from "../osu.mjs";
import type { RegexOsuChatHandlerCommandRp } from "../../info/regex.mjs";

export interface CommandRpCreateReplyInputExtra
  extends CommandPpRpCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}
/**
 * RP (recently played) command:
 * Send the map that was most recently played in osu (via the web api).
 */
export const commandRp: ChatMessageHandlerReplyCreator<
  CommandRpCreateReplyInputExtra,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandPpRpDetectorOutput
> = {
  createReply: async (_channel, _tags, data) => {
    if (data.defaultOsuId === undefined) {
      throw errorMessageDefaultOsuIdUndefined();
    }

    const oauthAccessToken =
      await osuApiV2.default.oauth.clientCredentialsGrant(
        data.osuApiV2Credentials.clientId,
        data.osuApiV2Credentials.clientSecret
      );

    if (data.customOsuId === undefined && data.customOsuName) {
      const userSearchResult = await osuApiV2.default.search.user(
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

    const lastPlay = await osuApiV2.default.users.scores(
      oauthAccessToken,
      data.customOsuId !== undefined ? data.customOsuId : data.defaultOsuId,
      ScoresType.RECENT,
      GameMode.OSU_STANDARD,
      1,
      0,
      true
    );

    const osuRpRequestMacros = new Map();
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

    if (lastPlay.length > 0) {
      if (lastPlay[0].beatmap?.id) {
        data.beatmapRequestsInfo.lastMentionedBeatmapId =
          lastPlay[0].beatmap?.id;
      }
      return {
        additionalMacros: osuRpRequestMacros,
        messageId: osuCommandReplyRp.id,
      };
    }
    return {
      additionalMacros: osuRpRequestMacros,
      messageId: osuCommandReplyRpNotFound.id,
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.RP)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandRp);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as
      | undefined
      | RegexOsuChatHandlerCommandRp;
    if (matchGroups === undefined) {
      throw Error("RegexOsuChatHandlerCommandRp groups undefined");
    } else if (
      "osuUserId" in matchGroups &&
      matchGroups.osuUserId !== undefined
    ) {
      return {
        data: {
          customOsuId: parseInt(matchGroups.osuUserId),
        },
      };
    } else if (
      "osuUserName" in matchGroups &&
      matchGroups.osuUserName !== undefined
    ) {
      return {
        data: {
          customOsuName: removeWhitespaceEscapeChatCommandGroup(
            matchGroups.osuUserName
          ),
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
