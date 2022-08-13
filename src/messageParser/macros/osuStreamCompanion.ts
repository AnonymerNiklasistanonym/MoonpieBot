// Local imports
import { roundNumber } from "../../other/round";
// Type imports
import type {
  StreamCompanionFileData,
  StreamCompanionWebSocketData,
} from "../../osuStreamCompanion";
import type { MacroDictionaryEntry } from "../../messageParser";
import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuStreamCompanionCurrentMapWebSocket {
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

export const macroOsuStreamCompanionCurrentMapWebSocket: MessageParserMacroDocumentation =
  {
    id: "OSU_STREAMCOMPANION_CURRENT_MAP",
    keys: Object.values(MacroOsuStreamCompanionCurrentMapWebSocket),
  };

export const macroOsuStreamCompanionCurrentMapWebSocketLogic = (
  currentMap: StreamCompanionWebSocketData
): MacroDictionaryEntry[] =>
  Object.values(MacroOsuStreamCompanionCurrentMapWebSocket).map<
    [MacroOsuStreamCompanionCurrentMapWebSocket, string]
  >((macroId) => {
    let macroValue;
    switch (macroId) {
      case MacroOsuStreamCompanionCurrentMapWebSocket.ARTIST_ROMAN:
        macroValue = currentMap.artistRoman;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.TITLE_ROMAN:
        macroValue = currentMap.titleRoman;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.DIFF_NAME:
        macroValue = currentMap.diffName;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.ID:
        macroValue = currentMap.mapid;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.SET_ID:
        macroValue = currentMap.mapsetid;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.CS:
        macroValue = currentMap.mCS;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.AR:
        macroValue = currentMap.mAR;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.OD:
        macroValue = currentMap.mOD;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.HP:
        macroValue = currentMap.mHP;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.BPM:
        macroValue = currentMap.mBpm;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.DIFFICULTY_RATING:
        if (currentMap.mStars !== undefined) {
          macroValue = roundNumber(currentMap.mStars, 2);
        }
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.MAX_COMBO:
        macroValue = currentMap.maxCombo;
        break;
      case MacroOsuStreamCompanionCurrentMapWebSocket.MODS:
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

export enum MacroOsuStreamCompanionCurrentMapFile {
  NP_ALL = "NP_ALL",
  NP_DETAIL = "NP_DETAIL",
  NP_DOWNLOAD = "NP_DOWNLOAD",
}

export const macroOsuStreamCompanionCurrentMapFile: MessageParserMacroDocumentation =
  {
    id: "OSU_STREAMCOMPANION_CURRENT_MAP_FILE",
    keys: Object.values(MacroOsuStreamCompanionCurrentMapFile),
  };

export const macroOsuStreamCompanionCurrentMapFileLogic = (
  currentMap: StreamCompanionFileData
): MacroDictionaryEntry[] =>
  Object.values(MacroOsuStreamCompanionCurrentMapFile).map<
    [MacroOsuStreamCompanionCurrentMapFile, string]
  >((macroId) => {
    let macroValue;
    switch (macroId) {
      case MacroOsuStreamCompanionCurrentMapFile.NP_ALL:
        macroValue = currentMap.npAll;
        break;
      case MacroOsuStreamCompanionCurrentMapFile.NP_DETAIL:
        macroValue = currentMap.npDetail;
        break;
      case MacroOsuStreamCompanionCurrentMapFile.NP_DOWNLOAD:
        macroValue = currentMap.npDownload;
        break;
    }
    if (typeof macroValue === "undefined") {
      macroValue = "undefined";
    }
    return [macroId, macroValue];
  });
