// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";

export interface MacroMoonpieClaimData {
  cooldownHours: number;
  timeSinceLastClaimInS: number;
  timeTillNextClaimInS: number;
}
export enum MacroMoonpieClaim {
  COOLDOWN_HOURS = "COOLDOWN_HOURS",
  TIME_SINCE_CLAIM_IN_S = "TIME_SINCE_CLAIM_IN_S",
  TIME_TILL_NEXT_CLAIM_IN_S = "TIME_TILL_NEXT_CLAIM_IN_S",
}

export const macroMoonpieClaim = createMessageParserMacroGenerator<
  MacroMoonpieClaim,
  MacroMoonpieClaimData
>(
  {
    description: "Variables for moonpie claims",
    id: "MOONPIE_CLAIM",
  },
  Object.values(MacroMoonpieClaim),
  (macroId, data) => {
    switch (macroId) {
      case MacroMoonpieClaim.COOLDOWN_HOURS:
        return data.cooldownHours;
      case MacroMoonpieClaim.TIME_SINCE_CLAIM_IN_S:
        return data.timeSinceLastClaimInS;
      case MacroMoonpieClaim.TIME_TILL_NEXT_CLAIM_IN_S:
        return data.timeTillNextClaimInS;
    }
  },
);

export interface MacroMoonpieLeaderboardEntryData {
  count: number;
  name: string;
  rank: number;
}
export enum MacroMoonpieLeaderboardEntry {
  COUNT = "COUNT",
  NAME = "NAME",
  RANK = "RANK",
}
export const macroMoonpieLeaderboardEntry = createMessageParserMacroGenerator<
  MacroMoonpieLeaderboardEntry,
  MacroMoonpieLeaderboardEntryData
>(
  {
    description: "Variables for moonpie claims or leaderboard entries",
    id: "MOONPIE_LEADERBOARD_ENTRY",
  },
  Object.values(MacroMoonpieLeaderboardEntry),
  (macroId, data) => {
    switch (macroId) {
      case MacroMoonpieLeaderboardEntry.COUNT:
        return data.count;
      case MacroMoonpieLeaderboardEntry.NAME:
        return data.name;
      case MacroMoonpieLeaderboardEntry.RANK:
        return data.rank;
    }
  },
);

export interface MacroMoonpieLeaderboardData {
  startingRank?: number;
}
export enum MacroMoonpieLeaderboard {
  STARTING_RANK = "STARTING_RANK",
}
export const macroMoonpieLeaderboard = createMessageParserMacroGenerator<
  MacroMoonpieLeaderboard,
  MacroMoonpieLeaderboardData
>(
  {
    description: "Variables for moonpie leaderboard lists are requested",
    id: "MOONPIE_LEADERBOARD",
  },
  Object.values(MacroMoonpieLeaderboard),
  (macroId, data) => {
    switch (macroId) {
      case MacroMoonpieLeaderboard.STARTING_RANK:
        if (data.startingRank === undefined) {
          throw Error("moonpie leaderboard starting rank is undefined");
        }
        return data.startingRank;
    }
  },
);

export interface MacroMoonpieUserSetData {
  setCount: number;
  setOperation: string;
}
export enum MacroMoonpieUserSet {
  SET_COUNT = "SET_COUNT",
  SET_OPERATION = "SET_OPERATION",
}
export const macroMoonpieUserSet = createMessageParserMacroGenerator<
  MacroMoonpieUserSet,
  MacroMoonpieUserSetData
>(
  {
    description: "Variables for when moonpies of a user are set",
    id: "MOONPIE_USER_SET",
  },
  Object.values(MacroMoonpieUserSet),
  (macroId, data) => {
    switch (macroId) {
      case MacroMoonpieUserSet.SET_COUNT:
        return data.setCount;
      case MacroMoonpieUserSet.SET_OPERATION:
        return data.setOperation;
    }
  },
);

export interface MacroMoonpieUserData {
  name: string;
}
export enum MacroMoonpieUser {
  NAME = "NAME",
}
export const macroMoonpieUser = createMessageParserMacroGenerator<
  MacroMoonpieUser,
  MacroMoonpieUserData
>(
  {
    description: "Variables for when moonpies of a user are requested",
    id: "MOONPIE_USER",
  },
  Object.values(MacroMoonpieUser),
  (macroId, data) => {
    switch (macroId) {
      case MacroMoonpieUser.NAME:
        return data.name;
    }
  },
);
