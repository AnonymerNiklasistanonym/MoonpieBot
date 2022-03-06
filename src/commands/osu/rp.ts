// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
import { ScoresType } from "osu-api-v2/lib/users/scores";
// Local imports
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
import { mapScoreToStr } from "../../other/osuStringBuilder";
import { OsuApiV2Credentials } from "../osu";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * RP (recently played) command: Send the map that was most recently played
 * in osu (via the web api)
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param osuApiV2Credentials Osu API (v2) credentials
 * @param defaultOsuId The default Osu account ID that should be fetched
 * @param customOsuId If a custom Osu account ID is provided fetch this instead
 * @param logger Logger (used for logging)
 */
export const commandRp = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials,
  defaultOsuId: number,
  customOsuId: undefined | number,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
    osuApiV2Credentials.clientId,
    osuApiV2Credentials.clientSecret
  );

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

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuRp" }
  );
};
