/* eslint-disable @typescript-eslint/restrict-template-expressions */

// Type imports
import type { MessageParserPlugin } from "../plugins";
import type { StreamCompanionConnection } from "../../streamcompanion";

export const pluginOsuStreamCompanionId = "OSU_STREAMCOMPANION";
export enum MacroOsuStreamCompanion {
  ARTIST_ROMAN = "ARTIST_ROMAN",
  TITLE_ROMAN = "TITLE_ROMAN",
  VERSION = "VERSION",
  ID = "ID",
  SET_ID = "SET_ID",
  CS = "CS",
  AR = "AR",
  OD = "OD",
  HP = "HP",
  BPM = "BPM",
  DIFFICULTY_RATING = "DIFFICULTY_RATING",
  MAX_COMBO = "MAX_COMBO",
  MODS = "MODS",
}

export const getPluginOsuStreamCompanion = (
  streamCompanionDataFunc: StreamCompanionConnection
): MessageParserPlugin => {
  return {
    id: pluginOsuStreamCompanionId,
    func: (_, __, signature) => {
      if (signature === true) {
        return {
          type: "signature",
          exportsMacro: true,
        };
      }
      const streamCompanionData = streamCompanionDataFunc();
      if (streamCompanionData === undefined) {
        return [];
      }
      return [
        [
          MacroOsuStreamCompanion.ARTIST_ROMAN,
          `${streamCompanionData.artistRoman}`,
        ],
        [
          MacroOsuStreamCompanion.TITLE_ROMAN,
          `${streamCompanionData.titleRoman}`,
        ],
        [MacroOsuStreamCompanion.VERSION, `${streamCompanionData.diffName}`],
        [MacroOsuStreamCompanion.ID, `${streamCompanionData.mapid}`],
        [MacroOsuStreamCompanion.SET_ID, `${streamCompanionData.mapsetid}`],
        [MacroOsuStreamCompanion.CS, `${streamCompanionData.mCS}`],
        [MacroOsuStreamCompanion.AR, `${streamCompanionData.mAR}`],
        [MacroOsuStreamCompanion.OD, `${streamCompanionData.mOD}`],
        [MacroOsuStreamCompanion.HP, `${streamCompanionData.mHP}`],
        [MacroOsuStreamCompanion.BPM, `${streamCompanionData.mBpm}`],
        [
          MacroOsuStreamCompanion.DIFFICULTY_RATING,
          `${
            streamCompanionData.mStars !== undefined
              ? Math.round(streamCompanionData.mStars * 100 + Number.EPSILON) /
                100
              : undefined
          }`,
        ],
        [MacroOsuStreamCompanion.MAX_COMBO, `${streamCompanionData.maxCombo}`],
        [MacroOsuStreamCompanion.MODS, `${streamCompanionData.mods}`],
      ];
    },
  };
};
