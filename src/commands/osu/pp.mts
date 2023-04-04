// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
// Relative imports
import {
  LOG_ID_CHAT_HANDLER_OSU,
  OsuCommands,
} from "../../info/chatCommands.mjs";
import { errorMessageDefaultOsuIdUndefined } from "../../error.mjs";
import { macroOsuPpRpRequest } from "../../info/macros/osuPpRpRequest.mjs";
import { osuCommandReplyPp } from "../../info/strings/osu/commandReply.mjs";
import { regexOsuChatHandlerCommandPp } from "../../info/regex.mjs";
import { removeWhitespaceEscapeChatCommandGroup } from "../../other/whiteSpaceChecker.mjs";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type { CommandOsuGenericDataOsuApiV2Credentials } from "../osu.mjs";
import type { RegexOsuChatHandlerCommandPp } from "../../info/regex.mjs";

export interface CommandPpRpCreateReplyInput
  extends CommandOsuGenericDataOsuApiV2Credentials {
  /**
   * Default osu Account ID (used for checking for existing scores).
   */
  defaultOsuId?: number;
}
export interface CommandPpRpDetectorOutput {
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
export const commandPp: ChatMessageHandlerReplyCreator<
  CommandPpRpCreateReplyInput,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandPpRpDetectorOutput
> = {
  createReply: async (_channel, _tags, data, logger) => {
    if (data.defaultOsuId === undefined) {
      throw errorMessageDefaultOsuIdUndefined();
    }

    const oauthAccessToken =
      await osuApiV2.default.oauth.clientCredentialsGrant(
        data.osuApiV2Credentials.clientId,
        data.osuApiV2Credentials.clientSecret,
      );

    if (data.customOsuId === undefined && data.customOsuName !== undefined) {
      const userSearchResult = await osuApiV2.default.search.user(
        oauthAccessToken,
        data.customOsuName,
      );
      if (
        userSearchResult.data !== undefined &&
        Array.isArray(userSearchResult.data) &&
        userSearchResult.data.length > 0
      ) {
        data.customOsuId = userSearchResult.data[0].id;
      }
    }

    await osuApiV2.default.users.get(
      oauthAccessToken,
      data.customOsuId !== undefined ? data.customOsuId : data.defaultOsuId,
      GameMode.OSU_STANDARD,
    );

    const osuPpRequestMacros = new Map();
    osuPpRequestMacros.set(
      macroOsuPpRpRequest.id,
      new Map(
        macroOsuPpRpRequest.generate(
          {
            id:
              data.customOsuId !== undefined
                ? data.customOsuId
                : data.defaultOsuId,
          },
          logger,
        ),
      ),
    );

    return {
      additionalMacros: osuPpRequestMacros,
      messageId: osuCommandReplyPp.id,
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.PP)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandPp);
    if (!match) {
      return false;
    }
    const matchGroups = match.groups as
      | undefined
      | RegexOsuChatHandlerCommandPp;
    if (!matchGroups) {
      throw Error("RegexOsuChatHandlerCommandPp groups undefined");
    }
    if ("osuUserId" in matchGroups && matchGroups.osuUserId !== undefined) {
      return {
        data: { customOsuId: parseInt(matchGroups.osuUserId) },
      };
    }
    if ("osuUserName" in matchGroups && matchGroups.osuUserName !== undefined) {
      return {
        data: {
          customOsuName: removeWhitespaceEscapeChatCommandGroup(
            matchGroups.osuUserName,
          ),
        },
      };
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.PP,
  },
};
