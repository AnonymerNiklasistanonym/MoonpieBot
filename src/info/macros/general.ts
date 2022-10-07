// Type imports
import { convertTwitchBadgeLevelToString } from "../../other/twitchBadgeParser";
import type { MessageParserMacroGenerator } from "../../messageParser/macros";
// Type import
import type { TwitchBadgeLevel } from "../../other/twitchBadgeParser";

export interface MacroPermissionErrorData {
  expected: TwitchBadgeLevel;
  found: TwitchBadgeLevel;
}
export enum MacroPermissionError {
  EXPECTED = "EXPECTED",
  FOUND = "FOUND",
}

export const macroPermissionError: MessageParserMacroGenerator<MacroPermissionErrorData> =
  {
    generate: (data) =>
      Object.values(MacroPermissionError).map<[MacroPermissionError, string]>(
        (macroId) => {
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
        }
      ),
    id: "PERMISSION_ERROR",
    keys: Object.values(MacroPermissionError),
  };
