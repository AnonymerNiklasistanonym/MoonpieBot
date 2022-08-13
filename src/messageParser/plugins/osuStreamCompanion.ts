// Type imports
import {
  macroOsuStreamCompanionCurrentMap,
  macroOsuStreamCompanionCurrentMapLogic,
} from "../macros/osuStreamCompanion";
import type { Macros } from "../../messageParser";
import type { MessageParserPluginGenerator } from "../plugins";
import type { StreamCompanionConnection } from "../../osuStreamCompanion";

export enum PluginOsuStreamCompanion {
  /** Get the current osu! Map data via StreamCompanion. */
  CURRENT_MAP = "OSU_STREAMCOMPANION_CURRENT_MAP",
}

export interface PluginOsuStreamCompanionData {
  streamCompanionDataFunc: StreamCompanionConnection;
}

export const pluginOsuStreamCompanionGenerator: MessageParserPluginGenerator<PluginOsuStreamCompanionData> =
  {
    description: "Get the current osu! map data via StreamCompanion.",
    generate: (data) => (): Macros => {
      const currentMap = data.streamCompanionDataFunc();
      if (currentMap === undefined) {
        return new Map();
      }
      return new Map([
        [
          macroOsuStreamCompanionCurrentMap.id,
          new Map(macroOsuStreamCompanionCurrentMapLogic(currentMap)),
        ],
      ]);
    },
    id: PluginOsuStreamCompanion.CURRENT_MAP,
    signature: {
      exportedMacros: [macroOsuStreamCompanionCurrentMap],
      type: "signature",
    },
  };
