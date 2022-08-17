// Type imports
import type { MessageParserMacroGenerator } from "../macros";

export enum MacroOsuBeatmapRequest {
  COMMENT = "COMMENT",
  ID = "ID",
}
export interface MacroOsuBeatmapRequestData {
  comment?: string;
  id: number;
}
export const macroOsuBeatmapRequest: MessageParserMacroGenerator<MacroOsuBeatmapRequestData> =
  {
    generate: (data) =>
      Object.values(MacroOsuBeatmapRequest).map<
        [MacroOsuBeatmapRequest, string]
      >((macroId) => {
        let macroValue;
        switch (macroId) {
          case MacroOsuBeatmapRequest.COMMENT:
            if (data.comment) {
              macroValue = data.comment;
            } else {
              macroValue = "";
            }
            break;
          case MacroOsuBeatmapRequest.ID:
            macroValue = data.id;
            break;
        }
        if (typeof macroValue === "number") {
          macroValue = `${macroValue}`;
        }
        return [macroId, macroValue];
      }),
    id: "OSU_BEATMAP_REQUEST",
    keys: Object.values(MacroOsuBeatmapRequest),
  };

export enum MacroOsuBeatmapRequests {
  CUSTOM_MESSAGE = "CUSTOM_MESSAGE",
}
export interface MacroOsuBeatmapRequestsData {
  customMessage?: string;
}
export const macroOsuBeatmapRequests: MessageParserMacroGenerator<MacroOsuBeatmapRequestsData> =
  {
    generate: (data) =>
      Object.values(MacroOsuBeatmapRequests).map<
        [MacroOsuBeatmapRequests, string]
      >((macroId) => {
        let macroValue;
        switch (macroId) {
          case MacroOsuBeatmapRequests.CUSTOM_MESSAGE:
            if (data.customMessage) {
              macroValue = data.customMessage;
            } else {
              macroValue = "";
            }
            break;
        }
        return [macroId, macroValue];
      }),
    id: "OSU_BEATMAP_REQUESTS",
    keys: Object.values(MacroOsuBeatmapRequests),
  };
