// Local imports
import {
  macroMoonpieClaim,
  macroMoonpieLeaderboardEntry,
  macroMoonpieUserDelete,
  macroMoonpieUserGet,
  macroMoonpieUserNeverClaimed,
  macroMoonpieUserSet,
} from "./macros/moonpie";
import {
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequests,
} from "./macros/osuBeatmapRequest";
import { macroMoonpieBot } from "./macros/moonpiebot";
import { macroOsuApi } from "./macros/osuApi";
import { macroOsuPpRequest } from "./macros/osuPpRequest";
import { macroOsuRpRequest } from "./macros/osuRpRequest";
import { macroOsuScoreRequest } from "./macros/osuScoreRequest";
import { macroOsuWindowTitle } from "./macros/osuWindowTitle";
// Type imports
import type { MacroDictionary } from "../messageParser";

export interface MessageParserMacro {
  description?: string;
  id: string;
  values: MacroDictionary;
}

export interface MessageParserMacroDocumentation {
  description?: string;
  id: string;
  keys: string[];
}

/**
 * The default values for all macros.
 */
export const defaultMacros: MessageParserMacro[] = [macroMoonpieBot];

/**
 * The default values for all macros.
 */
export const defaultMacrosOptional: MessageParserMacroDocumentation[] = [
  macroMoonpieClaim,
  macroMoonpieLeaderboardEntry,
  macroMoonpieUserGet,
  macroMoonpieUserSet,
  macroMoonpieUserDelete,
  macroMoonpieUserNeverClaimed,
  macroOsuApi,
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequests,
  macroOsuRpRequest,
  macroOsuPpRequest,
  macroOsuScoreRequest,
  macroOsuWindowTitle,
];
