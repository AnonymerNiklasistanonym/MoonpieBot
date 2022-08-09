import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuWindowTitle {
  TITLE = "TITLE",
  ARTIST = "ARTIST",
  VERSION = "VERSION",
  MAP_ID_VIA_API = "MAP_ID_VIA_API",
}
export const macroOsuWindowTitle: MessageParserMacroDocumentation = {
  id: "OSU_WINDOW_TITLE",
  keys: Object.values(MacroOsuWindowTitle),
};
