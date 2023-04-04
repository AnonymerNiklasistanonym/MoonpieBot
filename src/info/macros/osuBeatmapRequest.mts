// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";
import { OsuRequestsConfig } from "../databases/osuRequestsDb.mjs";
// Type imports
import type { GetOsuRequestsConfigOut } from "../../database/osuRequestsDb/requests/osuRequestsConfig.mjs";

export interface MacroOsuBeatmapRequestData {
  comment?: string;
  id: number;
  requester: string;
}
export enum MacroOsuBeatmapRequest {
  COMMENT = "COMMENT",
  ID = "ID",
  REQUESTER = "REQUESTER",
}
export const macroOsuBeatmapRequest = createMessageParserMacroGenerator<
  MacroOsuBeatmapRequest,
  MacroOsuBeatmapRequestData
>(
  {
    id: "OSU_BEATMAP_REQUEST",
  },
  Object.values(MacroOsuBeatmapRequest),
  (macroId, data) => {
    switch (macroId) {
      case MacroOsuBeatmapRequest.COMMENT:
        return data.comment ?? "";
      case MacroOsuBeatmapRequest.ID:
        return data.id;
      case MacroOsuBeatmapRequest.REQUESTER:
        return data.requester;
    }
  },
);

export interface MacroOsuBeatmapRequestsData {
  customMessage?: string;
}
export enum MacroOsuBeatmapRequests {
  CUSTOM_MESSAGE_OR_EMPTY = "CUSTOM_MESSAGE_OR_EMPTY",
}
export const macroOsuBeatmapRequests = createMessageParserMacroGenerator<
  MacroOsuBeatmapRequests,
  MacroOsuBeatmapRequestsData
>(
  {
    id: "OSU_BEATMAP_REQUESTS",
  },
  Object.values(MacroOsuBeatmapRequests),
  (macroId, data) => {
    switch (macroId) {
      case MacroOsuBeatmapRequests.CUSTOM_MESSAGE_OR_EMPTY:
        return data.customMessage ?? "";
    }
  },
);
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
  key: OsuRequestsConfig,
) => osuRequestsConfigEntries.find((a) => a.option === key)?.optionValue;

export const macroOsuBeatmapRequestDemands = createMessageParserMacroGenerator<
  MacroOsuBeatmapRequestDemands,
  MacroOsuBeatmapRequestDemandsData
>(
  {
    id: "OSU_BEATMAP_REQUEST_DEMANDS",
  },
  Object.values(MacroOsuBeatmapRequestDemands),
  (macroId, data) => {
    switch (macroId) {
      case MacroOsuBeatmapRequestDemands.AR_RANGE_MAX:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.AR_MAX,
        );
      case MacroOsuBeatmapRequestDemands.AR_RANGE_MIN:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.AR_MIN,
        );
      case MacroOsuBeatmapRequestDemands.CS_RANGE_MAX:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.CS_MAX,
        );
      case MacroOsuBeatmapRequestDemands.CS_RANGE_MIN:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.CS_MIN,
        );
      case MacroOsuBeatmapRequestDemands.HAS_DEMANDS:
        return [
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
      case MacroOsuBeatmapRequestDemands.LENGTH_IN_MIN_RANGE_MAX:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.LENGTH_IN_MIN_MAX,
        );
      case MacroOsuBeatmapRequestDemands.LENGTH_IN_MIN_RANGE_MIN:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.LENGTH_IN_MIN_MIN,
        );
      case MacroOsuBeatmapRequestDemands.REDEEM_ID:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.REDEEM_ID,
        );
      case MacroOsuBeatmapRequestDemands.STAR_RANGE_MAX:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.STAR_MAX,
        );
      case MacroOsuBeatmapRequestDemands.STAR_RANGE_MIN:
        return getConfigEntry(
          data.osuRequestsConfigEntries,
          OsuRequestsConfig.STAR_MIN,
        );
    }
  },
);
