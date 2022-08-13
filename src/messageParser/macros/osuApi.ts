// Package imports
import { RankedStatus } from "osu-api-v2";
// Local imports
import { monthNames } from "../../other/monthNames";
import { roundNumber } from "../../other/round";
// Type imports
import type { Beatmap, BeatmapUserScore } from "osu-api-v2";
import type { MacroDictionaryEntry } from "../../messageParser";
import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuApi {
  DEFAULT_USER_ID = "DEFAULT_USER_ID",
}
export const macroOsuApi: MessageParserMacroDocumentation = {
  id: "OSU_API",
  keys: Object.values(MacroOsuApi),
};

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

export const macroOsuBeatmap: MessageParserMacroDocumentation = {
  id: "OSU_BEATMAP",
  keys: Object.values(MacroOsuBeatmap),
};

export const macroOsuBeatmapLogic = (
  beatmap: Beatmap
): MacroDictionaryEntry<MacroOsuBeatmap>[] => {
  const beatmapUpdate = new Date(beatmap.last_updated);

  return Object.values(MacroOsuBeatmap).map<[MacroOsuBeatmap, string]>(
    (macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuBeatmap.ACC:
          macroValue = roundNumber(beatmap.accuracy, 2);
          break;
        case MacroOsuBeatmap.AR:
          macroValue = roundNumber(beatmap.ar, 2);
          break;
        case MacroOsuBeatmap.ARTIST:
          macroValue = beatmap.beatmapset?.artist;
          break;
        case MacroOsuBeatmap.BPM:
          macroValue = beatmap.bpm;
          break;
        case MacroOsuBeatmap.CC:
          macroValue = beatmap.count_circles;
          break;
        case MacroOsuBeatmap.CREATOR_USER_NAME:
          macroValue = beatmap.beatmapset?.creator;
          break;
        case MacroOsuBeatmap.CS:
          macroValue = roundNumber(beatmap.cs, 2);
          break;
        case MacroOsuBeatmap.DIFFICULTY_RATING:
          macroValue = roundNumber(beatmap.difficulty_rating * 100, 2);
          break;
        case MacroOsuBeatmap.DRAIN:
          macroValue = roundNumber(beatmap.drain, 2);
          break;
        case MacroOsuBeatmap.ID:
          macroValue = beatmap.id;
          break;
        case MacroOsuBeatmap.LAST_UPDATED_MONTH:
          macroValue = monthNames[beatmapUpdate.getMonth()];
          break;
        case MacroOsuBeatmap.LAST_UPDATED_YEAR:
          macroValue = beatmapUpdate.getFullYear();
          break;
        case MacroOsuBeatmap.LENGTH_IN_S:
          macroValue = beatmap.total_length;
          break;
        case MacroOsuBeatmap.MAX_COMBO:
          macroValue = beatmap.max_combo;
          break;
        case MacroOsuBeatmap.PASS_COUNT:
          macroValue = beatmap.passcount;
          break;
        case MacroOsuBeatmap.PLAY_COUNT:
          macroValue = beatmap.playcount;
          break;
        case MacroOsuBeatmap.RANKED_STATUS:
          macroValue = mapRankedStatusToStr(beatmap.ranked);
          break;
        case MacroOsuBeatmap.SET_ID:
          macroValue = beatmap.beatmapset?.id;
          break;
        case MacroOsuBeatmap.SLC:
          macroValue = beatmap.count_sliders;
          break;
        case MacroOsuBeatmap.SPC:
          macroValue = beatmap.count_spinners;
          break;
        case MacroOsuBeatmap.TITLE:
          macroValue = beatmap.beatmapset?.title;
          break;
        case MacroOsuBeatmap.URL:
          macroValue = beatmap.url;
          break;
        case MacroOsuBeatmap.VERSION:
          macroValue = beatmap.version;
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
    }
  );
};

export enum MacroOsuScore {
  ACC = "ACC",
  ARTIST = "ARTIST",
  COUNT_100 = "COUNT_100",
  COUNT_300 = "COUNT_300",
  COUNT_50 = "COUNT_50",
  COUNT_MISS = "COUNT_MISS",
  DATE_MONTH = "DATE_MONTH",
  DATE_YEAR = "DATE_YEAR",
  EXISTS = "EXISTS",
  FC = "FC",
  HAS_REPLAY = "HAS_REPLAY",
  ID = "ID",
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

export const macroOsuScore: MessageParserMacroDocumentation = {
  id: "OSU_SCORE",
  keys: Object.values(MacroOsuScore),
};

export const macroOsuScoreLogic = (
  beatmapScore: BeatmapUserScore
): MacroDictionaryEntry<MacroOsuScore>[] => {
  const score = beatmapScore.score;
  const scoreDate = new Date(score.created_at);
  const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();

  return Object.values(MacroOsuScore).map<[MacroOsuScore, string]>(
    (macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuScore.ACC:
          macroValue = roundNumber(score.accuracy * 100, 2);
          break;
        case MacroOsuScore.ARTIST:
          macroValue = score.beatmapset?.artist;
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
          macroValue = roundNumber(score.pp, 2);
          break;
        case MacroOsuScore.RANK:
          macroValue = score.rank;
          break;
        case MacroOsuScore.TIME_IN_S_AGO:
          macroValue = roundNumber(scoreDateRangeMs / 1000, 0);
          break;
        case MacroOsuScore.TITLE:
          macroValue = score.beatmapset?.title;
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
    }
  );
};

export enum MacroOsuMostRecentPlay {
  ACC = "ACC",
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
  USER_ID = "USER_ID",
  USER_NAME = "USER_NAME",
}

export const macroOsuMostRecentPlay: MessageParserMacroDocumentation = {
  id: "OSU_MOST_RECENT_PLAY",
  keys: Object.values(MacroOsuMostRecentPlay),
};

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

export const macroOsuUser: MessageParserMacroDocumentation = {
  id: "OSU_USER",
  keys: Object.values(MacroOsuUser),
};
