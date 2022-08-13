// Local imports
import { roundNumber } from "../../other/round";
// Type imports
import type { MacroDictionaryEntry } from "../../messageParser";
import type { MessageParserMacroDocumentation } from "../macros";
import type { StreamCompanionData } from "../../osuStreamCompanion";

export enum MacroOsuStreamCompanionCurrentMap {
  AR = "AR",
  ARTIST_ROMAN = "ARTIST_ROMAN",
  BPM = "BPM",
  CS = "CS",
  DIFFICULTY_RATING = "DIFFICULTY_RATING",
  DIFF_NAME = "VERSION",
  HP = "HP",
  ID = "ID",
  MAX_COMBO = "MAX_COMBO",
  MODS = "MODS",
  OD = "OD",
  SET_ID = "SET_ID",
  TITLE_ROMAN = "TITLE_ROMAN",
}

export const macroOsuStreamCompanionCurrentMap: MessageParserMacroDocumentation =
  {
    id: "OSU_STREAMCOMPANION_CURRENT_MAP",
    keys: Object.values(MacroOsuStreamCompanionCurrentMap),
  };

export const pluginOsuStreamCompanionMacroLogic = (
  currentMap: StreamCompanionData
): MacroDictionaryEntry[] =>
  Object.values(MacroOsuStreamCompanionCurrentMap).map<
    [MacroOsuStreamCompanionCurrentMap, string]
  >((macroId) => {
    let macroValue;
    switch (macroId) {
      case MacroOsuStreamCompanionCurrentMap.ARTIST_ROMAN:
        macroValue = currentMap.artistRoman;
        break;
      case MacroOsuStreamCompanionCurrentMap.TITLE_ROMAN:
        macroValue = currentMap.titleRoman;
        break;
      case MacroOsuStreamCompanionCurrentMap.DIFF_NAME:
        macroValue = currentMap.diffName;
        break;
      case MacroOsuStreamCompanionCurrentMap.ID:
        macroValue = currentMap.mapid;
        break;
      case MacroOsuStreamCompanionCurrentMap.SET_ID:
        macroValue = currentMap.mapsetid;
        break;
      case MacroOsuStreamCompanionCurrentMap.CS:
        macroValue = currentMap.mCS;
        break;
      case MacroOsuStreamCompanionCurrentMap.AR:
        macroValue = currentMap.mAR;
        break;
      case MacroOsuStreamCompanionCurrentMap.OD:
        macroValue = currentMap.mOD;
        break;
      case MacroOsuStreamCompanionCurrentMap.HP:
        macroValue = currentMap.mHP;
        break;
      case MacroOsuStreamCompanionCurrentMap.BPM:
        macroValue = currentMap.mBpm;
        break;
      case MacroOsuStreamCompanionCurrentMap.DIFFICULTY_RATING:
        if (currentMap.mStars !== undefined) {
          macroValue = roundNumber(currentMap.mStars, 2);
        }
        break;
      case MacroOsuStreamCompanionCurrentMap.MAX_COMBO:
        macroValue = currentMap.maxCombo;
        break;
      case MacroOsuStreamCompanionCurrentMap.MODS:
        macroValue = currentMap.mods;
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
