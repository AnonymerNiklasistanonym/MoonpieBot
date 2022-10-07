// Local imports
import {
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
  MacroMoonpieUser,
  macroMoonpieUser,
  MacroMoonpieUserSet,
  macroMoonpieUserSet,
} from "../../macros/moonpie";
import { createMessageParserMessage } from "../../../messageParser";
import { MOONPIE_STRING_ID } from "../moonpie";
import { pluginIfNotEqual } from "../../plugins/general";
import { PluginTwitchChat } from "../../plugins/twitchChat";
// Type imports
import { StringEntry } from "../../../messageParser";

const MOONPIE_USER_STRING_ID = `${MOONPIE_STRING_ID}_USER`;

export const moonpieUserGet: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " The user ",
    {
      key: MacroMoonpieLeaderboardEntry.NAME,
      name: macroMoonpieLeaderboardEntry.id,
      type: "macro",
    },
    " has ",
    {
      key: MacroMoonpieLeaderboardEntry.COUNT,
      name: macroMoonpieLeaderboardEntry.id,
      type: "macro",
    },
    " moonpie",
    {
      args: [
        {
          key: MacroMoonpieLeaderboardEntry.COUNT,
          name: macroMoonpieLeaderboardEntry.id,
          type: "macro",
        },
        "!==1",
      ],
      name: pluginIfNotEqual.id,
      scope: "s",
      type: "plugin",
    },
    " and is rank ",
    {
      key: MacroMoonpieLeaderboardEntry.RANK,
      name: macroMoonpieLeaderboardEntry.id,
      type: "macro",
    },
    " on the leaderboard!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_GET`,
};
export const moonpieUserNeverClaimedError: StringEntry = {
  default: createMessageParserMessage([
    "The user ",
    {
      key: MacroMoonpieUser.NAME,
      name: macroMoonpieUser.id,
      type: "macro",
    },
    " has never claimed a moonpie!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_NEVER_CLAIMED_ERROR`,
};
export const moonpieUserSetNaNError: StringEntry = {
  default: createMessageParserMessage([
    "The given moonpie count (",
    {
      key: MacroMoonpieUserSet.SET_OPERATION,
      name: macroMoonpieUserSet.id,
      type: "macro",
    },
    ") '",
    {
      key: MacroMoonpieUserSet.SET_COUNT,
      name: macroMoonpieUserSet.id,
      type: "macro",
    },
    "' is not a valid number!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_SET_NAN_ERROR`,
};

export const moonpieUserSet: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You have set the number of moonpies for the user ",
    {
      key: MacroMoonpieUser.NAME,
      name: macroMoonpieUser.id,
      type: "macro",
    },
    " to ",
    {
      key: MacroMoonpieLeaderboardEntry.COUNT,
      name: macroMoonpieLeaderboardEntry.id,
      type: "macro",
    },
    " moonpie",
    {
      args: [
        {
          key: MacroMoonpieLeaderboardEntry.COUNT,
          name: macroMoonpieLeaderboardEntry.id,
          type: "macro",
        },
        "!==1",
      ],
      name: pluginIfNotEqual.id,
      scope: "s",
      type: "plugin",
    },
    " (",
    {
      key: MacroMoonpieUserSet.SET_OPERATION,
      name: macroMoonpieUserSet.id,
      type: "macro",
    },
    {
      key: MacroMoonpieUserSet.SET_COUNT,
      name: macroMoonpieUserSet.id,
      type: "macro",
    },
    ") and they are now rank ",
    {
      key: MacroMoonpieLeaderboardEntry.RANK,
      name: macroMoonpieLeaderboardEntry.id,
      type: "macro",
    },
    " on the leaderboard!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_SET`,
};

export const moonpieUserDelete: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You deleted the entry of the user ",
    {
      key: MacroMoonpieUser.NAME,
      name: macroMoonpieUser.id,
      type: "macro",
    },
  ]),
  id: `${MOONPIE_USER_STRING_ID}_DELETE`,
};

export const moonpieUser: StringEntry[] = [
  moonpieUserGet,
  moonpieUserNeverClaimedError,
  moonpieUserSetNaNError,
  moonpieUserSet,
  moonpieUserDelete,
];
