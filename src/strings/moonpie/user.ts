import {
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
  MacroMoonpieUserDelete,
  macroMoonpieUserDelete,
  MacroMoonpieUserNeverClaimed,
  macroMoonpieUserNeverClaimed,
  MacroMoonpieUserSet,
  macroMoonpieUserSet,
} from "../../messageParser/macros/moonpie";
import { createMessageForMessageParser } from "../../messageParser";
import { MOONPIE_STRING_ID } from "../moonpie";
import { pluginIfNotEqual } from "../../messageParser/plugins/general";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";

const MOONPIE_USER_STRING_ID = `${MOONPIE_STRING_ID}_USER`;

export const moonpieUserGet = {
  default: createMessageForMessageParser([
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
export const moonpieUserNeverClaimedError = {
  default: createMessageForMessageParser([
    "The user ",
    {
      key: MacroMoonpieUserNeverClaimed.NAME,
      name: macroMoonpieUserNeverClaimed.id,
      type: "macro",
    },
    " has never claimed a moonpie!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_NEVER_CLAIMED_ERROR`,
};
export const moonpieUserPermissionError = {
  default: createMessageForMessageParser([
    "You are not a broadcaster and thus are not allowed to use this command!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_PERMISSION_ERROR`,
};
export const moonpieUserSetNaNError = {
  default: createMessageForMessageParser([
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

export const moonpieUserSet = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You have set the number of moonpies for the user ",
    {
      key: MacroMoonpieUserSet.NAME,
      name: macroMoonpieUserSet.id,
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

export const moonpieUserDelete = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You deleted the entry of the user ",
    {
      key: MacroMoonpieUserDelete.NAME,
      name: macroMoonpieUserDelete.id,
      type: "macro",
    },
  ]),
  id: `${MOONPIE_USER_STRING_ID}_DELETE`,
};

export const moonpieUser = [
  moonpieUserGet,
  moonpieUserNeverClaimedError,
  moonpieUserPermissionError,
  moonpieUserSetNaNError,
  moonpieUserSet,
  moonpieUserDelete,
];
