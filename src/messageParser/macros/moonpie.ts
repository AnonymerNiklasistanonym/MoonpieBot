export const macroMoonpieClaimId = "MOONPIE_CLAIM";
export enum MacroMoonpieClaim {
  TIME_SINCE_CLAIM_IN_S = "TIME_SINCE_CLAIM_IN_S",
  TIME_TILL_NEXT_CLAIM_IN_S = "TIME_TILL_NEXT_CLAIM_IN_S",
  COOLDOWN_HOURS = "COOLDOWN_HOURS",
}

export const macroMoonpieLeaderboardEntryId = "MOONPIE_LEADERBOARD_ENTRY";
export enum MacroMoonpieLeaderboardEntry {
  NAME = "NAME",
  COUNT = "COUNT",
  RANK = "RANK",
}

export const macroMoonpieUserGetId = "MOONPIE_USER_GET";
export enum MacroMoonpieUserGet {
  NAME = "NAME",
}

export const macroMoonpieUserSetId = "MOONPIE_USER_SET";
export enum MacroMoonpieUserSet {
  NAME = "NAME",
  SET_OPERATION = "SET_OPERATION",
  SET_COUNT = "SET_COUNT",
}

export const macroMoonpieUserDeleteId = "MOONPIE_USER_DELETE";
export enum MacroMoonpieUserDelete {
  NAME = "NAME",
}

export const macroMoonpieUserNeverClaimedId = "MOONPIE_USER_NEVER_CLAIMED";
export enum MacroMoonpieUserNeverClaimed {
  NAME = "NAME",
}
