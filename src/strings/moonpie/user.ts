import {
  MacroMoonpieLeaderboardEntry,
  MacroMoonpieUserDelete,
  MacroMoonpieUserNeverClaimed,
  MacroMoonpieUserSet,
  macroMoonpieLeaderboardEntryId,
  macroMoonpieUserDeleteId,
  macroMoonpieUserNeverClaimedId,
  macroMoonpieUserSetId,
} from "../../messageParser/macros/moonpie";
import { MOONPIE_STRING_ID } from "../moonpie";
import { createMessageForMessageParser } from "../../messageParser";
import { pluginIfNotEqual } from "../../messageParser/plugins/general";
import { pluginTwitchChatUserId } from "../../messageParser/plugins/twitchChat";

export const MOONPIE_USER_STRING_ID = `${MOONPIE_STRING_ID}_USER`;

export const moonpieUserGet = {
  id: `${MOONPIE_USER_STRING_ID}_GET`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: pluginTwitchChatUserId },
    " The user ",
    {
      type: "macro",
      name: macroMoonpieLeaderboardEntryId,
      key: MacroMoonpieLeaderboardEntry.NAME,
    },
    " has ",
    {
      type: "macro",
      name: macroMoonpieLeaderboardEntryId,
      key: MacroMoonpieLeaderboardEntry.COUNT,
    },
    " moonpie",
    {
      type: "plugin",
      name: pluginIfNotEqual.id,
      args: [
        {
          type: "macro",
          name: macroMoonpieLeaderboardEntryId,
          key: MacroMoonpieLeaderboardEntry.COUNT,
        },
        "!==1",
      ],
      scope: "s",
    },
    " and is rank ",
    {
      type: "macro",
      name: macroMoonpieLeaderboardEntryId,
      key: MacroMoonpieLeaderboardEntry.RANK,
    },
    " on the leaderboard!",
  ]),
};
export const moonpieUserNeverClaimedError = {
  id: `${MOONPIE_USER_STRING_ID}_NEVER_CLAIMED_ERROR`,
  default: createMessageForMessageParser([
    "The user ",
    {
      type: "macro",
      name: macroMoonpieUserNeverClaimedId,
      key: MacroMoonpieUserNeverClaimed.NAME,
    },
    " has never claimed a moonpie!",
  ]),
};
export const moonpieUserPermissionError = {
  id: `${MOONPIE_USER_STRING_ID}_PERMISSION_ERROR`,
  default: createMessageForMessageParser([
    "You are not a broadcaster and thus are not allowed to use this command!",
  ]),
};
export const moonpieUserSetNaNError = {
  id: `${MOONPIE_USER_STRING_ID}_SET_NAN_ERROR`,
  default: createMessageForMessageParser([
    "The given moonpie count (",
    {
      type: "macro",
      name: macroMoonpieUserSetId,
      key: MacroMoonpieUserSet.SET_OPERATION,
    },
    ") '",
    {
      type: "macro",
      name: macroMoonpieUserSetId,
      key: MacroMoonpieUserSet.SET_COUNT,
    },
    "' is not a valid number!",
  ]),
};

export const moonpieUserSet = {
  id: `${MOONPIE_USER_STRING_ID}_SET`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: pluginTwitchChatUserId },
    " You have set the number of moonpies for the user ",
    {
      type: "macro",
      name: macroMoonpieUserSetId,
      key: MacroMoonpieUserSet.NAME,
    },
    " to ",
    {
      type: "macro",
      name: macroMoonpieLeaderboardEntryId,
      key: MacroMoonpieLeaderboardEntry.COUNT,
    },
    " moonpie",
    {
      type: "plugin",
      name: pluginIfNotEqual.id,
      args: [
        {
          type: "macro",
          name: macroMoonpieLeaderboardEntryId,
          key: MacroMoonpieLeaderboardEntry.COUNT,
        },
        "!==1",
      ],
      scope: "s",
    },
    " (",
    {
      type: "macro",
      name: macroMoonpieUserSetId,
      key: MacroMoonpieUserSet.SET_OPERATION,
    },
    {
      type: "macro",
      name: macroMoonpieUserSetId,
      key: MacroMoonpieUserSet.SET_COUNT,
    },
    ") and they are now rank ",
    {
      type: "macro",
      name: macroMoonpieLeaderboardEntryId,
      key: MacroMoonpieLeaderboardEntry.RANK,
    },
    " on the leaderboard!",
  ]),
};

export const moonpieUserDelete = {
  id: `${MOONPIE_USER_STRING_ID}_DELETE`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: pluginTwitchChatUserId },
    " You deleted the entry of the user ",
    {
      type: "macro",
      name: macroMoonpieUserDeleteId,
      key: MacroMoonpieUserDelete.NAME,
    },
  ]),
};

export const moonpieUser = [
  moonpieUserGet,
  moonpieUserNeverClaimedError,
  moonpieUserPermissionError,
  moonpieUserSetNaNError,
  moonpieUserSet,
  moonpieUserDelete,
];
