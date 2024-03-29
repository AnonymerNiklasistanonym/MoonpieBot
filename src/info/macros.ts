// Local imports
import {
  macroCustomCommandBroadcastInfoEdit,
  macroCustomCommandInfo,
} from "./macros/customCommands";
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
import { checkMacrosForDuplicates } from "../messageParser";
import { macroCommandEnabled } from "./macros/commands";
import { macroCustomBroadcastInfo } from "./macros/customBroadcast";
import { macroMoonpieBot } from "./macros/moonpiebot";
import { macroOsuPpRpRequest } from "./macros/osuPpRpRequest";
import { macroOsuScoreRequest } from "./macros/osuScoreRequest";
import { macroOsuWindowTitle } from "./macros/osuWindowTitle";
import { macroPermissionError } from "./macros/general";
import { macroSpotifySong } from "./macros/spotify";
import { macroWelcomeBack } from "./macros/lurk";
// Type imports
import type {
  MessageParserMacro,
  MessageParserMacroDocumentation,
} from "../messageParser";
import type { DeepReadonlyArray } from "../other/types";

/**
 * The default values for all macros.
 */
export const defaultMacros: DeepReadonlyArray<MessageParserMacro> =
  checkMacrosForDuplicates("default", macroMoonpieBot);

/**
 * The default values for all macros.
 */
export const defaultMacrosOptional: DeepReadonlyArray<MessageParserMacroDocumentation> =
  checkMacrosForDuplicates<MessageParserMacroDocumentation>(
    "default-optional",
    macroCustomBroadcastInfo,
    macroCustomCommandInfo,
    macroCustomCommandBroadcastInfoEdit,
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
    macroSpotifySong,
    macroWelcomeBack
  );
