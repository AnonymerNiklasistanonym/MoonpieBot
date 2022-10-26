// Local imports
import { roundNumber } from "../../other/round";
// Type imports
import type {
  StreamCompanionFileData,
  StreamCompanionWebSocketData,
} from "../../osuStreamCompanion";
import type { MessageParserMacroGenerator } from "../../messageParser";

export interface MacroOsuStreamCompanionCurrentMapWebSocketData {
  currentMap: StreamCompanionWebSocketData;
}
export enum MacroOsuStreamCompanionCurrentMapWebSocket {
  AR = "AR",
  ARTIST_ROMAN = "ARTIST_ROMAN",
  ARTIST_UNICODE = "ARTIST_UNICODE",
  BPM = "BPM",
  CREATOR = "CREATOR",
  CS = "CS",
  DIFFICULTY_RATING = "DIFFICULTY_RATING",
  DIFF_NAME = "VERSION",
  HP = "HP",
  ID = "ID",
  MAX_COMBO = "MAX_COMBO",
  MODS = "MODS",
  OD = "OD",
  OSU_IS_RUNNING = "OSU_IS_RUNNING",
  OSU_PP_95 = "OSU_PP_95",
  OSU_PP_96 = "OSU_PP_96",
  OSU_PP_97 = "OSU_PP_97",
  OSU_PP_98 = "OSU_PP_98",
  OSU_PP_99 = "OSU_PP_99",
  OSU_PP_SS = "OSU_PP_SS",
  SET_ID = "SET_ID",
  TITLE_ROMAN = "TITLE_ROMAN",
  TITLE_UNICODE = "TITLE_UNICODE",
}
export const macroOsuStreamCompanionCurrentMapWebSocket: MessageParserMacroGenerator<
  MacroOsuStreamCompanionCurrentMapWebSocketData,
  MacroOsuStreamCompanionCurrentMapWebSocket
> = {
  exampleData: {
    currentMap: {
      artistRoman: "UNDEAD CORPORATION",
      artistUnicode: "UNDEAD CORPORATION",
      creator: "mom",
      diffName: "Easy",
      mAR: 4.5,
      mBpm: "193-215 (200)",
      mCS: 2.5,
      mHP: 3,
      mOD: 3,
      mStars: 2.068,
      mapid: 2151824,
      mapsetid: 1019827,
      maxCombo: 773,
      mods: "None",
      titleRoman: "Sad Dream",
      titleUnicode: "UNDEAD CORPORATION",
      type: "websocket",
    },
  },
  generate: (data) =>
    Object.values(MacroOsuStreamCompanionCurrentMapWebSocket).map((macroId) => {
      //console.log(data);
      let macroValue;
      switch (macroId) {
        case MacroOsuStreamCompanionCurrentMapWebSocket.ARTIST_ROMAN:
          macroValue = data.currentMap.artistRoman;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.ARTIST_UNICODE:
          macroValue = data.currentMap.artistUnicode;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.TITLE_ROMAN:
          macroValue = data.currentMap.titleRoman;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.TITLE_UNICODE:
          macroValue = data.currentMap.titleUnicode;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.DIFF_NAME:
          macroValue = data.currentMap.diffName;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.CREATOR:
          macroValue = data.currentMap.creator;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.ID:
          macroValue = data.currentMap.mapid;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.SET_ID:
          macroValue = data.currentMap.mapsetid;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.CS:
          macroValue = data.currentMap.mCS;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.AR:
          macroValue = data.currentMap.mAR;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OD:
          macroValue = data.currentMap.mOD;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.HP:
          macroValue = data.currentMap.mHP;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.BPM:
          macroValue = data.currentMap.mBpm;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.DIFFICULTY_RATING:
          macroValue = data.currentMap.mStars;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.MAX_COMBO:
          macroValue = data.currentMap.maxCombo;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.MODS:
          macroValue = data.currentMap.mods;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_IS_RUNNING:
          macroValue = data.currentMap.osuIsRunning;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_95:
          macroValue = data.currentMap.osu_m95PP;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_96:
          macroValue = data.currentMap.osu_m96PP;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_97:
          macroValue = data.currentMap.osu_m97PP;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_98:
          macroValue = data.currentMap.osu_m98PP;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_99:
          macroValue = data.currentMap.osu_m99PP;
          break;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_SS:
          macroValue = data.currentMap.osu_mSSPP;
          break;
      }
      if (macroValue === null) {
        macroValue = "null";
      }
      if (macroValue === undefined) {
        macroValue = "undefined";
      }
      if (typeof macroValue === "boolean") {
        macroValue = macroValue ? "true" : "false";
      }
      if (typeof macroValue === "number") {
        macroValue = `${roundNumber(macroValue, 2)}`;
      }
      return [macroId, macroValue];
    }),
  id: "OSU_STREAMCOMPANION_CURRENT_MAP_WEB_SOCKET",
  keys: Object.values(MacroOsuStreamCompanionCurrentMapWebSocket),
};

export interface MacroOsuStreamCompanionCurrentMapFileData {
  currentMap: StreamCompanionFileData;
}
export enum MacroOsuStreamCompanionCurrentMapFile {
  CURRENT_MODS = "CURRENT_MODS",
  CUSTOM = "CUSTOM",
  NP_ALL = "NP_ALL",
  NP_PLAYING_DETAILS = "NP_PLAYING_DETAILS",
  NP_PLAYING_DL = "NP_PLAYING_DL",
}
export const macroOsuStreamCompanionCurrentMapFile: MessageParserMacroGenerator<
  MacroOsuStreamCompanionCurrentMapFileData,
  MacroOsuStreamCompanionCurrentMapFile
> = {
  exampleData: {
    currentMap: {
      currentMods: "None",
      custom: "",
      npAll: "UNDEAD CORPORATION - Sad Dream [Easy] CS:2,5 AR:4,5 OD:3 HP:3",
      npPlayingDetails: "",
      npPlayingDl: "http://osu.ppy.sh/b/2151824",
      type: "file",
    },
  },
  generate: (data) =>
    Object.values(MacroOsuStreamCompanionCurrentMapFile).map((macroId) => {
      //console.log(data);
      let macroValue;
      switch (macroId) {
        case MacroOsuStreamCompanionCurrentMapFile.NP_ALL:
          macroValue = data.currentMap.npAll;
          break;
        case MacroOsuStreamCompanionCurrentMapFile.NP_PLAYING_DETAILS:
          macroValue = data.currentMap.npPlayingDetails;
          break;
        case MacroOsuStreamCompanionCurrentMapFile.NP_PLAYING_DL:
          macroValue = data.currentMap.npPlayingDl;
          break;
        case MacroOsuStreamCompanionCurrentMapFile.CURRENT_MODS:
          macroValue = data.currentMap.currentMods;
          break;
        case MacroOsuStreamCompanionCurrentMapFile.CUSTOM:
          macroValue = data.currentMap.custom;
          break;
      }
      if (typeof macroValue === "undefined") {
        macroValue = "undefined";
      }
      return [macroId, macroValue];
    }),
  id: "OSU_STREAMCOMPANION_CURRENT_MAP_FILE",
  keys: Object.values(MacroOsuStreamCompanionCurrentMapFile),
};
