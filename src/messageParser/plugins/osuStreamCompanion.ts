// Local imports
import { roundNumber } from "../../other/round";
// Type imports
import type { MessageParserPluginGenerator } from "../plugins";
import type { StreamCompanionConnection } from "../../osuStreamCompanion";

export enum PluginOsuStreamCompanion {
  /** Get the current osu! Map data via StreamCompanion. */
  CURRENT_MAP = "OSU_STREAMCOMPANION_CURRENT_MAP",
}

export enum PluginMacroOsuStreamCompanionCurrentMap {
  ARTIST_ROMAN = "ARTIST_ROMAN",
  TITLE_ROMAN = "TITLE_ROMAN",
  DIFF_NAME = "VERSION",
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
    id: PluginOsuStreamCompanion.CURRENT_MAP,
    description: "Get the current osu! map data via StreamCompanion.",
    signature: {
      type: "signature",
      exportsMacro: true,
      exportedMacroKeys: Object.values(PluginMacroOsuStreamCompanionCurrentMap),
    },
    generate: (data) => () => {
      const currentMap = data.streamCompanionDataFunc();
      if (currentMap === undefined) {
        return [];
      }
      return Object.values(PluginMacroOsuStreamCompanionCurrentMap).map<
        [PluginMacroOsuStreamCompanionCurrentMap, string]
      >((macroId) => {
        let macroValue;
        switch (macroId) {
          case PluginMacroOsuStreamCompanionCurrentMap.ARTIST_ROMAN:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.artistRoman}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.TITLE_ROMAN:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.titleRoman}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.DIFF_NAME:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.diffName}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.ID:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.mapid}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.SET_ID:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.mapsetid}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.CS:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.mCS}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.AR:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.mAR}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.OD:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.mOD}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.HP:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.mHP}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.BPM:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.mBpm}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.DIFFICULTY_RATING:
            macroValue = `${
              currentMap.mStars !== undefined
                ? `${roundNumber(currentMap.mStars, 2)}`
                : "undefined"
            }`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.MAX_COMBO:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.maxCombo}`;
            break;
          case PluginMacroOsuStreamCompanionCurrentMap.MODS:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            macroValue = `${currentMap.mods}`;
            break;
        }
        return [macroId, macroValue];
      });
    },
  };
