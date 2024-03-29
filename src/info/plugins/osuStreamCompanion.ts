// Local imports
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
// Type imports
import {
  macroOsuStreamCompanionCurrentMapFile,
  macroOsuStreamCompanionCurrentMapWebSocket,
} from "../macros/osuStreamCompanion";
import type { MessageParserPluginGenerator } from "../../messageParser";
import type { StreamCompanionConnection } from "../../osuStreamCompanion";

export enum PluginOsuStreamCompanion {
  /** Get the current osu! Map data via StreamCompanion files. */
  CURRENT_MAP_FILE = "OSU_STREAMCOMPANION_CURRENT_MAP_FILE",
  /** Get the current osu! Map data via StreamCompanion websocket. */
  CURRENT_MAP_WEBSOCKET = "OSU_STREAMCOMPANION_CURRENT_MAP_WEBSOCKET",
}

export interface PluginOsuStreamCompanionData {
  streamCompanionDataFunc: StreamCompanionConnection;
}

export const pluginsOsuStreamCompanionGenerator: MessageParserPluginGenerator<PluginOsuStreamCompanionData>[] =
  [
    {
      description:
        "Get the current osu! map data via StreamCompanion (websocket interface).",
      generate: (data) => async () => {
        const currentMap = await data.streamCompanionDataFunc();
        if (currentMap === undefined) {
          return new Map();
        }
        if (currentMap.type !== "websocket") {
          throw Error(
            `No web socket connection was found (type='${currentMap.type}')`
          );
        }
        return generateMacroMapFromMacroGenerator(
          macroOsuStreamCompanionCurrentMapWebSocket,
          { currentMap }
        );
      },
      id: PluginOsuStreamCompanion.CURRENT_MAP_WEBSOCKET,
      signature: {
        exportedMacros: [macroOsuStreamCompanionCurrentMapWebSocket],
        type: "signature",
      },
    },
    {
      description:
        "Get the current osu! map data via StreamCompanion (file interface).",
      generate: (data) => async () => {
        const currentMap = await data.streamCompanionDataFunc();
        if (currentMap === undefined) {
          return new Map();
        }
        if (currentMap.type !== "file") {
          throw Error(
            `No file connection was found (type='${currentMap.type}')`
          );
        }
        return generateMacroMapFromMacroGenerator(
          macroOsuStreamCompanionCurrentMapFile,
          { currentMap }
        );
      },
      id: PluginOsuStreamCompanion.CURRENT_MAP_FILE,
      signature: {
        exportedMacros: [macroOsuStreamCompanionCurrentMapFile],
        type: "signature",
      },
    },
  ];
