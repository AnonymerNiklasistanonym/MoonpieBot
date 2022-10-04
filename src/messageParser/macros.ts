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
import { macroCommandEnabled } from "./macros/commands";
import { macroMoonpieBot } from "./macros/moonpiebot";
import { macroOsuPpRpRequest } from "./macros/osuPpRpRequest";
import { macroOsuScoreRequest } from "./macros/osuScoreRequest";
import { macroOsuWindowTitle } from "./macros/osuWindowTitle";
import { macroSpotifySong } from "./macros/spotify";
// Type imports
import type { EMPTY_OBJECT } from "../info/other";
import { macroPermissionError } from "./macros/general";

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

const checkMacrosForDuplicates = <MACRO_TYPE extends MessageParserMacroInfo>(
  name: string,
  ...macros: MACRO_TYPE[]
): MACRO_TYPE[] => {
  // Check for duplicated IDs
  macros.forEach((value, index, array) => {
    if (array.findIndex((a) => a.id === value.id) !== index) {
      throw Error(
        `The macro list ${name} contained the ID "${value.id}" twice`
      );
    }
  });
  return macros;
};

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
