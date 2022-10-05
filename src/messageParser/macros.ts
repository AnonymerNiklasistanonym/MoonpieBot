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
  macroOsuBeatmapRequestDemands,
  macroOsuBeatmapRequests,
} from "./macros/osuBeatmapRequest";
import {
  macroOsuStreamCompanionCurrentMapFile,
  macroOsuStreamCompanionCurrentMapWebSocket,
} from "./macros/osuStreamCompanion";
import { checkMacrosForDuplicates } from "./macrosHelper";
import { macroCommandEnabled } from "./macros/commands";
import { macroMoonpieBot } from "./macros/moonpiebot";
import { macroOsuPpRpRequest } from "./macros/osuPpRpRequest";
import { macroOsuScoreRequest } from "./macros/osuScoreRequest";
import { macroOsuWindowTitle } from "./macros/osuWindowTitle";
import { macroPermissionError } from "./macros/general";
import { macroSpotifySong } from "./macros/spotify";
// Type imports
import type { EMPTY_OBJECT } from "../info/other";

// A macro is a simple text replace dictionary
export type MacroDictionaryEntry<KEY = string> = [KEY, string];
export type MacroDictionary = Map<string, string>;
export type MacroMap = Map<string, MacroDictionary>;

// TODO Move to a better position
export interface RequestHelp {
  macros?: boolean;
  plugins?: boolean;
  type: "help";
}
// TODO Move to a better position
export interface ExportedMacroInformation {
  id: string;
  keys: string[];
}

export interface MessageParserMacroInfo {
  description?: string;
  id: string;
}

export interface MessageParserMacro extends MessageParserMacroInfo {
  values: MacroDictionary;
}

export interface MessageParserMacroDocumentation
  extends MessageParserMacroInfo {
  keys: string[];
}
export interface MessageParserMacroGenerator<
  GENERATE_DATA extends object = EMPTY_OBJECT
> extends MessageParserMacroDocumentation {
  /** Example data. */
  exampleData?: GENERATE_DATA;
  /** Method to generate the macro entries. */
  generate: (data: GENERATE_DATA) => MacroDictionaryEntry[];
}

/**
 * The default values for all macros.
 */
export const defaultMacros: MessageParserMacro[] = checkMacrosForDuplicates(
  "default",
  macroMoonpieBot
);

/**
 * The default values for all macros.
 */
export const defaultMacrosOptional: MessageParserMacroDocumentation[] =
  checkMacrosForDuplicates<MessageParserMacroDocumentation>(
    "default-optional",
    macroMoonpieClaim,
    macroCommandEnabled,
    macroMoonpieLeaderboard,
    macroMoonpieLeaderboardEntry,
    macroMoonpieUser,
    macroMoonpieUserSet,
    macroOsuApi,
    macroOsuBeatmap,
    macroOsuBeatmapRequest,
    macroOsuBeatmapRequestDemands,
    macroOsuBeatmapRequests,
    macroOsuMostRecentPlay,
    macroOsuPpRpRequest,
    macroOsuScore,
    macroOsuScoreRequest,
    macroOsuStreamCompanionCurrentMapFile,
    macroOsuStreamCompanionCurrentMapWebSocket,
    macroOsuUser,
    macroOsuWindowTitle,
    macroPermissionError,
    macroSpotifySong
  );

export const generateMacroMap = (macros: MessageParserMacro[]): MacroMap => {
  const macrosMap: MacroMap = new Map();
  for (const macro of macros) {
    macrosMap.set(macro.id, macro.values);
  }
  return macrosMap;
};
