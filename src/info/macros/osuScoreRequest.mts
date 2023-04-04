// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";

export interface MacroOsuScoreRequestData {
  beatmapId?: number;
  userName: string;
}
export enum MacroOsuScoreRequest {
  BEATMAP_ID = "BEATMAP_ID",
  USER_NAME = "USER_NAME",
}
export const macroOsuScoreRequest = createMessageParserMacroGenerator<
  MacroOsuScoreRequest,
  MacroOsuScoreRequestData
>(
  {
    id: "OSU_SCORE_REQUEST",
  },
  Object.values(MacroOsuScoreRequest),
  (macroId, data) => {
    switch (macroId) {
      case MacroOsuScoreRequest.BEATMAP_ID:
        return data.beatmapId;
      case MacroOsuScoreRequest.USER_NAME:
        return data.userName;
    }
  },
);
