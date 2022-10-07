// Type imports
import type { MessageParserMacroGenerator } from "../../messageParser";

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
            if (data.customMessage !== undefined) {
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

export enum MacroOsuBeatmapRequestDemands {
  AR_RANGE_MAX = "AR_RANGE_MAX",
  AR_RANGE_MIN = "AR_RANGE_MIN",
  CS_RANGE_MAX = "CS_RANGE_MAX",
  CS_RANGE_MIN = "CS_RANGE_MIN",
  HAS_DEMANDS = "HAS_DEMANDS",
  STAR_RANGE_MAX = "STAR_RANGE_MAX",
  STAR_RANGE_MIN = "STAR_RANGE_MIN",
}
export interface MacroOsuBeatmapRequestDemandsData {
  arRangeMax?: number | string;
  arRangeMin?: number | string;
  csRangeMax?: number | string;
  csRangeMin?: number | string;
  starRangeMax?: number | string;
  starRangeMin?: number | string;
}
export const macroOsuBeatmapRequestDemands: MessageParserMacroGenerator<MacroOsuBeatmapRequestDemandsData> =
  {
    generate: (data) =>
      Object.values(MacroOsuBeatmapRequestDemands).map<
        [MacroOsuBeatmapRequestDemands, string]
      >((macroId) => {
        let macroValue;
        switch (macroId) {
          case MacroOsuBeatmapRequestDemands.AR_RANGE_MAX:
            macroValue = data.arRangeMax;
            break;
          case MacroOsuBeatmapRequestDemands.AR_RANGE_MIN:
            macroValue = data.arRangeMin;
            break;
          case MacroOsuBeatmapRequestDemands.CS_RANGE_MAX:
            macroValue = data.csRangeMax;
            break;
          case MacroOsuBeatmapRequestDemands.CS_RANGE_MIN:
            macroValue = data.csRangeMin;
            break;
          case MacroOsuBeatmapRequestDemands.HAS_DEMANDS:
            macroValue =
              data.arRangeMax !== undefined ||
              data.arRangeMin !== undefined ||
              data.csRangeMax !== undefined ||
              data.csRangeMin !== undefined ||
              data.starRangeMax !== undefined ||
              data.starRangeMin !== undefined;
            break;
          case MacroOsuBeatmapRequestDemands.STAR_RANGE_MAX:
            macroValue = data.starRangeMax;
            break;
          case MacroOsuBeatmapRequestDemands.STAR_RANGE_MIN:
            macroValue = data.starRangeMin;
            break;
        }
        if (typeof macroValue === "undefined") {
          macroValue = "undefined";
        }
        if (typeof macroValue === "number") {
          macroValue = `${macroValue}`;
        }
        if (typeof macroValue === "boolean") {
          macroValue = macroValue ? "true" : "false";
        }
        return [macroId, macroValue];
      }),
    id: "OSU_BEATMAP_REQUEST_DEMANDS",
    keys: Object.values(MacroOsuBeatmapRequestDemands),
  };
