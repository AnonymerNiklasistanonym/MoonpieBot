/* eslint-disable @typescript-eslint/restrict-template-expressions */

// Package imports
import osuApiV2, { GameMode, RankedStatus } from "osu-api-v2";
import { ScoresType } from "osu-api-v2/lib/users/scores";
// Type imports
import type {
  Beatmap,
  BeatmapUserScore,
  OsuApiV2WebRequestError,
} from "osu-api-v2";
import {
  MacroOsuBeatmap,
  MacroOsuMostRecentPlay,
  MacroOsuScore,
  MacroOsuUser,
  pluginOsuBeatmapId,
  pluginOsuMostRecentPlayId,
  pluginOsuScoreId,
  pluginOsuUserId,
} from "./osuApi";
import type { MacroDictionaryEntry } from "../../messageParser";
import type { MessageParserPlugin } from "../plugins";
import type { OsuApiV2Credentials } from "../../commands/osu";

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

export const convertOsuBeatmapToMacros = (
  beatmap: Beatmap
): MacroDictionaryEntry[] => {
  const beatmapUpdate = new Date(beatmap.last_updated);
  return [
    [MacroOsuBeatmap.TITLE, `${beatmap.beatmapset?.title}`],
    [MacroOsuBeatmap.VERSION, `${beatmap.version}`],
    [
      MacroOsuBeatmap.DIFFICULTY_RATING,
      `${Math.round(beatmap.difficulty_rating * 100 + Number.EPSILON) / 100}`,
    ],
    [MacroOsuBeatmap.ARTIST, `${beatmap.beatmapset?.artist}`],
    [MacroOsuBeatmap.ID, `${beatmap.id}`],
    [MacroOsuBeatmap.CREATOR_USER_NAME, `${beatmap.beatmapset?.creator}`],
    [MacroOsuBeatmap.URL, `${beatmap.url}`],
    [MacroOsuBeatmap.SET_ID, `${beatmap.beatmapset?.id}`],
    [MacroOsuBeatmap.LENGTH_IN_S, `${beatmap.total_length}`],
    [MacroOsuBeatmap.RANKED_STATUS, mapRankedStatusToStr(beatmap.ranked)],
    [MacroOsuBeatmap.LAST_UPDATED_MONTH, monthNames[beatmapUpdate.getMonth()]],
    [MacroOsuBeatmap.LAST_UPDATED_YEAR, `${beatmapUpdate.getFullYear()}`],
    [MacroOsuBeatmap.MAX_COMBO, `${beatmap.max_combo}`],
    [MacroOsuBeatmap.ACC, `${beatmap.accuracy}`],
    [MacroOsuBeatmap.CS, `${beatmap.cs}`],
    [MacroOsuBeatmap.DRAIN, `${beatmap.drain}`],
    [MacroOsuBeatmap.BPM, `${beatmap.bpm}`],
    [MacroOsuBeatmap.AR, `${beatmap.ar}`],
    [MacroOsuBeatmap.CC, `${beatmap.count_circles}`],
    [MacroOsuBeatmap.SLC, `${beatmap.count_sliders}`],
    [MacroOsuBeatmap.SPC, `${beatmap.count_spinners}`],
    [MacroOsuBeatmap.PLAY_COUNT, `${beatmap.playcount}`],
    [MacroOsuBeatmap.PASS_COUNT, `${beatmap.passcount}`],
  ];
};

export const pluginOsuBeatmap = (
  osuApiV2Credentials: OsuApiV2Credentials
): MessageParserPlugin => {
  return {
    id: pluginOsuBeatmapId,
    func: async (_logger, beatmapId, signature) => {
      if (signature === true) {
        return {
          type: "signature",
          argument: "osuBeatmapID",
          exportsMacro: true,
          exportedMacroKeys: Object.values(MacroOsuBeatmap),
        };
      }
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
      return convertOsuBeatmapToMacros(beatmap);
    },
  };
};

const ROUND_TO_2_DIGITS_FACTOR = 100;

export const convertOsuScoreToMacros = (
  beatmapScore: BeatmapUserScore
): MacroDictionaryEntry[] => {
  const score = beatmapScore.score;
  const scoreDate = new Date(score.created_at);
  const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();
  return [
    [
      MacroOsuScore.EXISTS,
      `${beatmapScore.position !== undefined && beatmapScore.position !== -1}`,
    ],
    [MacroOsuScore.PASSED, `${score.passed}`],
    [MacroOsuScore.RANK, `${score.rank}`],
    [MacroOsuScore.FC, `${score.perfect}`],
    [
      MacroOsuScore.ACC,
      `${
        Math.round(
          score.accuracy * 100 * ROUND_TO_2_DIGITS_FACTOR + Number.EPSILON
        ) / ROUND_TO_2_DIGITS_FACTOR
      }`,
    ],
    [
      MacroOsuScore.PP,
      score.pp == null
        ? "undefined"
        : `${
            Math.round(score.pp * ROUND_TO_2_DIGITS_FACTOR + Number.EPSILON) /
            ROUND_TO_2_DIGITS_FACTOR
          }`,
    ],
    [MacroOsuScore.MODS, `${score.mods.join(",")}`],
    [MacroOsuScore.COUNT_300, `${score.statistics.count_300}`],
    [MacroOsuScore.COUNT_100, `${score.statistics.count_100}`],
    [MacroOsuScore.COUNT_50, `${score.statistics.count_50}`],
    [MacroOsuScore.COUNT_MISS, `${score.statistics.count_miss}`],
    [MacroOsuScore.MAX_COMBO, `${score.max_combo}`],
    [MacroOsuScore.TIME_IN_S_AGO, `${scoreDateRangeMs / 1000}`],
    [MacroOsuScore.DATE_MONTH, monthNames[scoreDate.getMonth()]],
    [MacroOsuScore.DATE_YEAR, `${scoreDate.getFullYear()}`],
    [MacroOsuScore.USER_NAME, `${score.user?.username}`],
    [MacroOsuScore.USER_ID, `${score.user?.id}`],
    [MacroOsuScore.HAS_REPLAY, `${score.replay}`],
    [MacroOsuScore.ID, `${score.id}`],
    [MacroOsuScore.TITLE, `${score.beatmapset?.title}`],
    [MacroOsuScore.ARTIST, `${score.beatmapset?.artist}`],
    [MacroOsuScore.VERSION, `${score.beatmap?.version}`],
  ];
};

const STATUS_CODE_NOT_FOUND = 404;

export const pluginOsuScore = (
  osuApiV2Credentials: OsuApiV2Credentials
): MessageParserPlugin => {
  return {
    id: pluginOsuScoreId,
    func: async (_logger, beatmapIdAndUserId, signature) => {
      if (signature === true) {
        return {
          type: "signature",
          argument: "osuBeatmapId osuUserId",
          exportsMacro: true,
          exportedMacroKeys: Object.values(MacroOsuScore),
        };
      }
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
        return convertOsuScoreToMacros(beatmapScore);
      } catch (err) {
        if (
          (err as OsuApiV2WebRequestError).statusCode === STATUS_CODE_NOT_FOUND
        ) {
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
    id: pluginOsuMostRecentPlayId,
    func: async (_logger, userId, signature) => {
      if (signature === true) {
        return {
          type: "signature",
          argument: "osuUserId",
          exportsMacro: true,
          exportedMacroKeys: Object.values(MacroOsuMostRecentPlay),
        };
      }
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
          [MacroOsuMostRecentPlay.FOUND, "true"],
          [MacroOsuMostRecentPlay.PASSED, `${score.passed}`],
          [MacroOsuMostRecentPlay.RANK, `${score.rank}`],
          [MacroOsuMostRecentPlay.FC, `${score.perfect}`],
          [
            MacroOsuMostRecentPlay.ACC,
            `${
              Math.round(
                score.accuracy * 100 * ROUND_TO_2_DIGITS_FACTOR + Number.EPSILON
              ) / ROUND_TO_2_DIGITS_FACTOR
            }`,
          ],
          [
            MacroOsuMostRecentPlay.PP,
            score.pp == null
              ? "undefined"
              : `${Math.round(score.pp * 100 + Number.EPSILON) / 100}`,
          ],
          [MacroOsuMostRecentPlay.MODS, `${score.mods.join(",")}`],
          [MacroOsuMostRecentPlay.COUNT_300, `${score.statistics.count_300}`],
          [MacroOsuMostRecentPlay.COUNT_100, `${score.statistics.count_100}`],
          [MacroOsuMostRecentPlay.COUNT_50, `${score.statistics.count_50}`],
          [MacroOsuMostRecentPlay.COUNT_MISS, `${score.statistics.count_miss}`],
          [MacroOsuMostRecentPlay.MAX_COMBO, `${score.max_combo}`],
          [MacroOsuMostRecentPlay.TIME_IN_S_AGO, `${scoreDateRangeMs / 1000}`],
          [MacroOsuMostRecentPlay.DATE_MONTH, monthNames[scoreDate.getMonth()]],
          [MacroOsuMostRecentPlay.DATE_YEAR, `${scoreDate.getFullYear()}`],
          [MacroOsuMostRecentPlay.USER_NAME, `${score.user?.username}`],
          [MacroOsuMostRecentPlay.USER_ID, `${score.user?.id}`],
          [MacroOsuMostRecentPlay.HAS_REPLAY, `${score.replay}`],
          [MacroOsuMostRecentPlay.ID, `${score.id}`],
          [MacroOsuMostRecentPlay.MAP_ID, `${score.beatmap?.id}`],
          [MacroOsuMostRecentPlay.USER_ID, `${score.user?.id}`],
          [MacroOsuMostRecentPlay.USER_NAME, `${score.user?.username}`],
        ];
      }
      return [["FOUND", "false"]];
    },
  };
};

const OSU_ACHIEVEMENT_ID_TUTEL = 151;
const OSU_ACHIEVEMENT_ID_BUNNY = 6;

export const pluginOsuUser = (
  osuApiV2Credentials: OsuApiV2Credentials
): MessageParserPlugin => {
  return {
    id: pluginOsuUserId,
    func: async (_logger, userId, signature) => {
      if (signature === true) {
        return {
          type: "signature",
          argument: "osuUserId",
          exportsMacro: true,
          exportedMacroKeys: Object.values(MacroOsuUser),
        };
      }
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
        [MacroOsuUser.JOIN_DATE_MONTH, `${monthNames[joinDateMonth]}`],
        [MacroOsuUser.JOIN_DATE_YEAR, `${joinDateYear}`],
        [MacroOsuUser.GLOBAL_RANK, `${user.statistics?.global_rank}`],
        [MacroOsuUser.COUNTRY_RANK, `${user.statistics?.country_rank}`],
        [MacroOsuUser.COUNTRY, `${user.country.name}`],
        [MacroOsuUser.ID, `${user.id}`],
        [MacroOsuUser.NAME, `${user.username}`],
        [
          MacroOsuUser.PLAYSTYLE,
          `${
            user.playstyle != null && user.playstyle.length > 0
              ? user.playstyle.join(", ")
              : undefined
          }`,
        ],
        [MacroOsuUser.HAS_STATISTICS, `${user.statistics !== undefined}`],
        [
          MacroOsuUser.PP,
          `${
            user.statistics
              ? Math.round(user.statistics.pp * ROUND_TO_2_DIGITS_FACTOR) /
                ROUND_TO_2_DIGITS_FACTOR
              : undefined
          }`,
        ],
        [
          MacroOsuUser.ACC,
          `${
            user.statistics
              ? Math.round(
                  user.statistics.hit_accuracy * ROUND_TO_2_DIGITS_FACTOR
                ) / ROUND_TO_2_DIGITS_FACTOR
              : undefined
          }`,
        ],
        [MacroOsuUser.MAX_COMBO, `${user.statistics?.maximum_combo}`],
        [MacroOsuUser.COUNTS_SSH, `${user.statistics?.grade_counts.ssh}`],
        [MacroOsuUser.COUNTS_SS, `${user.statistics?.grade_counts.ss}`],
        [MacroOsuUser.COUNTS_SH, `${user.statistics?.grade_counts.sh}`],
        [MacroOsuUser.COUNTS_S, `${user.statistics?.grade_counts.s}`],
        [MacroOsuUser.COUNTS_A, `${user.statistics?.grade_counts.a}`],
        [
          MacroOsuUser.HAS_BUNNY,
          `${
            userAchievements !== undefined &&
            userAchievements.find(
              (a) => a.achievement_id === OSU_ACHIEVEMENT_ID_BUNNY
            )
              ? true
              : false
          }`,
        ],
        [
          MacroOsuUser.HAS_TUTEL,
          `${
            userAchievements !== undefined &&
            userAchievements?.find(
              (a) => a.achievement_id === OSU_ACHIEVEMENT_ID_TUTEL
            )
              ? true
              : false
          }`,
        ],
      ];
    },
  };
};
