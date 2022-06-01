// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
import { ScoresType } from "osu-api-v2/lib/users/scores";
// Local imports
import { errorMessageIdUndefined, loggerCommandReply } from "../commandHelper";
import { mapScoreToStr } from "../../other/osuStringBuilder";
import { errorMessageOsuApiCredentialsUndefined, OsuCommands } from "../osu";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { OsuApiV2Credentials } from "../osu";

/**
 * RP (recently played) command: Send the map that was most recently played
 * in osu (via the web api).
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
export const commandRp = async (
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

  const lastPlay = await osuApiV2.users.scores(
    oauthAccessToken,
    customOsuId !== undefined ? customOsuId : defaultOsuId,
    ScoresType.Recent,
    GameMode.osu,
    1,
    0,
    true
  );
  const message =
    lastPlay.length > 0
      ? `Most recent play: ${lastPlay.map(mapScoreToStr).join(", ")}`
      : "No recent play found";
  const sentMessage = await client.say(channel, message);

  loggerCommandReply(logger, messageId, sentMessage, `osu:${OsuCommands.RP}`);
};
