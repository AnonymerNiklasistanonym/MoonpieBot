// Local imports
import {
  macroMoonpieClaim,
  macroMoonpieLeaderboard,
  macroMoonpieLeaderboardEntry,
  macroMoonpieUser,
  macroMoonpieUserSet,
} from "./macros/moonpie";
import {
  macroOsuApi,
  macroOsuBeatmap,
  macroOsuMostRecentPlay,
  macroOsuScore,
  macroOsuUser,
} from "./macros/osuApi";
import {
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequests,
} from "./macros/osuBeatmapRequest";
import {
  macroOsuStreamCompanionCurrentMapFile,
  macroOsuStreamCompanionCurrentMapWebSocket,
} from "./macros/osuStreamCompanion";
import { macroMoonpieBot } from "./macros/moonpiebot";
import { macroOsuPpRequest } from "./macros/osuPpRequest";
import { macroOsuRpRequest } from "./macros/osuRpRequest";
import { macroOsuScoreRequest } from "./macros/osuScoreRequest";
import { macroOsuWindowTitle } from "./macros/osuWindowTitle";
import { macroSpotifySong } from "./macros/spotify";
// Type imports
import type { MacroDictionary, MacroDictionaryEntry } from "../messageParser";
import type { EMPTY_OBJECT } from "../info/other";

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
export interface MessageParserMacroGenerator<
  GENERATE_DATA extends object = EMPTY_OBJECT
> extends MessageParserMacroDocumentation {
  /** Method to generate the macro entries. */
  generate: (data: GENERATE_DATA) => MacroDictionaryEntry[];
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
  macroMoonpieLeaderboard,
  macroMoonpieLeaderboardEntry,
  macroMoonpieUser,
  macroMoonpieUserSet,
  macroOsuApi,
  macroOsuBeatmap,
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequests,
  macroOsuMostRecentPlay,
  macroOsuPpRequest,
  macroOsuRpRequest,
  macroOsuScore,
  macroOsuScoreRequest,
  macroOsuStreamCompanionCurrentMapFile,
  macroOsuStreamCompanionCurrentMapWebSocket,
  macroOsuUser,
  macroOsuWindowTitle,
  macroSpotifySong,
];
