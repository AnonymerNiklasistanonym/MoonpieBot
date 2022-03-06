// Package imports
import osuApiV2, { Beatmap, RankedStatus } from "osu-api-v2";
// Local imports
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { OsuApiV2Credentials } from "../osu";
import { secondsToString } from "../../other/timePeriodToString";

export const mapRankedStatusToStr = (rankedStatus: RankedStatus) => {
  switch (rankedStatus) {
    case RankedStatus.approved:
      return "Approved";
    case RankedStatus.graveyard:
      return "Graveyard";
    case RankedStatus.loved:
      return "Loved";
    case RankedStatus.pending:
      return "Pending";
    case RankedStatus.qualified:
      return "Qualified";
    case RankedStatus.ranked:
      return "Ranked";
    case RankedStatus.wip:
      return "WIP";
  }
};

export const mapToStr = (beatmap: Beatmap) => {
  let finalString = "";

  if (beatmap.beatmapset !== undefined && beatmap.beatmapset != null) {
    finalString += `${beatmap.beatmapset.title} '${beatmap.version}' [${
      Math.round(beatmap.difficulty_rating * 100 + Number.EPSILON) / 100
    }* ${secondsToString(beatmap.total_length)} ${mapRankedStatusToStr(
      beatmap.ranked
    )}] by ${beatmap.beatmapset.artist}`;
    finalString += ` {CS=${beatmap.cs}, DRAIN=${beatmap.drain}, ACC=${beatmap.accuracy}, AR=${beatmap.ar}, BPM=${beatmap.bpm}}`;
    finalString += ` (${beatmap.url})`;
  } else {
    finalString += " [Error: Beatmapset not found]";
  }
  return finalString;
};

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

  console.log("Check for score of user", defaultOsuId);

  const beatmap = await osuApiV2.beatmaps.lookup(oauthAccessToken, beatmapId);
  const message = mapToStr(beatmap);
  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuRp" }
  );
};
