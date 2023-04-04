// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";

export interface MacroOsuPpRpRequestData {
  id: number;
}
export enum MacroOsuPpRpRequest {
  ID = "ID",
}
export const macroOsuPpRpRequest = createMessageParserMacroGenerator<
  MacroOsuPpRpRequest,
  MacroOsuPpRpRequestData
>(
  {
    id: "OSU_PP_RP_REQUEST",
  },
  Object.values(MacroOsuPpRpRequest),
  (macroId, data) => {
    switch (macroId) {
      case MacroOsuPpRpRequest.ID:
        return data.id;
    }
  },
);
