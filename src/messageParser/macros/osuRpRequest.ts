import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuRpRequest {
  ID = "ID",
}
export const macroOsuRpRequest: MessageParserMacroDocumentation = {
  id: "OSU_RP_REQUEST",
  keys: Object.values(MacroOsuRpRequest),
};
