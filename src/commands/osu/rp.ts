// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
import { ScoresType } from "osu-api-v2/lib/users/scores";
// Local imports
import {
  CommandDetectorPpRpData,
  errorMessageOsuApiCredentialsUndefined,
  LOG_ID_COMMAND_OSU,
  OsuCommands,
} from "../osu";
import {
  MacroOsuRpRequest,
  macroOsuRpRequestId,
} from "../../messageParser/macros/osuRpRequest";
import {
  osuCommandReplyRp,
  osuCommandReplyRpNotFound,
} from "../../strings/osu/commandReply";
import { errorMessageIdUndefined } from "../../commands";
import { messageParserById } from "../../messageParser";
// Type imports
import type {
  TwitchChatCommandDetector,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { OsuChatHandlerCommandPpRpData } from "../osu";

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

export const detectCommandRp: TwitchChatCommandDetector<
  CommandDetectorPpRpData
> = (tags, message, enabledCommands) => {
  if (message.match(regexRp) && enabledCommands.includes(OsuCommands.RP)) {
    const matchId = regexRpCustomId.exec(message);
    const matchName = regexRpCustomName.exec(message);
    return {
      commandId: LOG_ID_COMMAND_OSU,
      subcommandId: OsuCommands.RP,
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
 * RP (recently played) command: Send the map that was most recently played
 * in osu (via the web api).
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
export const commandRp: TwitchChatCommandHandler<
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
    macroOsuRpRequestId,
    new Map([
      [
        MacroOsuRpRequest.ID,
        `${
          data.customOsuId !== undefined ? data.customOsuId : data.defaultOsuId
        }`,
      ],
    ])
  );

  let message = "";
  if (lastPlay.length > 0) {
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
  return {
    commandId: LOG_ID_COMMAND_OSU,
    subcommandId: OsuCommands.RP,
    replyToMessageId: tags.id,
    sentMessage,
  };
};
