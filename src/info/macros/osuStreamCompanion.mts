// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";
import { roundNumber } from "../../other/round.mjs";
// Type imports
import type {
  StreamCompanionFileData,
  StreamCompanionWebSocketData,
} from "../../osuStreamCompanion.mjs";

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
export const macroOsuStreamCompanionCurrentMapWebSocket =
  createMessageParserMacroGenerator<
    MacroOsuStreamCompanionCurrentMapWebSocket,
    MacroOsuStreamCompanionCurrentMapWebSocketData
  >(
    {
      id: "OSU_STREAMCOMPANION_CURRENT_MAP_WEB_SOCKET",
    },
    Object.values(MacroOsuStreamCompanionCurrentMapWebSocket),
    (macroId, data) => {
      switch (macroId) {
        case MacroOsuStreamCompanionCurrentMapWebSocket.ARTIST_ROMAN:
          return data.currentMap.artistRoman;
        case MacroOsuStreamCompanionCurrentMapWebSocket.ARTIST_UNICODE:
          return data.currentMap.artistUnicode;
        case MacroOsuStreamCompanionCurrentMapWebSocket.TITLE_ROMAN:
          return data.currentMap.titleRoman;
        case MacroOsuStreamCompanionCurrentMapWebSocket.TITLE_UNICODE:
          return data.currentMap.titleUnicode;
        case MacroOsuStreamCompanionCurrentMapWebSocket.DIFF_NAME:
          return data.currentMap.diffName;
        case MacroOsuStreamCompanionCurrentMapWebSocket.CREATOR:
          return data.currentMap.creator;
        case MacroOsuStreamCompanionCurrentMapWebSocket.ID:
          return data.currentMap.mapid;
        case MacroOsuStreamCompanionCurrentMapWebSocket.SET_ID:
          return data.currentMap.mapsetid;
        case MacroOsuStreamCompanionCurrentMapWebSocket.CS:
          return data.currentMap.mCS;
        case MacroOsuStreamCompanionCurrentMapWebSocket.AR:
          return data.currentMap.mAR;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OD:
          return data.currentMap.mOD;
        case MacroOsuStreamCompanionCurrentMapWebSocket.HP:
          return data.currentMap.mHP;
        case MacroOsuStreamCompanionCurrentMapWebSocket.BPM:
          return data.currentMap.mBpm;
        case MacroOsuStreamCompanionCurrentMapWebSocket.DIFFICULTY_RATING:
          return data.currentMap.mStars;
        case MacroOsuStreamCompanionCurrentMapWebSocket.MAX_COMBO:
          return data.currentMap.maxCombo;
        case MacroOsuStreamCompanionCurrentMapWebSocket.MODS:
          return data.currentMap.mods;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_IS_RUNNING:
          return data.currentMap.osuIsRunning;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_95:
          return data.currentMap.osu_m95PP ?? undefined;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_96:
          return data.currentMap.osu_m96PP ?? undefined;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_97:
          return data.currentMap.osu_m97PP ?? undefined;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_98:
          return data.currentMap.osu_m98PP ?? undefined;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_99:
          return data.currentMap.osu_m99PP ?? undefined;
        case MacroOsuStreamCompanionCurrentMapWebSocket.OSU_PP_SS:
          return data.currentMap.osu_mSSPP ?? undefined;
      }
    },
    {
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
    {
      convertNumber: (num) => `${roundNumber(num, 2)}`,
    },
  );

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
export const macroOsuStreamCompanionCurrentMapFile =
  createMessageParserMacroGenerator<
    MacroOsuStreamCompanionCurrentMapFile,
    MacroOsuStreamCompanionCurrentMapFileData
  >(
    {
      id: "OSU_STREAMCOMPANION_CURRENT_MAP_FILE",
    },
    Object.values(MacroOsuStreamCompanionCurrentMapFile),
    (macroId, data) => {
      switch (macroId) {
        case MacroOsuStreamCompanionCurrentMapFile.NP_ALL:
          return data.currentMap.npAll;
        case MacroOsuStreamCompanionCurrentMapFile.NP_PLAYING_DETAILS:
          return data.currentMap.npPlayingDetails;
        case MacroOsuStreamCompanionCurrentMapFile.NP_PLAYING_DL:
          return data.currentMap.npPlayingDl;
        case MacroOsuStreamCompanionCurrentMapFile.CURRENT_MODS:
          return data.currentMap.currentMods;
        case MacroOsuStreamCompanionCurrentMapFile.CUSTOM:
          return data.currentMap.custom;
      }
    },
    {
      currentMap: {
        currentMods: "None",
        custom: "",
        npAll: "UNDEAD CORPORATION - Sad Dream [Easy] CS:2,5 AR:4,5 OD:3 HP:3",
        npPlayingDetails: "",
        npPlayingDl: "http://osu.ppy.sh/b/2151824",
        type: "file",
      },
    },
  );
