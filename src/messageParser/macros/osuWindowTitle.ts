// Type imports
import type { MessageParserMacroGenerator } from "../macros";

export enum MacroOsuWindowTitle {
  ARTIST = "ARTIST",
  MAP_ID_VIA_API = "MAP_ID_VIA_API",
  TITLE = "TITLE",
  VERSION = "VERSION",
}
interface MacroOsuWindowTitleData {
  artist: string;
  mapId?: number;
  title: string;
  version: string;
}
export const macroOsuWindowTitle: MessageParserMacroGenerator<MacroOsuWindowTitleData> =
  {
    generate: (data) =>
      Object.values(MacroOsuWindowTitle).map<[MacroOsuWindowTitle, string]>(
        (macroId) => {
          let macroValue;
          switch (macroId) {
            case MacroOsuWindowTitle.ARTIST:
              macroValue = data.artist;
              break;
            case MacroOsuWindowTitle.MAP_ID_VIA_API:
              macroValue = data.mapId;
              break;
            case MacroOsuWindowTitle.TITLE:
              macroValue = data.title;
              break;
            case MacroOsuWindowTitle.VERSION:
              macroValue = data.version;
              break;
          }
          if (typeof macroValue === "undefined") {
            macroValue = "undefined";
          }
          if (typeof macroValue === "number") {
            macroValue = `${macroValue}`;
          }
          return [macroId, macroValue];
        }
      ),
    id: "OSU_WINDOW_TITLE",
    keys: Object.values(MacroOsuWindowTitle),
  };
