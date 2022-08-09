import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuScoreRequest {
  USER_NAME = "USER_NAME",
  BEATMAP_ID = "BEATMAP_ID",
}
export const macroOsuScoreRequest: MessageParserMacroDocumentation = {
  id: "OSU_SCORE_REQUEST",
  keys: Object.values(MacroOsuScoreRequest),
};
