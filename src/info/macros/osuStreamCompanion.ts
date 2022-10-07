// Local imports
import { roundNumber } from "../../other/round";
// Type imports
import type {
  StreamCompanionFileData,
  StreamCompanionWebSocketData,
} from "../../osuStreamCompanion";
import type { MessageParserMacroGenerator } from "../../messageParser/macros";

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
export interface MacroOsuStreamCompanionCurrentMapWebSocketData {
  currentMap: StreamCompanionWebSocketData;
}
export const macroOsuStreamCompanionCurrentMapWebSocket: MessageParserMacroGenerator<MacroOsuStreamCompanionCurrentMapWebSocketData> =
  {
    exampleData: {
      currentMap: {
        artistRoman: "UNDEAD CORPORATION",
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
        type: "websocket",
      },
    },
    generate: (data) =>
      Object.values(MacroOsuStreamCompanionCurrentMapWebSocket).map<
        [MacroOsuStreamCompanionCurrentMapWebSocket, string]
      >((macroId) => {
        //console.log(data);
        let macroValue;
        switch (macroId) {
          case MacroOsuStreamCompanionCurrentMapWebSocket.ARTIST_ROMAN:
            macroValue = data.currentMap.artistRoman;
            break;
          case MacroOsuStreamCompanionCurrentMapWebSocket.TITLE_ROMAN:
            macroValue = data.currentMap.titleRoman;
            break;
          case MacroOsuStreamCompanionCurrentMapWebSocket.DIFF_NAME:
            macroValue = data.currentMap.diffName;
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
            if (data.currentMap.mStars !== undefined) {
              macroValue = roundNumber(data.currentMap.mStars, 2);
            }
            break;
          case MacroOsuStreamCompanionCurrentMapWebSocket.MAX_COMBO:
            macroValue = data.currentMap.maxCombo;
            break;
          case MacroOsuStreamCompanionCurrentMapWebSocket.MODS:
            macroValue = data.currentMap.mods;
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
      }),
    id: "OSU_STREAMCOMPANION_CURRENT_MAP_WEB_SOCKET",
    keys: Object.values(MacroOsuStreamCompanionCurrentMapWebSocket),
  };

export enum MacroOsuStreamCompanionCurrentMapFile {
  CURRENT_MODS = "CURRENT_MODS",
  NP_ALL = "NP_ALL",
  NP_PLAYING_DETAILS = "NP_PLAYING_DETAILS",
  NP_PLAYING_DL = "NP_PLAYING_DL",
}
export interface MacroOsuStreamCompanionCurrentMapFileData {
  currentMap: StreamCompanionFileData;
}
export const macroOsuStreamCompanionCurrentMapFile: MessageParserMacroGenerator<MacroOsuStreamCompanionCurrentMapFileData> =
  {
    exampleData: {
      currentMap: {
        currentMods: "None",
        npAll: "UNDEAD CORPORATION - Sad Dream [Easy] CS:2,5 AR:4,5 OD:3 HP:3",
        npPlayingDetails: "",
        npPlayingDl: "http://osu.ppy.sh/b/2151824",
        type: "file",
      },
    },
    generate: (data) =>
      Object.values(MacroOsuStreamCompanionCurrentMapFile).map<
        [MacroOsuStreamCompanionCurrentMapFile, string]
      >((macroId) => {
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
        }
        if (typeof macroValue === "undefined") {
          macroValue = "undefined";
        }
        return [macroId, macroValue];
      }),
    id: "OSU_STREAMCOMPANION_CURRENT_MAP_FILE",
    keys: Object.values(MacroOsuStreamCompanionCurrentMapFile),
  };
