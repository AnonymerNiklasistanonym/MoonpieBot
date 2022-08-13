// Type imports
import {
  MacroOsuStreamCompanionCurrentMap,
  macroOsuStreamCompanionCurrentMapLogic,
} from "../macros/osuStreamCompanion";
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
    generate: (data) => () => {
      const currentMap = data.streamCompanionDataFunc();
      if (currentMap === undefined) {
        return [];
      }
      return macroOsuStreamCompanionCurrentMapLogic(currentMap);
    },
    id: PluginOsuStreamCompanion.CURRENT_MAP,
    signature: {
      exportedMacroKeys: Object.values(MacroOsuStreamCompanionCurrentMap),
      exportsMacro: true,
      type: "signature",
    },
  };
