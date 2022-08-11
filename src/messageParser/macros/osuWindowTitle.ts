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
