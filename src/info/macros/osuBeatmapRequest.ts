// Local imports
import { OsuRequestsConfig } from "../../database/osuRequestsDb/info";
// Type imports
import type { GetOsuRequestsConfigOut } from "../../database/osuRequestsDb/requests/osuRequestsConfig";
import type { MessageParserMacroGenerator } from "../../messageParser";

export interface MacroOsuBeatmapRequestData {
  comment?: string;
  id: number;
}
export enum MacroOsuBeatmapRequest {
  COMMENT = "COMMENT",
  ID = "ID",
}
export const macroOsuBeatmapRequest: MessageParserMacroGenerator<
  MacroOsuBeatmapRequestData,
  MacroOsuBeatmapRequest
> = {
  generate: (data) =>
    Object.values(MacroOsuBeatmapRequest).map((macroId) => {
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

export interface MacroOsuBeatmapRequestsData {
  customMessage?: string;
}
export enum MacroOsuBeatmapRequests {
  /** Empty string if there is no custom message. */
  CUSTOM_MESSAGE = "CUSTOM_MESSAGE",
}
export const macroOsuBeatmapRequests: MessageParserMacroGenerator<
  MacroOsuBeatmapRequestsData,
  MacroOsuBeatmapRequests
> = {
  generate: (data) =>
    Object.values(MacroOsuBeatmapRequests).map((macroId) => {
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
export interface MacroOsuBeatmapRequestDemandsData {
  osuRequestsConfigEntries: GetOsuRequestsConfigOut[];
}
export enum MacroOsuBeatmapRequestDemands {
  AR_RANGE_MAX = "AR_RANGE_MAX",
  AR_RANGE_MIN = "AR_RANGE_MIN",
  CS_RANGE_MAX = "CS_RANGE_MAX",
  CS_RANGE_MIN = "CS_RANGE_MIN",
  HAS_DEMANDS = "HAS_DEMANDS",
  LENGTH_IN_MIN_RANGE_MAX = "LENGTH_IN_MIN_RANGE_MAX",
  LENGTH_IN_MIN_RANGE_MIN = "LENGTH_IN_MIN_RANGE_MIN",
  REDEEM_ID = "REDEEM_ID",
  STAR_RANGE_MAX = "STAR_RANGE_MAX",
  STAR_RANGE_MIN = "STAR_RANGE_MIN",
}
const getConfigEntry = (
  osuRequestsConfigEntries: GetOsuRequestsConfigOut[],
  key: OsuRequestsConfig
) => osuRequestsConfigEntries.find((a) => a.option === key)?.optionValue;

export const macroOsuBeatmapRequestDemands: MessageParserMacroGenerator<
  MacroOsuBeatmapRequestDemandsData,
  MacroOsuBeatmapRequestDemands
> = {
  generate: (data) =>
    Object.values(MacroOsuBeatmapRequestDemands).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuBeatmapRequestDemands.AR_RANGE_MAX:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.AR_MAX
          );
          break;
        case MacroOsuBeatmapRequestDemands.AR_RANGE_MIN:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.AR_MIN
          );
          break;
        case MacroOsuBeatmapRequestDemands.CS_RANGE_MAX:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.CS_MAX
          );
          break;
        case MacroOsuBeatmapRequestDemands.CS_RANGE_MIN:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.CS_MIN
          );
          break;
        case MacroOsuBeatmapRequestDemands.HAS_DEMANDS:
          macroValue = [
            OsuRequestsConfig.AR_MAX,
            OsuRequestsConfig.AR_MIN,
            OsuRequestsConfig.CS_MAX,
            OsuRequestsConfig.CS_MIN,
            OsuRequestsConfig.LENGTH_IN_MIN_MAX,
            OsuRequestsConfig.LENGTH_IN_MIN_MIN,
            OsuRequestsConfig.REDEEM_ID,
            OsuRequestsConfig.STAR_MAX,
            OsuRequestsConfig.STAR_MIN,
          ]
            .map((a) => getConfigEntry(data.osuRequestsConfigEntries, a))
            .some((b) => b !== undefined);
          break;
        case MacroOsuBeatmapRequestDemands.LENGTH_IN_MIN_RANGE_MAX:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.LENGTH_IN_MIN_MAX
          );
          break;
        case MacroOsuBeatmapRequestDemands.LENGTH_IN_MIN_RANGE_MIN:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.LENGTH_IN_MIN_MIN
          );
          break;
        case MacroOsuBeatmapRequestDemands.REDEEM_ID:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.REDEEM_ID
          );
          break;
        case MacroOsuBeatmapRequestDemands.STAR_RANGE_MAX:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.STAR_MAX
          );
          break;
        case MacroOsuBeatmapRequestDemands.STAR_RANGE_MIN:
          macroValue = getConfigEntry(
            data.osuRequestsConfigEntries,
            OsuRequestsConfig.STAR_MIN
          );
          break;
      }
      if (macroValue === undefined) {
        macroValue = "undefined";
      }
      if (typeof macroValue === "boolean") {
        macroValue = macroValue ? "true" : "false";
      }
      return [macroId, macroValue];
    }),
  id: "OSU_BEATMAP_REQUEST_DEMANDS",
  keys: Object.values(MacroOsuBeatmapRequestDemands),
};
