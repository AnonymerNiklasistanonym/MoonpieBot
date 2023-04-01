// Package imports
import { RankStatusInt, Score, User } from "osu-api-v2";
//import path from "path";
// Relative imports
import { monthNames } from "../../other/monthNames.mjs";
import { roundNumber } from "../../other/round.mjs";
//import { writeJsonFile } from "../../other/fileOperations.mjs";
// Type imports
import type { Beatmap, BeatmapUserScore } from "osu-api-v2";
import type {
  MacroDictionaryEntry,
  MessageParserMacroGenerator,
} from "../../messageParser.mjs";

export interface MacroOsuApiData {
  osuApiDefaultId: number;
}
export enum MacroOsuApi {
  DEFAULT_USER_ID = "DEFAULT_USER_ID",
}
export const macroOsuApi: MessageParserMacroGenerator<
  MacroOsuApiData,
  MacroOsuApi
> = {
  generate: (data) =>
    Object.values(MacroOsuApi).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuApi.DEFAULT_USER_ID:
          macroValue = `${data.osuApiDefaultId}`;
          break;
      }
      return [macroId, macroValue];
    }),
  id: "OSU_API",
  keys: Object.values(MacroOsuApi),
};

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
export const macroOsuBeatmap: MessageParserMacroGenerator<
  MacroOsuBeatmapData,
  MacroOsuBeatmap
> = {
  generate: (data) => {
    const beatmapUpdate = new Date(data.beatmap.last_updated);

    return Object.values(MacroOsuBeatmap).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuBeatmap.ACC:
          macroValue = roundNumber(data.beatmap.accuracy, 1);
          break;
        case MacroOsuBeatmap.AR:
          macroValue = roundNumber(data.beatmap.ar, 1);
          break;
        case MacroOsuBeatmap.ARTIST:
          macroValue = data.beatmap.beatmapset?.artist;
          break;
        case MacroOsuBeatmap.BPM:
          macroValue = data.beatmap.bpm;
          break;
        case MacroOsuBeatmap.CC:
          macroValue = data.beatmap.count_circles;
          break;
        case MacroOsuBeatmap.CREATOR_USER_NAME:
          macroValue = data.beatmap.beatmapset?.creator;
          break;
        case MacroOsuBeatmap.CS:
          macroValue = roundNumber(data.beatmap.cs, 1);
          break;
        case MacroOsuBeatmap.DIFFICULTY_RATING:
          macroValue = roundNumber(data.beatmap.difficulty_rating, 1);
          break;
        case MacroOsuBeatmap.DRAIN:
          macroValue = roundNumber(data.beatmap.drain, 1);
          break;
        case MacroOsuBeatmap.HAS_LEADERBOARD:
          macroValue =
            data.beatmap.ranked === RankStatusInt.APPROVED ||
            data.beatmap.ranked === RankStatusInt.LOVED ||
            data.beatmap.ranked === RankStatusInt.QUALIFIED ||
            data.beatmap.ranked === RankStatusInt.RANKED;
          break;
        case MacroOsuBeatmap.ID:
          macroValue = data.beatmap.id;
          break;
        case MacroOsuBeatmap.LAST_UPDATED_MONTH:
          macroValue = monthNames[beatmapUpdate.getMonth()];
          break;
        case MacroOsuBeatmap.LAST_UPDATED_YEAR:
          macroValue = beatmapUpdate.getFullYear();
          break;
        case MacroOsuBeatmap.LENGTH_IN_S:
          macroValue = data.beatmap.total_length;
          break;
        case MacroOsuBeatmap.MAX_COMBO:
          macroValue = data.beatmap.max_combo;
          break;
        case MacroOsuBeatmap.PASS_COUNT:
          macroValue = data.beatmap.passcount;
          break;
        case MacroOsuBeatmap.PLAY_COUNT:
          macroValue = data.beatmap.playcount;
          break;
        case MacroOsuBeatmap.RANKED_STATUS:
          macroValue = mapRankStatusIntToStr(data.beatmap.ranked);
          break;
        case MacroOsuBeatmap.SET_ID:
          macroValue = data.beatmap.beatmapset?.id;
          break;
        case MacroOsuBeatmap.SLC:
          macroValue = data.beatmap.count_sliders;
          break;
        case MacroOsuBeatmap.SPC:
          macroValue = data.beatmap.count_spinners;
          break;
        case MacroOsuBeatmap.TITLE:
          macroValue = data.beatmap.beatmapset?.title;
          break;
        case MacroOsuBeatmap.URL:
          macroValue = data.beatmap.url;
          break;
        case MacroOsuBeatmap.VERSION:
          macroValue = data.beatmap.version;
          break;
      }
      if (typeof macroValue === "boolean") {
        macroValue = macroValue ? "true" : "false";
      }
      if (typeof macroValue === "undefined") {
        macroValue = "undefined";
      }
      if (typeof macroValue === "number") {
        macroValue = `${macroValue}`;
      }
      return [macroId, macroValue];
    });
  },
  id: "OSU_BEATMAP",
  keys: Object.values(MacroOsuBeatmap),
};

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
export const macroOsuScore: MessageParserMacroGenerator<
  MacroOsuScoreData,
  MacroOsuScore
> = {
  generate: (data) => {
    const beatmapScore = data.beatmapScore;
    if (beatmapScore === undefined) {
      return Object.values(MacroOsuScore).map((macroId) => {
        let macroValue;
        switch (macroId) {
          case MacroOsuScore.EXISTS:
            macroValue = false;
            break;
          default:
            macroValue = undefined;
            break;
        }
        if (typeof macroValue === "boolean") {
          macroValue = macroValue ? "true" : "false";
        }
        if (typeof macroValue === "undefined") {
          macroValue = "undefined";
        }
        return [macroId, macroValue];
      });
    }

    const score = beatmapScore.score;
    const scoreDate = new Date(score.created_at);
    const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();

    return Object.values(MacroOsuScore).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuScore.ACC:
          macroValue = roundNumber(score.accuracy * 100, 1);
          break;
        case MacroOsuScore.ARTIST:
          macroValue = score.beatmapset?.artist;
          break;
        case MacroOsuScore.BEATMAP_ID:
          macroValue = score.beatmap?.id;
          break;
        case MacroOsuScore.COUNT_100:
          macroValue = score.statistics.count_100;
          break;
        case MacroOsuScore.COUNT_300:
          macroValue = score.statistics.count_300;
          break;
        case MacroOsuScore.COUNT_50:
          macroValue = score.statistics.count_50;
          break;
        case MacroOsuScore.COUNT_MISS:
          macroValue = score.statistics.count_miss;
          break;
        case MacroOsuScore.DATE_MONTH:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          macroValue = monthNames[scoreDate.getMonth()];
          break;
        case MacroOsuScore.DATE_YEAR:
          macroValue = scoreDate.getFullYear();
          break;
        case MacroOsuScore.EXISTS:
          macroValue =
            beatmapScore.position !== undefined && beatmapScore.position !== -1;
          break;
        case MacroOsuScore.FC:
          macroValue = score.perfect;
          break;
        //case MacroOsuScore.GLOBAL_RANK:
        //  break;
        case MacroOsuScore.HAS_REPLAY:
          macroValue = score.replay;
          break;
        case MacroOsuScore.ID:
          macroValue = score.id;
          break;
        case MacroOsuScore.MAX_COMBO:
          macroValue = score.max_combo;
          break;
        case MacroOsuScore.MODS:
          macroValue = score.mods.join(",");
          break;
        case MacroOsuScore.PASSED:
          macroValue = score.passed;
          break;
        case MacroOsuScore.PP:
          if (score.pp !== null && score.pp !== undefined) {
            macroValue = roundNumber(score.pp, 1);
          }
          break;
        case MacroOsuScore.RANK:
          macroValue = score.rank;
          break;
        case MacroOsuScore.TIME_IN_S_AGO:
          macroValue = roundNumber(scoreDateRangeMs / 1000, 0);
          break;
        case MacroOsuScore.USER_ID:
          macroValue = score.user?.id;
          break;
        case MacroOsuScore.USER_NAME:
          macroValue = score.user?.username;
          break;
        case MacroOsuScore.VERSION:
          macroValue = score.beatmap?.version;
          break;
      }
      if (typeof macroValue === "boolean") {
        macroValue = macroValue ? "true" : "false";
      }
      if (typeof macroValue === "undefined") {
        macroValue = "undefined";
      }
      if (typeof macroValue === "number") {
        macroValue = `${macroValue}`;
      }
      return [macroId, macroValue];
    });
  },
  id: "OSU_SCORE",
  keys: Object.values(MacroOsuScore),
};

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
export const macroOsuMostRecentPlay: MessageParserMacroGenerator<
  MacroOsuMostRecentPlayData,
  MacroOsuMostRecentPlay
> = {
  generate: (data) => {
    const score = data.score;
    if (score === undefined) {
      return Object.values(MacroOsuMostRecentPlay).map((macroId) => {
        let macroValue;
        switch (macroId) {
          case MacroOsuMostRecentPlay.FOUND:
            macroValue = false;
            break;
          default:
            macroValue = undefined;
            break;
        }
        if (typeof macroValue === "boolean") {
          macroValue = macroValue ? "true" : "false";
        }
        if (macroValue === undefined) {
          macroValue = "undefined";
        }
        return [macroId, macroValue];
      });
    }
    const scoreDate = new Date(score.created_at);
    const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();

    const macroEntries: MacroDictionaryEntry<MacroOsuMostRecentPlay>[] =
      Object.values(MacroOsuMostRecentPlay).map((macroId) => {
        let macroValue;
        switch (macroId) {
          case MacroOsuMostRecentPlay.ACC:
            macroValue = roundNumber(score.accuracy * 100, 2);
            break;
          case MacroOsuMostRecentPlay.ARTIST:
            macroValue = score.beatmapset?.artist;
            break;
          case MacroOsuMostRecentPlay.BEST_SCORE_ID:
            if (score.best_id !== null) {
              macroValue = score.best_id;
            }
            break;
          case MacroOsuMostRecentPlay.COUNT_100:
            macroValue = score.statistics.count_100;
            break;
          case MacroOsuMostRecentPlay.COUNT_300:
            macroValue = score.statistics.count_300;
            break;
          case MacroOsuMostRecentPlay.COUNT_50:
            macroValue = score.statistics.count_50;
            break;
          case MacroOsuMostRecentPlay.COUNT_MISS:
            macroValue = score.statistics.count_miss;
            break;
          case MacroOsuMostRecentPlay.DATE_MONTH:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            macroValue = monthNames[scoreDate.getMonth()];
            break;
          case MacroOsuMostRecentPlay.DATE_YEAR:
            macroValue = scoreDate.getFullYear();
            break;
          case MacroOsuMostRecentPlay.FOUND:
            macroValue = true;
            break;
          case MacroOsuMostRecentPlay.FC:
            macroValue = score.perfect;
            break;
          case MacroOsuMostRecentPlay.HAS_REPLAY:
            macroValue = score.replay;
            break;
          case MacroOsuMostRecentPlay.ID:
            macroValue = score.id;
            break;
          case MacroOsuMostRecentPlay.MAP_ID:
            macroValue = score.beatmap?.id;
            break;
          case MacroOsuMostRecentPlay.MAX_COMBO:
            macroValue = score.max_combo;
            break;
          case MacroOsuMostRecentPlay.MODS:
            macroValue = score.mods.join(",");
            break;
          case MacroOsuMostRecentPlay.PASSED:
            macroValue = score.passed;
            break;
          case MacroOsuMostRecentPlay.PP:
            if (score.pp !== null && score.pp !== undefined) {
              macroValue = roundNumber(score.pp, 1);
            }
            break;
          case MacroOsuMostRecentPlay.RANK:
            macroValue = score.rank;
            break;
          case MacroOsuMostRecentPlay.TIME_IN_S_AGO:
            macroValue = roundNumber(scoreDateRangeMs / 1000, 0);
            break;
          case MacroOsuMostRecentPlay.TITLE:
            macroValue = score.beatmapset?.title;
            break;
          case MacroOsuMostRecentPlay.USER_ID:
            macroValue = score.user?.id;
            break;
          case MacroOsuMostRecentPlay.USER_NAME:
            macroValue = score.user?.username;
            break;
          case MacroOsuMostRecentPlay.VERSION:
            macroValue = score.beatmap?.version;
            break;
        }
        if (typeof macroValue === "boolean") {
          macroValue = macroValue ? "true" : "false";
        }
        if (macroValue === undefined) {
          macroValue = "undefined";
        }
        if (typeof macroValue === "number") {
          macroValue = `${macroValue}`;
        }
        return [macroId, macroValue];
      });

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

    return macroEntries;
  },
  id: "OSU_MOST_RECENT_PLAY",
  keys: Object.values(MacroOsuMostRecentPlay),
};

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
export const macroOsuUser: MessageParserMacroGenerator<
  MacroOsuUserData,
  MacroOsuUser
> = {
  generate: (data) => {
    const joinDate = new Date(data.user.join_date);
    const joinDateMonth = joinDate.getMonth();
    const joinDateYear = joinDate.getFullYear();
    const userAchievements = data.user.user_achievements;

    const hasAchievement = (achievementId: number): boolean =>
      userAchievements !== undefined &&
      userAchievements.findIndex((a) => a.achievement_id === achievementId) >
        -1;

    const macroEntries: MacroDictionaryEntry<MacroOsuUser>[] = Object.values(
      MacroOsuUser
    ).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuUser.ACC:
          if (data.user.statistics) {
            macroValue = roundNumber(data.user.statistics.hit_accuracy, 1);
          }
          break;
        case MacroOsuUser.COUNTRY:
          macroValue = data.user.country.name;
          break;
        case MacroOsuUser.COUNTRY_RANK:
          macroValue = data.user.statistics?.country_rank;
          break;
        case MacroOsuUser.COUNTS_A:
          macroValue = data.user.statistics?.grade_counts.a;
          break;
        case MacroOsuUser.COUNTS_S:
          macroValue = data.user.statistics?.grade_counts.s;
          break;
        case MacroOsuUser.COUNTS_SH:
          macroValue = data.user.statistics?.grade_counts.sh;
          break;
        case MacroOsuUser.COUNTS_SS:
          macroValue = data.user.statistics?.grade_counts.ss;
          break;
        case MacroOsuUser.COUNTS_SSH:
          macroValue = data.user.statistics?.grade_counts.ssh;
          break;
        case MacroOsuUser.GLOBAL_RANK:
          macroValue = data.user.statistics?.global_rank;
          break;
        case MacroOsuUser.HAS_BUNNY:
          macroValue = hasAchievement(OSU_ACHIEVEMENT_ID_BUNNY);
          break;
        case MacroOsuUser.HAS_STATISTICS:
          macroValue = data.user.statistics !== undefined;
          break;
        case MacroOsuUser.HAS_TUTEL:
          macroValue = hasAchievement(OSU_ACHIEVEMENT_ID_TUTEL);
          break;
        case MacroOsuUser.ID:
          macroValue = data.user.id;
          break;
        case MacroOsuUser.JOIN_DATE_MONTH:
          // eslint-disable-next-line security/detect-object-injection
          macroValue = monthNames[joinDateMonth];
          break;
        case MacroOsuUser.JOIN_DATE_YEAR:
          macroValue = joinDateYear;
          break;
        case MacroOsuUser.MAX_COMBO:
          macroValue = data.user.statistics?.maximum_combo;
          break;
        case MacroOsuUser.NAME:
          macroValue = data.user.username;
          break;
        case MacroOsuUser.PLAY_STYLE:
          if (data.user.playstyle != null && data.user.playstyle.length > 0) {
            macroValue = data.user.playstyle.join(", ");
          }
          break;
        case MacroOsuUser.PP:
          if (data.user.statistics) {
            macroValue = roundNumber(data.user.statistics.pp, 1);
          }
          break;
      }
      if (typeof macroValue === "boolean") {
        macroValue = macroValue ? "true" : "false";
      }
      if (typeof macroValue === "undefined") {
        macroValue = "undefined";
      }
      if (typeof macroValue === "number") {
        macroValue = `${macroValue}`;
      }
      return [macroId, macroValue];
    });

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

    return macroEntries;
  },
  id: "OSU_USER",
  keys: Object.values(MacroOsuUser),
};
