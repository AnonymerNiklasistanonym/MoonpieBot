import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuScoreRequest {
  BEATMAP_ID = "BEATMAP_ID",
  USER_NAME = "USER_NAME",
}
export const macroOsuScoreRequest: MessageParserMacroDocumentation = {
  id: "OSU_SCORE_REQUEST",
  keys: Object.values(MacroOsuScoreRequest),
};
