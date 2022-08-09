import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuApi {
  DEFAULT_USER_ID = "DEFAULT_USER_ID",
}
export const macroOsuApi: MessageParserMacroDocumentation = {
  id: "OSU_API",
  keys: Object.values(MacroOsuApi),
};
