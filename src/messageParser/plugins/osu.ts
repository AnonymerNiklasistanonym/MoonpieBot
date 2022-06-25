/* eslint-disable @typescript-eslint/restrict-template-expressions */
import osuApiV2, { OAuthAccessToken, RankedStatus } from "osu-api-v2";
import { MessageParserPlugin } from "../plugins";

const mapRankedStatusToStr = (rankedStatus: RankedStatus) => {
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

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const pluginOsuBeatmap = (
  oauthAccessToken: OAuthAccessToken
): MessageParserPlugin => {
  return {
    id: "OSU_BEATMAP",
    func: async (beatmapId?: string) => {
      if (beatmapId === undefined || beatmapId.trim().length === 0) {
        throw Error("osu! beatmap ID was empty!");
      }
      const beatmapIdNumber = parseInt(beatmapId);
      const beatmap = await osuApiV2.beatmaps.get(
        oauthAccessToken,
        beatmapIdNumber
      );
      const beatmapUpdate = new Date(beatmap.last_updated);
      return [
        ["TITLE", `${beatmap.beatmapset?.title}`],
        ["DIFFICULTY", `${beatmap.version}`],
        [
          "DIFFICULTY_RATING",
          `${
            Math.round(beatmap.difficulty_rating * 100 + Number.EPSILON) / 100
          }`,
        ],
        ["ARTIST", `${beatmap.beatmapset?.artist}`],
        ["ID", `${beatmap.id}`],
        ["CREATOR_USER_NAME", `${beatmap.beatmapset?.creator}`],
        ["URL", `${beatmap.url}`],
        ["SET_ID", `${beatmap.beatmapset?.id}`],
        ["LENGTH_IN_S", `${beatmap.total_length}`],
        ["RANKED_STATUS", mapRankedStatusToStr(beatmap.ranked)],
        ["LAST_UPDATED_MONTH", monthNames[beatmapUpdate.getMonth()]],
        ["LAST_UPDATED_YEAR", `${beatmapUpdate.getFullYear()}`],
        ["MAX_COMBO", `${beatmap.max_combo}`],
        ["ACC", `${beatmap.accuracy}`],
        ["CS", `${beatmap.cs}`],
        ["DRAIN", `${beatmap.drain}`],
        ["BPM", `${beatmap.bpm}`],
        ["AR", `${beatmap.ar}`],
        ["CC", `${beatmap.count_circles}`],
        ["SLC", `${beatmap.count_sliders}`],
        ["SPC", `${beatmap.count_spinners}`],
      ];
    },
  };
};

export const pluginOsuScore = (
  oauthAccessToken: OAuthAccessToken
): MessageParserPlugin => {
  return {
    id: "OSU_SCORE",
    func: async (beatmapIdAndUserId?: string) => {
      if (
        beatmapIdAndUserId === undefined ||
        beatmapIdAndUserId.trim().length === 0
      ) {
        throw Error("osu! beatmap/user ID was empty!");
      }
      const beatmapIdAndUserIdNumber = beatmapIdAndUserId
        .split(" ")
        .map((a) => parseInt(a));
      if (beatmapIdAndUserIdNumber.length !== 2) {
        throw Error("osu! beatmap or user ID missing!");
      }
      const beatmapScore = await osuApiV2.beatmaps.scores.users(
        oauthAccessToken,
        beatmapIdAndUserIdNumber[0],
        beatmapIdAndUserIdNumber[1]
      );
      const score = beatmapScore.score;
      const scoreDate = new Date(score.created_at);
      const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();
      return [
        [
          "EXISTS",
          `${
            beatmapScore.position !== undefined && beatmapScore.position !== -1
          }`,
        ],
        ["PASSED", `${score.passed}`],
        ["RANK", `${score.rank}`],
        ["FC", `${score.perfect}`],
        [
          "PP",
          score.pp == null
            ? "undefined"
            : `${Math.round(score.pp * 100 + Number.EPSILON) / 100}`,
        ],
        ["MODS", `${score.mods.join(" ")}`],
        ["COUNT_300", `${score.statistics.count_300}`],
        ["COUNT_100", `${score.statistics.count_100}`],
        ["COUNT_50", `${score.statistics.count_50}`],
        ["COUNT_MISS", `${score.statistics.count_miss}`],
        ["MAX_COMBO", `${score.max_combo}`],
        ["TIME_IN_S_AGO", `${scoreDateRangeMs / 1000}`],
        ["DATE_MONTH", monthNames[scoreDate.getMonth()]],
        ["DATE_YEAR", `${scoreDate.getFullYear()}`],
        ["USER_NAME", `${score.user?.username}`],
        ["USER_ID", `${score.user?.id}`],
        ["HAS_REPLAY", `${score.replay}`],
        ["ID", `${score.id}`],
      ];
    },
  };
};
