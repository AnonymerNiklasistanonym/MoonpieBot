// Type imports
import type { MessageParserMacroGenerator } from "../macros";

export enum MacroOsuScoreRequest {
  BEATMAP_ID = "BEATMAP_ID",
  USER_NAME = "USER_NAME",
}
export interface MacroOsuScoreRequestData {
  beatmapId?: number;
  userName: string;
}
export const macroOsuScoreRequest: MessageParserMacroGenerator<MacroOsuScoreRequestData> =
  {
    generate: (data) =>
      Object.values(MacroOsuScoreRequest).map<[MacroOsuScoreRequest, string]>(
        (macroId) => {
          let macroValue;
          switch (macroId) {
            case MacroOsuScoreRequest.BEATMAP_ID:
              macroValue = data.beatmapId;
              break;
            case MacroOsuScoreRequest.USER_NAME:
              macroValue = data.userName;
              break;
          }
          if (typeof macroValue === "number") {
            macroValue = `${macroValue}`;
          }
          if (typeof macroValue === "undefined") {
            macroValue = "undefined";
          }
          return [macroId, macroValue];
        }
      ),
    id: "OSU_SCORE_REQUEST",
    keys: Object.values(MacroOsuScoreRequest),
  };
