// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
// Local imports
import {
  CommandDetectorPpRpData,
  errorMessageOsuApiCredentialsUndefined,
  LOG_ID_COMMAND_OSU,
  OsuCommands,
} from "../osu";
import {
  MacroOsuPpRequest,
  macroOsuPpRequestId,
} from "../../messageParser/macros/osuPpRequest";
import { errorMessageIdUndefined } from "../../commands";
import { messageParserById } from "../../messageParser";
import { osuCommandReplyPp } from "../../strings/osu/commandReply";
// Type imports
import type {
  TwitchChatCommandDetector,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { OsuChatHandlerCommandPpRpData } from "../osu";

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

export const detectCommandPp: TwitchChatCommandDetector<
  CommandDetectorPpRpData
> = (tags, message, enabledCommands) => {
  if (message.match(regexPp) && enabledCommands.includes(OsuCommands.PP)) {
    const matchId = regexPpCustomId.exec(message);
    const matchName = regexPpCustomName.exec(message);
    return {
      commandId: LOG_ID_COMMAND_OSU,
      subcommandId: OsuCommands.PP,
      message: message,
      messageId: tags.id,
      userName: tags.username,
      data: {
        customOsuId:
          matchId && matchId.length >= 2 ? parseInt(matchId[1]) : undefined,
        customOsuName:
          matchName && matchName.length >= 2 ? matchName[1] : undefined,
      },
    };
  }
  return false;
};

/**
 * PP (from performance points) command: Get performance/general information
 * of an Osu account.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param tags Twitch user state.
 * @param data The command specific data.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for logging).
 */
export const commandPp: TwitchChatCommandHandler<
  OsuChatHandlerCommandPpRpData
> = async (
  client,
  channel,
  tags,
  data,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
) => {
  if (tags.id === undefined) {
    throw errorMessageIdUndefined();
  }
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
    macroOsuPpRequestId,
    new Map([
      [
        MacroOsuPpRequest.ID,
        `${
          data.customOsuId !== undefined ? data.customOsuId : data.defaultOsuId
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
  return {
    commandId: LOG_ID_COMMAND_OSU,
    subcommandId: OsuCommands.PP,
    replyToMessageId: tags.id,
    sentMessage,
  };
};
