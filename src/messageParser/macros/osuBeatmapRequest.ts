import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroOsuBeatmapRequest {
  COMMENT = "COMMENT",
  ID = "ID",
}
export const macroOsuBeatmapRequest: MessageParserMacroDocumentation = {
  id: "OSU_BEATMAP_REQUEST",
  keys: Object.values(MacroOsuBeatmapRequest),
};

export enum MacroOsuBeatmapRequests {
  CUSTOM_MESSAGE = "CUSTOM_MESSAGE",
}
export const macroOsuBeatmapRequests: MessageParserMacroDocumentation = {
  id: "OSU_BEATMAP_REQUESTS",
  keys: Object.values(MacroOsuBeatmapRequests),
};
