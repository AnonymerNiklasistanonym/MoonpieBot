// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
// Local imports
import {
  errorMessageIdUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { mapUserToStr } from "../../other/osuStringBuilder";
import {
  errorMessageOsuApiCredentialsUndefined,
  OsuCommands,
  LOG_ID_COMMAND_OSU,
} from "../osu";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { OsuApiV2Credentials } from "../osu";

/**
 * PP (from performance points) command: Get performance/general information
 * of an Osu account.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param osuApiV2Credentials The osu API (v2) credentials.
 * @param defaultOsuId Default osu Account ID (used for checking for existing
 * scores).
 * @param customOsuId Custom osu account ID (use this over the default osu
 * account ID and over the not undefined custom osu name if not undefined).
 * @param customOsuName The osu account name (use this over the default osu
 * account ID if not undefined).
 * @param logger Logger (used for logging).
 */
export const commandPp = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials | undefined,
  defaultOsuId: number,
  customOsuId: undefined | number,
  customOsuName: undefined | string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (osuApiV2Credentials === undefined) {
    throw errorMessageOsuApiCredentialsUndefined();
  }

  const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
    osuApiV2Credentials.clientId,
    osuApiV2Credentials.clientSecret
  );

  if (customOsuId === undefined && customOsuName !== undefined) {
    const userSearchResult = await osuApiV2.search.user(
      oauthAccessToken,
      customOsuName
    );
    if (
      userSearchResult?.user?.data !== undefined &&
      Array.isArray(userSearchResult.user.data) &&
      userSearchResult.user.data.length > 0
    ) {
      customOsuId = userSearchResult.user.data[0].id;
    }
  }

  const user = await osuApiV2.users.id(
    oauthAccessToken,
    customOsuId !== undefined ? customOsuId : defaultOsuId,
    GameMode.osu
  );
  const message = mapUserToStr(user);
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_OSU,
    OsuCommands.PP
  );
};
