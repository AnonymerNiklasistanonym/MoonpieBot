// Package imports
import osuApiV2, { GameMode, RankedStatus, Score } from "osu-api-v2";
// Local imports
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { ScoresType } from "osu-api-v2/lib/users/scores";
import { OsuApiV2Credentials } from "../osu";

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

export const mapScoreToStr = (score: Score) => {
  let finalString = "";
  if (score.user) {
    finalString += `${score.user.username} (https://osu.ppy.sh/users/${score.user.id})`;
  } else {
    finalString += "[Error: User not found]";
  }
  if (score.passed) {
    finalString += ` achieved a ${score.rank}${score.perfect ? " (FC)" : ""}`;
    if (score.pp != null) {
      finalString += ` with ${score.pp}pp`;
    }
  } else {
    finalString += ` failed`;
  }
  finalString += ` (${score.statistics.count_300}/${score.statistics.count_100}/${score.statistics.count_50}/${score.statistics.count_miss})`;
  finalString += ` [max-combo=${score.max_combo},acc=${
    Math.round((score.accuracy * 100 + Number.EPSILON) * 100) / 100
  }%]`;

  if (score.beatmap !== undefined && score.beatmapset !== undefined) {
    finalString += ` on ${score.beatmapset.title} '${
      score.beatmap.version
    }' [${mapRankedStatusToStr(score.beatmap.ranked)}] by ${
      score.beatmapset.artist
    }`;
    if (score.mods.length > 0) {
      finalString += ` using ${score.mods.join(",")}`;
    }
    finalString += ` (${score.beatmap.url})`;
  } else {
    finalString += " [Error: Beatmap/-set not found]";
  }
  if (score.replay) {
    finalString += ` {replay available}`;
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
