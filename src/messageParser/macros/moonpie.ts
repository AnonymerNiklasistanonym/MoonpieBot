// Type imports
import type { MessageParserMacroGenerator } from "../macros";

export enum MacroMoonpieClaim {
  COOLDOWN_HOURS = "COOLDOWN_HOURS",
  TIME_SINCE_CLAIM_IN_S = "TIME_SINCE_CLAIM_IN_S",
  TIME_TILL_NEXT_CLAIM_IN_S = "TIME_TILL_NEXT_CLAIM_IN_S",
}
export interface MacroMoonpieClaimData {
  cooldownHours: number;
  timeSinceLastClaimInS: number;
  timeTillNextClaimInS: number;
}
export const macroMoonpieClaim: MessageParserMacroGenerator<MacroMoonpieClaimData> =
  {
    description: "Available in strings from successful moonpie claims",
    generate: (data) =>
      Object.values(MacroMoonpieClaim).map<[MacroMoonpieClaim, string]>(
        (macroId) => {
          let macroValue;
          switch (macroId) {
            case MacroMoonpieClaim.COOLDOWN_HOURS:
              macroValue = data.cooldownHours;
              break;
            case MacroMoonpieClaim.TIME_SINCE_CLAIM_IN_S:
              macroValue = data.timeSinceLastClaimInS;
              break;
            case MacroMoonpieClaim.TIME_TILL_NEXT_CLAIM_IN_S:
              macroValue = data.timeTillNextClaimInS;
              break;
          }
          if (typeof macroValue === "number") {
            macroValue = `${macroValue}`;
          }
          return [macroId, macroValue];
        }
      ),
    id: "MOONPIE_CLAIM",
    keys: Object.values(MacroMoonpieClaim),
  };

export enum MacroMoonpieLeaderboardEntry {
  COUNT = "COUNT",
  NAME = "NAME",
  RANK = "RANK",
}
export interface MacroMoonpieLeaderboardEntryData {
  count: number;
  name: string;
  rank: number;
}
export const macroMoonpieLeaderboardEntry: MessageParserMacroGenerator<MacroMoonpieLeaderboardEntryData> =
  {
    description:
      "Available in strings from successful moonpie claims or leaderboard entries",
    generate: (data) =>
      Object.values(MacroMoonpieLeaderboardEntry).map<
        [MacroMoonpieLeaderboardEntry, string]
      >((macroId) => {
        let macroValue;
        switch (macroId) {
          case MacroMoonpieLeaderboardEntry.COUNT:
            macroValue = data.count;
            break;
          case MacroMoonpieLeaderboardEntry.NAME:
            macroValue = data.name;
            break;
          case MacroMoonpieLeaderboardEntry.RANK:
            macroValue = data.rank;
            break;
        }
        if (typeof macroValue === "number") {
          macroValue = `${macroValue}`;
        }
        return [macroId, macroValue];
      }),
    id: "MOONPIE_LEADERBOARD_ENTRY",
    keys: Object.values(MacroMoonpieLeaderboardEntry),
  };

export enum MacroMoonpieLeaderboard {
  STARTING_RANK = "STARTING_RANK",
}
export interface MacroMoonpieLeaderboardData {
  startingRank?: number;
}
export const macroMoonpieLeaderboard: MessageParserMacroGenerator<MacroMoonpieLeaderboardData> =
  {
    description:
      "Available in strings that are replies to the moonpie leaderboard command",
    generate: (data) =>
      Object.values(MacroMoonpieLeaderboard).map<
        [MacroMoonpieLeaderboard, string]
      >((macroId) => {
        let macroValue;
        switch (macroId) {
          case MacroMoonpieLeaderboard.STARTING_RANK:
            macroValue = data.startingRank;
            break;
        }
        if (typeof macroValue === "number") {
          macroValue = `${macroValue}`;
        }
        if (typeof macroValue === "undefined") {
          macroValue = "undefined";
        }
        return [macroId, macroValue];
      }),
    id: "MOONPIE_LEADERBOARD",
    keys: Object.values(MacroMoonpieLeaderboard),
  };

export enum MacroMoonpieUserSet {
  SET_COUNT = "SET_COUNT",
  SET_OPERATION = "SET_OPERATION",
}
export interface MacroMoonpieUserSetData {
  setCount: number;
  setOperation: string;
}
export const macroMoonpieUserSet: MessageParserMacroGenerator<MacroMoonpieUserSetData> =
  {
    generate: (data) =>
      Object.values(MacroMoonpieUserSet).map<[MacroMoonpieUserSet, string]>(
        (macroId) => {
          let macroValue;
          switch (macroId) {
            case MacroMoonpieUserSet.SET_COUNT:
              macroValue = data.setCount;
              break;
            case MacroMoonpieUserSet.SET_OPERATION:
              macroValue = data.setOperation;
              break;
          }
          if (typeof macroValue === "number") {
            macroValue = `${macroValue}`;
          }
          return [macroId, macroValue];
        }
      ),
    id: "MOONPIE_USER_SET",
    keys: Object.values(MacroMoonpieUserSet),
  };

export enum MacroMoonpieUser {
  NAME = "NAME",
}
export interface MacroMoonpieUserData {
  name: string;
}
export const macroMoonpieUser: MessageParserMacroGenerator<MacroMoonpieUserData> =
  {
    generate: (data) =>
      Object.values(MacroMoonpieUser).map<[MacroMoonpieUser, string]>(
        (macroId) => {
          let macroValue;
          switch (macroId) {
            case MacroMoonpieUser.NAME:
              macroValue = data.name;
              break;
          }
          return [macroId, macroValue];
        }
      ),
    id: "MOONPIE_USER",
    keys: Object.values(MacroMoonpieUser),
  };
