// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
// Local imports
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
import { mapUserToStr } from "../../other/osuStringBuilder";
import { OsuApiV2Credentials } from "../osu";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * PP (from performance points) command: Get performance/general information
 * of an Osu account
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param osuApiV2Credentials Osu API (v2) credentials
 * @param defaultOsuId The default Osu account ID that should be fetched
 * @param customOsuId If a custom Osu account ID is provided fetch this instead
 * @param logger Logger (used for logging)
 */
export const commandPp = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials,
  defaultOsuId: number,
  customOsuId: undefined | number,
  customOsuName: undefined | string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  console.log(customOsuId, customOsuName);

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

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuPp" }
  );
};
