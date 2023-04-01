// Type imports
import type { MessageParserMacroGenerator } from "../../messageParser.mjs";

export interface MacroOsuScoreRequestData {
  beatmapId?: number;
  userName: string;
}
export enum MacroOsuScoreRequest {
  BEATMAP_ID = "BEATMAP_ID",
  USER_NAME = "USER_NAME",
}
export const macroOsuScoreRequest: MessageParserMacroGenerator<
  MacroOsuScoreRequestData,
  MacroOsuScoreRequest
> = {
  generate: (data) =>
    Object.values(MacroOsuScoreRequest).map((macroId) => {
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
    }),
  id: "OSU_SCORE_REQUEST",
  keys: Object.values(MacroOsuScoreRequest),
};
