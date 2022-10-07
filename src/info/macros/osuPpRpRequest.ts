// Type imports
import type { MessageParserMacroGenerator } from "../../messageParser/macros";

export enum MacroOsuPpRpRequest {
  ID = "ID",
}
export interface MacroOsuPpRpRequestData {
  id: number;
}
export const macroOsuPpRpRequest: MessageParserMacroGenerator<MacroOsuPpRpRequestData> =
  {
    generate: (data) =>
      Object.values(MacroOsuPpRpRequest).map<[MacroOsuPpRpRequest, string]>(
        (macroId) => {
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
        }
      ),
    id: "OSU_PP_RP_REQUEST",
    keys: Object.values(MacroOsuPpRpRequest),
  };
