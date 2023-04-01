// Relative imports
import { convertTwitchBadgeLevelToString } from "../../twitch.mjs";
// Type import
import type { MessageParserMacroGenerator } from "../../messageParser.mjs";
import type { TwitchBadgeLevel } from "../../twitch.mjs";

export interface MacroPermissionErrorData {
  expected: TwitchBadgeLevel;
  found: TwitchBadgeLevel;
}
export enum MacroPermissionError {
  EXPECTED = "EXPECTED",
  FOUND = "FOUND",
}

export const macroPermissionError: MessageParserMacroGenerator<
  MacroPermissionErrorData,
  MacroPermissionError
> = {
  generate: (data) =>
    Object.values(MacroPermissionError).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroPermissionError.EXPECTED:
          macroValue = convertTwitchBadgeLevelToString(data.expected);
          break;
        case MacroPermissionError.FOUND:
          macroValue = convertTwitchBadgeLevelToString(data.found);
          break;
      }
      return [macroId, macroValue];
    }),
  id: "PERMISSION_ERROR",
  keys: Object.values(MacroPermissionError),
};
