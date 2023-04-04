// Package imports
import { RankStatusInt, Score, User } from "osu-api-v2";
//import path from "path";
// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";
import { monthNames } from "../../other/monthNames.mjs";
import { roundNumber } from "../../other/round.mjs";
//import { writeJsonFile } from "../../other/fileOperations.mjs";
// Type imports
import type { Beatmap, BeatmapUserScore } from "osu-api-v2";

export interface MacroOsuApiData {
  osuApiDefaultId: number;
}
export enum MacroOsuApi {
  DEFAULT_USER_ID = "DEFAULT_USER_ID",
}
export const macroOsuApi = createMessageParserMacroGenerator<
  MacroOsuApi,
  MacroOsuApiData
>(
  {
    id: "OSU_API",
  },
  Object.values(MacroOsuApi),
  (macroId, data) => {
    switch (macroId) {
      case MacroOsuApi.DEFAULT_USER_ID:
        return data.osuApiDefaultId;
    }
  },
);

const mapRankStatusIntToStr = (rankStatusInt: RankStatusInt) => {
  switch (rankStatusInt) {
    case RankStatusInt.APPROVED:
      return "Approved";
    case RankStatusInt.GRAVEYARD:
      return "Graveyard";
    case RankStatusInt.LOVED:
      return "Loved";
    case RankStatusInt.PENDING:
      return "Pending";
    case RankStatusInt.QUALIFIED:
      return "Qualified";
    case RankStatusInt.RANKED:
      return "Ranked";
    case RankStatusInt.WIP:
      return "WIP";
  }
};

export interface MacroOsuBeatmapData {
  beatmap: Beatmap;
}
export enum MacroOsuBeatmap {
  ACC = "ACC",
  AR = "AR",
  ARTIST = "ARTIST",
  BPM = "BPM",
  CC = "CC",
  CREATOR_USER_NAME = "CREATOR_USER_NAME",
  CS = "CS",
  DIFFICULTY_RATING = "DIFFICULTY_RATING",
  DRAIN = "DRAIN",
  HAS_LEADERBOARD = "HAS_LEADERBOARD",
  ID = "ID",
  LAST_UPDATED_MONTH = "LAST_UPDATED_MONTH",
  LAST_UPDATED_YEAR = "LAST_UPDATED_YEAR",
  LENGTH_IN_S = "LENGTH_IN_S",
  MAX_COMBO = "MAX_COMBO",
  PASS_COUNT = "PASS_COUNT",
  PLAY_COUNT = "PLAY_COUNT",
  RANKED_STATUS = "RANKED_STATUS",
  SET_ID = "SET_ID",
  SLC = "SLC",
  SPC = "SPC",
  TITLE = "TITLE",
  URL = "URL",
  VERSION = "VERSION",
}
export const macroOsuBeatmap = createMessageParserMacroGenerator<
  MacroOsuBeatmap,
  MacroOsuBeatmapData
>(
  {
    id: "OSU_BEATMAP",
  },
  Object.values(MacroOsuBeatmap),
  (macroId, data) => {
    const beatmapUpdate = new Date(data.beatmap.last_updated);
    switch (macroId) {
      case MacroOsuBeatmap.ACC:
        return roundNumber(data.beatmap.accuracy, 1);
      case MacroOsuBeatmap.AR:
        return roundNumber(data.beatmap.ar, 1);
      case MacroOsuBeatmap.ARTIST:
        return data.beatmap.beatmapset?.artist;
      case MacroOsuBeatmap.BPM:
        return data.beatmap.bpm;
      case MacroOsuBeatmap.CC:
        return data.beatmap.count_circles;
      case MacroOsuBeatmap.CREATOR_USER_NAME:
        return data.beatmap.beatmapset?.creator;
      case MacroOsuBeatmap.CS:
        return roundNumber(data.beatmap.cs, 1);
      case MacroOsuBeatmap.DIFFICULTY_RATING:
        return roundNumber(data.beatmap.difficulty_rating, 1);
      case MacroOsuBeatmap.DRAIN:
        return roundNumber(data.beatmap.drain, 1);
      case MacroOsuBeatmap.HAS_LEADERBOARD:
        return (
          data.beatmap.ranked === RankStatusInt.APPROVED ||
          data.beatmap.ranked === RankStatusInt.LOVED ||
          data.beatmap.ranked === RankStatusInt.QUALIFIED ||
          data.beatmap.ranked === RankStatusInt.RANKED
        );
      case MacroOsuBeatmap.ID:
        return data.beatmap.id;
      case MacroOsuBeatmap.LAST_UPDATED_MONTH:
        return monthNames[beatmapUpdate.getMonth()];
      case MacroOsuBeatmap.LAST_UPDATED_YEAR:
        return beatmapUpdate.getFullYear();
      case MacroOsuBeatmap.LENGTH_IN_S:
        return data.beatmap.total_length;
      case MacroOsuBeatmap.MAX_COMBO:
        return data.beatmap.max_combo;
      case MacroOsuBeatmap.PASS_COUNT:
        return data.beatmap.passcount;
      case MacroOsuBeatmap.PLAY_COUNT:
        return data.beatmap.playcount;
      case MacroOsuBeatmap.RANKED_STATUS:
        return mapRankStatusIntToStr(data.beatmap.ranked);
      case MacroOsuBeatmap.SET_ID:
        return data.beatmap.beatmapset?.id;
      case MacroOsuBeatmap.SLC:
        return data.beatmap.count_sliders;
      case MacroOsuBeatmap.SPC:
        return data.beatmap.count_spinners;
      case MacroOsuBeatmap.TITLE:
        return data.beatmap.beatmapset?.title;
      case MacroOsuBeatmap.URL:
        return data.beatmap.url;
      case MacroOsuBeatmap.VERSION:
        return data.beatmap.version;
    }
  },
);

export interface MacroOsuScoreData {
  beatmapScore?: BeatmapUserScore;
}
export enum MacroOsuScore {
  ACC = "ACC",
  ARTIST = "ARTIST",
  BEATMAP_ID = "BEATMAP_ID",
  COUNT_100 = "COUNT_100",
  COUNT_300 = "COUNT_300",
  COUNT_50 = "COUNT_50",
  COUNT_MISS = "COUNT_MISS",
  DATE_MONTH = "DATE_MONTH",
  DATE_YEAR = "DATE_YEAR",
  EXISTS = "EXISTS",
  FC = "FC",
  //GLOBAL_RANK = "GLOBAL_RANK",
  HAS_REPLAY = "HAS_REPLAY",
  ID = "ID",
  MAX_COMBO = "MAX_COMBO",
  /** Empty string if no mods are found. */
  MODS = "MODS",
  PASSED = "PASSED",
  PP = "PP",
  RANK = "RANK",
  TIME_IN_S_AGO = "TIME_IN_S_AGO",
  USER_ID = "USER_ID",
  USER_NAME = "USER_NAME",
  VERSION = "VERSION",
}
export const macroOsuScore = createMessageParserMacroGenerator<
  MacroOsuScore,
  MacroOsuScoreData
>(
  {
    id: "OSU_SCORE",
  },
  Object.values(MacroOsuScore),
  (macroId, data) => {
    const beatmapScore = data.beatmapScore;
    if (beatmapScore === undefined) {
      switch (macroId) {
        case MacroOsuScore.EXISTS:
          return false;
        default:
          return undefined;
      }
    }

    const score = beatmapScore.score;
    const scoreDate = new Date(score.created_at);
    const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();

    switch (macroId) {
      case MacroOsuScore.ACC:
        return roundNumber(score.accuracy * 100, 1);
      case MacroOsuScore.ARTIST:
        return score.beatmapset?.artist;
      case MacroOsuScore.BEATMAP_ID:
        return score.beatmap?.id;
      case MacroOsuScore.COUNT_100:
        return score.statistics.count_100;
      case MacroOsuScore.COUNT_300:
        return score.statistics.count_300;
      case MacroOsuScore.COUNT_50:
        return score.statistics.count_50;
      case MacroOsuScore.COUNT_MISS:
        return score.statistics.count_miss;
      case MacroOsuScore.DATE_MONTH:
        return monthNames[scoreDate.getMonth()];
      case MacroOsuScore.DATE_YEAR:
        return scoreDate.getFullYear();
      case MacroOsuScore.EXISTS:
        return beatmapScore.position !== -1;
      case MacroOsuScore.FC:
        return score.perfect;
      //case MacroOsuScore.GLOBAL_RANK:
      //  break;
      case MacroOsuScore.HAS_REPLAY:
        return score.replay;
      case MacroOsuScore.ID:
        return score.id;
      case MacroOsuScore.MAX_COMBO:
        return score.max_combo;
      case MacroOsuScore.MODS:
        return score.mods.join(",");
      case MacroOsuScore.PASSED:
        return score.passed;
      case MacroOsuScore.PP:
        return score.pp ? roundNumber(score.pp, 1) : undefined;
      case MacroOsuScore.RANK:
        return score.rank;
      case MacroOsuScore.TIME_IN_S_AGO:
        return roundNumber(scoreDateRangeMs / 1000, 0);
      case MacroOsuScore.USER_ID:
        return score.user?.id;
      case MacroOsuScore.USER_NAME:
        return score.user?.username;
      case MacroOsuScore.VERSION:
        return score.beatmap?.version;
    }
  },
);

export interface MacroOsuMostRecentPlayData {
  score?: Score;
}
export enum MacroOsuMostRecentPlay {
  ACC = "ACC",
  ARTIST = "ARTIST",
  BEST_SCORE_ID = "BEST_SCORE_ID",
  COUNT_100 = "COUNT_100",
  COUNT_300 = "COUNT_300",
  COUNT_50 = "COUNT_50",
  COUNT_MISS = "COUNT_MISS",
  DATE_MONTH = "DATE_MONTH",
  DATE_YEAR = "DATE_YEAR",
  FC = "FC",
  FOUND = "FOUND",
  HAS_REPLAY = "HAS_REPLAY",
  ID = "ID",
  MAP_ID = "MAP_ID",
  MAX_COMBO = "MAX_COMBO",
  MODS = "MODS",
  PASSED = "PASSED",
  PP = "PP",
  RANK = "RANK",
  TIME_IN_S_AGO = "TIME_IN_S_AGO",
  TITLE = "TITLE",
  USER_ID = "USER_ID",
  USER_NAME = "USER_NAME",
  VERSION = "VERSION",
}
export const macroOsuMostRecentPlay = createMessageParserMacroGenerator<
  MacroOsuMostRecentPlay,
  MacroOsuMostRecentPlayData
>(
  {
    id: "OSU_MOST_RECENT_PLAY",
  },
  Object.values(MacroOsuMostRecentPlay),
  (macroId, data) => {
    const score = data.score;
    if (score === undefined) {
      switch (macroId) {
        case MacroOsuMostRecentPlay.FOUND:
          return false;
        default:
          return undefined;
      }
    }
    const scoreDate = new Date(score.created_at);
    const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();

    switch (macroId) {
      case MacroOsuMostRecentPlay.ACC:
        return roundNumber(score.accuracy * 100, 2);
      case MacroOsuMostRecentPlay.ARTIST:
        return score.beatmapset?.artist;
      case MacroOsuMostRecentPlay.BEST_SCORE_ID:
        return score.best_id ?? undefined;
      case MacroOsuMostRecentPlay.COUNT_100:
        return score.statistics.count_100;
      case MacroOsuMostRecentPlay.COUNT_300:
        return score.statistics.count_300;
      case MacroOsuMostRecentPlay.COUNT_50:
        return score.statistics.count_50;
      case MacroOsuMostRecentPlay.COUNT_MISS:
        return score.statistics.count_miss;
      case MacroOsuMostRecentPlay.DATE_MONTH:
        return monthNames[scoreDate.getMonth()];
      case MacroOsuMostRecentPlay.DATE_YEAR:
        return scoreDate.getFullYear();
      case MacroOsuMostRecentPlay.FOUND:
        return true;
      case MacroOsuMostRecentPlay.FC:
        return score.perfect;
      case MacroOsuMostRecentPlay.HAS_REPLAY:
        return score.replay;
      case MacroOsuMostRecentPlay.ID:
        return score.id;
      case MacroOsuMostRecentPlay.MAP_ID:
        return score.beatmap?.id;
      case MacroOsuMostRecentPlay.MAX_COMBO:
        return score.max_combo;
      case MacroOsuMostRecentPlay.MODS:
        return score.mods.join(",");
      case MacroOsuMostRecentPlay.PASSED:
        return score.passed;
      case MacroOsuMostRecentPlay.PP:
        return score.pp ? roundNumber(score.pp, 1) : undefined;
      case MacroOsuMostRecentPlay.RANK:
        return score.rank;
      case MacroOsuMostRecentPlay.TIME_IN_S_AGO:
        return roundNumber(scoreDateRangeMs / 1000, 0);
      case MacroOsuMostRecentPlay.TITLE:
        return score.beatmapset?.title;
      case MacroOsuMostRecentPlay.USER_ID:
        return score.user?.id;
      case MacroOsuMostRecentPlay.USER_NAME:
        return score.user?.username;
      case MacroOsuMostRecentPlay.VERSION:
        return score.beatmap?.version;
    }

    /*
    writeJsonFile(
      path.join(
        dirname,
        "..",
        "..",
        "..",
        `macro_cache_${macroOsuMostRecentPlay.id}.json`
      ),
      { macroEntries, macroOsuMostRecentPlay, score }
      // eslint-disable-next-line no-console
    ).catch(console.error);
    */
  },
);

export interface MacroOsuUserData {
  user: User;
}
export enum MacroOsuUser {
  ACC = "ACC",
  COUNTRY = "COUNTRY",
  COUNTRY_RANK = "COUNTRY_RANK",
  COUNTS_A = "COUNTS_A",
  COUNTS_S = "COUNTS_S",
  COUNTS_SH = "COUNTS_SH",
  COUNTS_SS = "COUNTS_SS",
  COUNTS_SSH = "COUNTS_SSH",
  GLOBAL_RANK = "GLOBAL_RANK",
  HAS_BUNNY = "HAS_BUNNY",
  HAS_STATISTICS = "HAS_STATISTICS",
  HAS_TUTEL = "HAS_TUTEL",
  ID = "ID",
  JOIN_DATE_MONTH = "JOIN_DATE_MONTH",
  JOIN_DATE_YEAR = "JOIN_DATE_YEAR",
  MAX_COMBO = "MAX_COMBO",
  NAME = "NAME",
  PLAY_STYLE = "PLAY_STYLE",
  PP = "PP",
}
const OSU_ACHIEVEMENT_ID_TUTEL = 151;
const OSU_ACHIEVEMENT_ID_BUNNY = 6;

export const macroOsuUser = createMessageParserMacroGenerator<
  MacroOsuUser,
  MacroOsuUserData
>(
  {
    id: "OSU_USER",
  },
  Object.values(MacroOsuUser),
  (macroId, data) => {
    const joinDate = new Date(data.user.join_date);
    const joinDateMonth = joinDate.getMonth();
    const joinDateYear = joinDate.getFullYear();
    const userAchievements = data.user.user_achievements;

    const hasAchievement = (achievementId: number): boolean =>
      userAchievements !== undefined &&
      userAchievements.findIndex((a) => a.achievement_id === achievementId) >
        -1;

    switch (macroId) {
      case MacroOsuUser.ACC:
        return data.user.statistics
          ? roundNumber(data.user.statistics.hit_accuracy, 1)
          : undefined;
      case MacroOsuUser.COUNTRY:
        return data.user.country.name;
      case MacroOsuUser.COUNTRY_RANK:
        return data.user.statistics?.country_rank;
      case MacroOsuUser.COUNTS_A:
        return data.user.statistics?.grade_counts.a;
      case MacroOsuUser.COUNTS_S:
        return data.user.statistics?.grade_counts.s;
      case MacroOsuUser.COUNTS_SH:
        return data.user.statistics?.grade_counts.sh;
      case MacroOsuUser.COUNTS_SS:
        return data.user.statistics?.grade_counts.ss;
      case MacroOsuUser.COUNTS_SSH:
        return data.user.statistics?.grade_counts.ssh;
      case MacroOsuUser.GLOBAL_RANK:
        return data.user.statistics?.global_rank;
      case MacroOsuUser.HAS_BUNNY:
        return hasAchievement(OSU_ACHIEVEMENT_ID_BUNNY);
      case MacroOsuUser.HAS_STATISTICS:
        return data.user.statistics !== undefined;
      case MacroOsuUser.HAS_TUTEL:
        return hasAchievement(OSU_ACHIEVEMENT_ID_TUTEL);
      case MacroOsuUser.ID:
        return data.user.id;
      case MacroOsuUser.JOIN_DATE_MONTH:
        // eslint-disable-next-line security/detect-object-injection
        return monthNames[joinDateMonth];
      case MacroOsuUser.JOIN_DATE_YEAR:
        return joinDateYear;
      case MacroOsuUser.MAX_COMBO:
        return data.user.statistics?.maximum_combo;
      case MacroOsuUser.NAME:
        return data.user.username;
      case MacroOsuUser.PLAY_STYLE:
        if (data.user.playstyle != null && data.user.playstyle.length > 0) {
          return data.user.playstyle.join(", ");
        }
        return undefined;
      case MacroOsuUser.PP:
        return data.user.statistics
          ? roundNumber(data.user.statistics.pp, 1)
          : undefined;
    }

    /*
    writeJsonFile(
      path.join(
        dirname,
        "..",
        "..",
        "..",
        `macro_cache_${macroOsuUser.id}.json`
      ),
      { macroEntries, macroOsuUser, user }
      // eslint-disable-next-line no-console
    ).catch(console.error);
    */
  },
);
