/* eslint-disable @typescript-eslint/restrict-template-expressions */

// Type imports
import type { MessageParserPluginGenerator } from "../plugins";
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

export interface PluginOsuStreamCompanionData {
  streamCompanionDataFunc: StreamCompanionConnection;
}

export const pluginOsuStreamCompanionGenerator: MessageParserPluginGenerator<PluginOsuStreamCompanionData> =
  {
    id: pluginOsuStreamCompanionId,
    description:
      "Available in all strings that are responses and will insert the name of the user that is responded to",
    signature: {
      type: "signature",
      exportsMacro: true,
      exportedMacroKeys: Object.values(MacroOsuStreamCompanion),
    },
    generate: (data) => () => {
      const streamCompanionData = data.streamCompanionDataFunc();
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
