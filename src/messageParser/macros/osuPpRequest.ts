import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuPpRequest {
  ID = "ID",
}
export const macroOsuPpRequest: MessageParserMacroDocumentation = {
  id: "OSU_PP_REQUEST",
  keys: Object.values(MacroOsuPpRequest),
};
