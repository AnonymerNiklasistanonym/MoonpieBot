// Package imports
import osuApiV2, { GameMode } from "osu-api-v2";
// Local imports
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
import { mapUserScoreToStr, mapToStr } from "../../other/osuStringBuilder";
import { OsuApiV2Credentials } from "../osu";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * Post information about a map and if existing the top score in the chat
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param osuApiV2Credentials Osu API (v2) credentials
 * @param defaultOsuId The default Osu account ID that should be fetched
 * @param customOsuId If a custom Osu account ID is provided fetch this instead
 * @param logger Logger (used for logging)
 */
export const commandBeatmap = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials,
  defaultOsuId: number,
  beatmapId: number,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
    osuApiV2Credentials.clientId,
    osuApiV2Credentials.clientSecret
  );

  const beatmap = await osuApiV2.beatmaps.lookup(oauthAccessToken, beatmapId);
  let message = mapToStr(beatmap);
  try {
    const score = await osuApiV2.beatmaps.scores.users(
      oauthAccessToken,
      beatmapId,
      defaultOsuId,
      GameMode.osu,
      undefined
    );
    message += ` - Current top score is ${mapUserScoreToStr(score)}`;
  } catch (err) {
    message += ` No existing score found`;
  }
  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuRp" }
  );
};
