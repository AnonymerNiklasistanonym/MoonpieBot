import { MacroDictionaryEntry } from "src/messageParser";
import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuWindowTitle {
  ARTIST = "ARTIST",
  MAP_ID_VIA_API = "MAP_ID_VIA_API",
  TITLE = "TITLE",
  VERSION = "VERSION",
}
export const macroOsuWindowTitle: MessageParserMacroDocumentation = {
  id: "OSU_WINDOW_TITLE",
  keys: Object.values(MacroOsuWindowTitle),
};

export const macroOsuWindowTitleLogic = (
  artist: string,
  title: string,
  version: string,
  mapId: number | undefined
): MacroDictionaryEntry[] =>
  Object.values(MacroOsuWindowTitle).map<[MacroOsuWindowTitle, string]>(
    (macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuWindowTitle.ARTIST:
          macroValue = artist;
          break;
        case MacroOsuWindowTitle.MAP_ID_VIA_API:
          macroValue = mapId;
          break;
        case MacroOsuWindowTitle.TITLE:
          macroValue = title;
          break;
        case MacroOsuWindowTitle.VERSION:
          macroValue = version;
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
    }
  );
