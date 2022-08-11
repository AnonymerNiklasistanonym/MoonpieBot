import type { MessageParserMacroDocumentation } from "../macros";

export enum MacroMoonpieClaim {
  COOLDOWN_HOURS = "COOLDOWN_HOURS",
  TIME_SINCE_CLAIM_IN_S = "TIME_SINCE_CLAIM_IN_S",
  TIME_TILL_NEXT_CLAIM_IN_S = "TIME_TILL_NEXT_CLAIM_IN_S",
}
export const macroMoonpieClaim: MessageParserMacroDocumentation = {
  description: "Available in strings from successful moonpie claims",
  id: "MOONPIE_CLAIM",
  keys: Object.values(MacroMoonpieClaim),
};

export enum MacroMoonpieLeaderboardEntry {
  COUNT = "COUNT",
  NAME = "NAME",
  RANK = "RANK",
}
export const macroMoonpieLeaderboardEntry: MessageParserMacroDocumentation = {
  description:
    "Available in strings from successful moonpie claims or leaderboard entries",
  id: "MOONPIE_LEADERBOARD_ENTRY",
  keys: Object.values(MacroMoonpieLeaderboardEntry),
};

export enum MacroMoonpieUserGet {
  NAME = "NAME",
}
export const macroMoonpieUserGet: MessageParserMacroDocumentation = {
  id: "MOONPIE_USER_GET",
  keys: Object.values(MacroMoonpieUserGet),
};

export enum MacroMoonpieUserSet {
  NAME = "NAME",
  SET_COUNT = "SET_COUNT",
  SET_OPERATION = "SET_OPERATION",
}
export const macroMoonpieUserSet: MessageParserMacroDocumentation = {
  id: "MOONPIE_USER_SET",
  keys: Object.values(MacroMoonpieUserSet),
};

export enum MacroMoonpieUserDelete {
  NAME = "NAME",
}
export const macroMoonpieUserDelete: MessageParserMacroDocumentation = {
  id: "MOONPIE_USER_DELETE",
  keys: Object.values(MacroMoonpieUserSet),
};

export enum MacroMoonpieUserNeverClaimed {
  NAME = "NAME",
}
export const macroMoonpieUserNeverClaimed: MessageParserMacroDocumentation = {
  id: "MOONPIE_USER_NEVER_CLAIMED",
  keys: Object.values(MacroMoonpieUserSet),
};
