// Relative imports
import {
  macroCustomCommandBroadcastInfoEdit,
  macroCustomCommandInfo,
} from "./macros/customCommands.mjs";
import {
  macroMoonpieClaim,
  macroMoonpieLeaderboard,
  macroMoonpieLeaderboardEntry,
  macroMoonpieUser,
  macroMoonpieUserSet,
} from "./macros/moonpie.mjs";
import {
  macroOsuApi,
  macroOsuBeatmap,
  macroOsuMostRecentPlay,
  macroOsuScore,
  macroOsuUser,
} from "./macros/osuApi.mjs";
import {
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequestDemands,
  macroOsuBeatmapRequests,
} from "./macros/osuBeatmapRequest.mjs";
import {
  macroOsuStreamCompanionCurrentMapFile,
  macroOsuStreamCompanionCurrentMapWebSocket,
} from "./macros/osuStreamCompanion.mjs";
import { checkMacrosForDuplicates } from "../messageParser.mjs";
import { macroCommandEnabled } from "./macros/commands.mjs";
import { macroCustomBroadcastInfo } from "./macros/customBroadcast.mjs";
import { macroMoonpieBot } from "./macros/moonpiebot.mjs";
import { macroOsuPpRpRequest } from "./macros/osuPpRpRequest.mjs";
import { macroOsuScoreRequest } from "./macros/osuScoreRequest.mjs";
import { macroOsuWindowTitle } from "./macros/osuWindowTitle.mjs";
import { macroPermissionError } from "./macros/general.mjs";
import { macroSpotifySong } from "./macros/spotify.mjs";
import { macroWelcomeBack } from "./macros/lurk.mjs";
// Type imports
import type {
  MessageParserMacro,
  MessageParserMacroDocumentation,
} from "../messageParser.mjs";
import type { DeepReadonlyArray } from "../other/types.mjs";

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
    macroWelcomeBack,
  );
