/* eslint-disable @typescript-eslint/restrict-template-expressions */
import osuApiV2, {
  GameMode,
  OsuApiV2WebRequestError,
  RankedStatus,
} from "osu-api-v2";
import { ScoresType } from "osu-api-v2/lib/users/scores";
import type { OsuApiV2Credentials } from "../../commands/osu";
import type { MessageParserPlugin } from "../plugins";

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
  osuApiV2Credentials: OsuApiV2Credentials
): MessageParserPlugin => {
  return {
    id: "OSU_BEATMAP",
    func: async (_logger, beatmapId?: string) => {
      if (beatmapId === undefined || beatmapId.trim().length === 0) {
        throw Error("osu! beatmap ID was empty");
      }
      const beatmapIdNumber = parseInt(beatmapId);
      const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
        osuApiV2Credentials.clientId,
        osuApiV2Credentials.clientSecret
      );
      const beatmap = await osuApiV2.beatmaps.get(
        oauthAccessToken,
        beatmapIdNumber
      );
      const beatmapUpdate = new Date(beatmap.last_updated);
      return [
        ["TITLE", `${beatmap.beatmapset?.title}`],
        ["VERSION", `${beatmap.version}`],
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
        ["PLAY_COUNT", `${beatmap.playcount}`],
        ["PASS_COUNT", `${beatmap.passcount}`],
      ];
    },
  };
};

export const pluginOsuScore = (
  osuApiV2Credentials: OsuApiV2Credentials
): MessageParserPlugin => {
  return {
    id: "OSU_SCORE",
    func: async (_logger, beatmapIdAndUserId?: string) => {
      if (
        beatmapIdAndUserId === undefined ||
        beatmapIdAndUserId.trim().length === 0
      ) {
        throw Error("osu! beatmap/user ID was empty");
      }
      const beatmapIdAndUserIdNumber = beatmapIdAndUserId
        .split(" ")
        .map((a) => parseInt(a));
      if (beatmapIdAndUserIdNumber.length !== 2) {
        throw Error("osu! beatmap or user ID missing");
      }
      const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
        osuApiV2Credentials.clientId,
        osuApiV2Credentials.clientSecret
      );
      try {
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
              beatmapScore.position !== undefined &&
              beatmapScore.position !== -1
            }`,
          ],
          ["PASSED", `${score.passed}`],
          ["RANK", `${score.rank}`],
          ["FC", `${score.perfect}`],
          [
            "ACC",
            `${Math.round(score.accuracy * 10000 + Number.EPSILON) / 100}`,
          ],
          [
            "PP",
            score.pp == null
              ? "undefined"
              : `${Math.round(score.pp * 100 + Number.EPSILON) / 100}`,
          ],
          ["MODS", `${score.mods.join(",")}`],
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
          ["USER_ID", `${score.user?.id}`],
          ["USER_NAME", `${score.user?.username}`],
          ["TITLE", `${score.beatmapset?.title}`],
          ["ARTIST", `${score.beatmapset?.artist}`],
          ["VERSION", `${score.beatmap?.version}`],
        ];
      } catch (err) {
        if ((err as OsuApiV2WebRequestError).statusCode === 404) {
          return [["EXISTS", "false"]];
        } else {
          throw err;
        }
      }
    },
  };
};

export const pluginOsuMostRecentPlay = (
  osuApiV2Credentials: OsuApiV2Credentials
): MessageParserPlugin => {
  return {
    id: "OSU_MOST_RECENT_PLAY",
    func: async (_logger, userId?: string) => {
      if (userId === undefined || userId.trim().length === 0) {
        throw Error("osu! user ID was empty");
      }
      const userIdNumber = parseInt(userId);
      const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
        osuApiV2Credentials.clientId,
        osuApiV2Credentials.clientSecret
      );
      const lastPlay = await osuApiV2.users.scores(
        oauthAccessToken,
        userIdNumber,
        ScoresType.Recent,
        GameMode.osu,
        1,
        0,
        true
      );
      if (lastPlay.length > 0) {
        const score = lastPlay[0];
        const scoreDate = new Date(score.created_at);
        const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();
        return [
          ["FOUND", "true"],
          ["PASSED", `${score.passed}`],
          ["RANK", `${score.rank}`],
          ["FC", `${score.perfect}`],
          [
            "ACC",
            `${Math.round(score.accuracy * 10000 + Number.EPSILON) / 100}`,
          ],
          [
            "PP",
            score.pp == null
              ? "undefined"
              : `${Math.round(score.pp * 100 + Number.EPSILON) / 100}`,
          ],
          ["MODS", `${score.mods.join(",")}`],
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
          ["MAP_ID", `${score.beatmap?.id}`],
          ["USER_ID", `${score.user?.id}`],
          ["USER_NAME", `${score.user?.username}`],
        ];
      }
      return [["FOUND", "false"]];
    },
  };
};

export const pluginOsuUser = (
  osuApiV2Credentials: OsuApiV2Credentials
): MessageParserPlugin => {
  return {
    id: "OSU_USER",
    func: async (_logger, userId?: string) => {
      if (userId === undefined || userId.trim().length === 0) {
        throw Error("osu! user ID was empty");
      }
      const userIdNumber = parseInt(userId);
      const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
        osuApiV2Credentials.clientId,
        osuApiV2Credentials.clientSecret
      );
      const user = await osuApiV2.users.id(
        oauthAccessToken,
        userIdNumber,
        GameMode.osu
      );
      const joinDate = new Date(user.join_date);
      const joinDateMonth = joinDate.getMonth();
      const joinDateYear = joinDate.getFullYear();
      const userAchievements = user.user_achievements;

      return [
        // eslint-disable-next-line security/detect-object-injection
        ["JOIN_DATE_MONTH", `${monthNames[joinDateMonth]}`],
        ["JOIN_DATE_YEAR", `${joinDateYear}`],
        ["GLOBAL_RANK", `${user.statistics?.global_rank}`],
        ["COUNTRY_RANK", `${user.statistics?.country_rank}`],
        ["COUNTRY", `${user.country.name}`],
        ["ID", `${user.id}`],
        ["NAME", `${user.username}`],
        [
          "PLAYSTYLE",
          `${
            user.playstyle != null && user.playstyle.length > 0
              ? user.playstyle.join(", ")
              : undefined
          }`,
        ],
        ["HAS_STATISTICS", `${user.statistics !== undefined}`],
        [
          "PP",
          `${
            user.statistics
              ? Math.round(user.statistics.pp * 100) / 100
              : undefined
          }`,
        ],
        [
          "ACC",
          `${
            user.statistics
              ? Math.round(user.statistics.hit_accuracy * 100) / 100
              : undefined
          }`,
        ],
        ["MAX_COMBO", `${user.statistics?.maximum_combo}`],
        ["COUNTS_SSH", `${user.statistics?.grade_counts.ssh}`],
        ["COUNTS_SS", `${user.statistics?.grade_counts.ss}`],
        ["COUNTS_SH", `${user.statistics?.grade_counts.sh}`],
        ["COUNTS_S", `${user.statistics?.grade_counts.s}`],
        ["COUNTS_A", `${user.statistics?.grade_counts.a}`],
        [
          "HAS_BUNNY",
          `${
            userAchievements !== undefined &&
            userAchievements.find((a) => a.achievement_id === 6)
              ? true
              : false
          }`,
        ],
        [
          "HAS_TUTEL",
          `${
            userAchievements !== undefined &&
            userAchievements?.find((a) => a.achievement_id === 151)
              ? true
              : false
          }`,
        ],
      ];
    },
  };
};
