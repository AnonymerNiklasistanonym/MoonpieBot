// Relative imports
import { convertTwitchBadgeLevelToString } from "../../twitch.mjs";
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";
// Type imports
import type { TwitchBadgeLevel } from "../../twitch.mjs";

export interface MacroPermissionErrorData {
  expected: TwitchBadgeLevel;
  found: TwitchBadgeLevel;
}
export enum MacroPermissionError {
  EXPECTED = "EXPECTED",
  FOUND = "FOUND",
}

export const macroPermissionError = createMessageParserMacroGenerator<
  MacroPermissionError,
  MacroPermissionErrorData
>(
  {
    id: "PERMISSION_ERROR",
  },
  Object.values(MacroPermissionError),
  (macroId, data) => {
    switch (macroId) {
      case MacroPermissionError.EXPECTED:
        return convertTwitchBadgeLevelToString(data.expected);
      case MacroPermissionError.FOUND:
        return convertTwitchBadgeLevelToString(data.found);
    }
  },
);
