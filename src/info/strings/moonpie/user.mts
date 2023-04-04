// Relative imports
import {
  createMessageParserMessage,
  generateMessageParserMessageMacro,
} from "../../../messageParser.mjs";
import {
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
  MacroMoonpieUser,
  macroMoonpieUser,
  MacroMoonpieUserSet,
  macroMoonpieUserSet,
} from "../../macros/moonpie.mjs";
import { MOONPIE_STRING_ID } from "../moonpie.mjs";
import { pluginIfNotEqual } from "../../plugins/general.mjs";
import { PluginTwitchChat } from "../../plugins/twitchChat.mjs";
// Type imports
import { StringEntry } from "../../../messageParser.mjs";

const MOONPIE_USER_STRING_ID = `${MOONPIE_STRING_ID}_USER`;

export const moonpieUserGet: StringEntry = {
  default: createMessageParserMessage<MacroMoonpieLeaderboardEntry>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " The user ",
    generateMessageParserMessageMacro(
      macroMoonpieLeaderboardEntry,
      MacroMoonpieLeaderboardEntry.NAME,
    ),
    " has ",
    generateMessageParserMessageMacro(
      macroMoonpieLeaderboardEntry,
      MacroMoonpieLeaderboardEntry.COUNT,
    ),
    " moonpie",
    {
      args: [
        generateMessageParserMessageMacro(
          macroMoonpieLeaderboardEntry,
          MacroMoonpieLeaderboardEntry.COUNT,
        ),
        "!==1",
      ],
      name: pluginIfNotEqual.id,
      scope: "s",
      type: "plugin",
    },
    " and is rank ",
    generateMessageParserMessageMacro(
      macroMoonpieLeaderboardEntry,
      MacroMoonpieLeaderboardEntry.RANK,
    ),
    " on the leaderboard!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_GET`,
};
export const moonpieUserNeverClaimedError: StringEntry = {
  default: createMessageParserMessage<MacroMoonpieUser>([
    "The user ",
    generateMessageParserMessageMacro(macroMoonpieUser, MacroMoonpieUser.NAME),
    " has never claimed a moonpie!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_NEVER_CLAIMED_ERROR`,
};
export const moonpieUserSetNaNError: StringEntry = {
  default: createMessageParserMessage<MacroMoonpieUserSet>([
    "The given moonpie count (",
    generateMessageParserMessageMacro(
      macroMoonpieUserSet,
      MacroMoonpieUserSet.SET_OPERATION,
    ),
    ") '",
    generateMessageParserMessageMacro(
      macroMoonpieUserSet,
      MacroMoonpieUserSet.SET_COUNT,
    ),
    "' is not a valid number!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_SET_NAN_ERROR`,
};

export const moonpieUserSet: StringEntry = {
  default: createMessageParserMessage<
    MacroMoonpieUser | MacroMoonpieUserSet | MacroMoonpieLeaderboardEntry
  >([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You have set the number of moonpies for the user ",
    generateMessageParserMessageMacro(macroMoonpieUser, MacroMoonpieUser.NAME),
    " to ",
    generateMessageParserMessageMacro(
      macroMoonpieLeaderboardEntry,
      MacroMoonpieLeaderboardEntry.COUNT,
    ),
    " moonpie",
    {
      args: [
        generateMessageParserMessageMacro(
          macroMoonpieLeaderboardEntry,
          MacroMoonpieLeaderboardEntry.COUNT,
        ),
        "!==1",
      ],
      name: pluginIfNotEqual.id,
      scope: "s",
      type: "plugin",
    },
    " (",
    generateMessageParserMessageMacro(
      macroMoonpieUserSet,
      MacroMoonpieUserSet.SET_OPERATION,
    ),
    generateMessageParserMessageMacro(
      macroMoonpieUserSet,
      MacroMoonpieUserSet.SET_COUNT,
    ),
    ") and they are now rank ",
    generateMessageParserMessageMacro(
      macroMoonpieLeaderboardEntry,
      MacroMoonpieLeaderboardEntry.RANK,
    ),
    " on the leaderboard!",
  ]),
  id: `${MOONPIE_USER_STRING_ID}_SET`,
};

export const moonpieUserDelete: StringEntry = {
  default: createMessageParserMessage<MacroMoonpieUser>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You deleted the entry of the user ",
    generateMessageParserMessageMacro(macroMoonpieUser, MacroMoonpieUser.NAME),
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
