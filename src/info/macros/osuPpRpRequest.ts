// Type imports
import type { MessageParserMacroGenerator } from "../../messageParser";

export interface MacroOsuPpRpRequestData {
  id: number;
}
export enum MacroOsuPpRpRequest {
  ID = "ID",
}
export const macroOsuPpRpRequest: MessageParserMacroGenerator<
  MacroOsuPpRpRequestData,
  MacroOsuPpRpRequest
> = {
  generate: (data) =>
    Object.values(MacroOsuPpRpRequest).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuPpRpRequest.ID:
          macroValue = data.id;
          break;
      }
      if (typeof macroValue === "number") {
        macroValue = `${macroValue}`;
      }
      return [macroId, macroValue];
    }),
  id: "OSU_PP_RP_REQUEST",
  keys: Object.values(MacroOsuPpRpRequest),
};
