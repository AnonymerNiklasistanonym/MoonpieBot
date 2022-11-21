// Local imports
import {
  createMessageParserMessage,
  generateMessageParserMessageMacro,
  generateMessageParserMessageReference,
} from "../../../messageParser";
import { MacroMoonpieBot, macroMoonpieBot } from "../../macros/moonpiebot";
import {
  MacroMoonpieClaim,
  macroMoonpieClaim,
  macroMoonpieLeaderboard,
  MacroMoonpieLeaderboard,
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
} from "../../macros/moonpie";
import {
  pluginIfEqual,
  pluginIfNotEqual,
  pluginIfNotUndefined,
  pluginTimeInSToHumanReadableStringShort,
} from "../../plugins/general";
import { MOONPIE_STRING_ID } from "../moonpie";
import { PluginTwitchChat } from "../../plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../../messageParser";

const MOONPIE_COMMAND_REPLY_STRING_ID = `${MOONPIE_STRING_ID}_COMMAND_REPLY`;

export const moonpieCommandReplyAbout: StringEntry = {
  default: createMessageParserMessage<MacroMoonpieBot>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    generateMessageParserMessageMacro(macroMoonpieBot, MacroMoonpieBot.NAME),
    " ",
    generateMessageParserMessageMacro(macroMoonpieBot, MacroMoonpieBot.VERSION),
    " (",
    generateMessageParserMessageMacro(macroMoonpieBot, MacroMoonpieBot.URL),
    ")",
  ]),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ABOUT`,
};

export const moonpieCommandReplyClaim: StringEntry = {
  default: createMessageParserMessage<MacroMoonpieLeaderboardEntry>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You just claimed a moonpie! You now have ",
    generateMessageParserMessageMacro(
      macroMoonpieLeaderboardEntry,
      MacroMoonpieLeaderboardEntry.COUNT
    ),
    " moonpie",
    {
      args: [
        generateMessageParserMessageMacro(
          macroMoonpieLeaderboardEntry,
          MacroMoonpieLeaderboardEntry.COUNT
        ),
        "!==1",
      ],
      name: pluginIfNotEqual.id,
      scope: "s",
      type: "plugin",
    },
    " and are rank ",
    generateMessageParserMessageMacro(
      macroMoonpieLeaderboardEntry,
      MacroMoonpieLeaderboardEntry.RANK
    ),
    " on the leaderboard!",
  ]),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_CLAIM`,
};

const moonpieCommandReplyAlreadyClaimedRefNormal: StringEntry = {
  default: createMessageParserMessage<
    MacroMoonpieClaim | MacroMoonpieLeaderboardEntry
  >(
    [
      "You already claimed a moonpie for today (",
      {
        args: generateMessageParserMessageMacro(
          macroMoonpieClaim,
          MacroMoonpieClaim.TIME_SINCE_CLAIM_IN_S
        ),
        name: pluginTimeInSToHumanReadableStringShort.id,
        type: "plugin",
      },
      " ago - next claim can be made in ",
      {
        args: generateMessageParserMessageMacro(
          macroMoonpieClaim,
          MacroMoonpieClaim.TIME_TILL_NEXT_CLAIM_IN_S
        ),
        name: pluginTimeInSToHumanReadableStringShort.id,
        type: "plugin",
      },
      ") and are rank ",
      generateMessageParserMessageMacro(
        macroMoonpieLeaderboardEntry,
        MacroMoonpieLeaderboardEntry.RANK
      ),
      " on the leaderboard!",
    ],
    true
  ),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED_REF_NORMAL`,
};

const moonpieCommandReplyAlreadyClaimedRefStar: StringEntry = {
  default: createMessageParserMessage(
    [
      "You are the cutest! You have 6969 moonpies and are rank 1 in my heart! <3",
    ],
    true
  ),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED_REF_STAR`,
};

const starTwitchId = 93818178;

export const moonpieCommandReplyAlreadyClaimed: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    {
      args: [
        { name: PluginTwitchChat.USER_ID, type: "plugin" },
        `===${starTwitchId}`,
      ],
      name: pluginIfEqual.id,
      scope: generateMessageParserMessageReference(
        moonpieCommandReplyAlreadyClaimedRefStar
      ),
      type: "plugin",
    },
    {
      args: [
        { name: PluginTwitchChat.USER_ID, type: "plugin" },
        `!==${starTwitchId}`,
      ],
      name: pluginIfNotEqual.id,
      scope: generateMessageParserMessageReference(
        moonpieCommandReplyAlreadyClaimedRefNormal
      ),
      type: "plugin",
    },
  ]),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED`,
};

export const moonpieCommandReplyLeaderboardPrefix: StringEntry = {
  default: createMessageParserMessage(
    ["@", { name: PluginTwitchChat.USER, type: "plugin" }, " "],
    true
  ),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_PREFIX`,
};

export const moonpieCommandReplyLeaderboardEntry: StringEntry = {
  default: createMessageParserMessage<MacroMoonpieLeaderboardEntry>(
    [
      generateMessageParserMessageMacro(
        macroMoonpieLeaderboardEntry,
        MacroMoonpieLeaderboardEntry.RANK
      ),
      ". ",
      generateMessageParserMessageMacro(
        macroMoonpieLeaderboardEntry,
        MacroMoonpieLeaderboardEntry.NAME
      ),
      " (",
      generateMessageParserMessageMacro(
        macroMoonpieLeaderboardEntry,
        MacroMoonpieLeaderboardEntry.COUNT
      ),
      ")",
    ],
    true
  ),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_ENTRY`,
};

export const moonpieCommandReplyLeaderboardErrorNoEntriesFound: StringEntry = {
  default: createMessageParserMessage<MacroMoonpieLeaderboard>([
    "No leaderboard entries were found",
    {
      args: generateMessageParserMessageMacro(
        macroMoonpieLeaderboard,
        MacroMoonpieLeaderboard.STARTING_RANK
      ),
      name: pluginIfNotUndefined.id,
      scope: [
        " (starting from rank ",
        generateMessageParserMessageMacro(
          macroMoonpieLeaderboard,
          MacroMoonpieLeaderboard.STARTING_RANK
        ),
        ")",
      ],
      type: "plugin",
    },
  ]),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_NO_ENTRIES_FOUND`,
};

export const moonpieCommandReply: StringEntry[] = [
  moonpieCommandReplyAbout,
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyAlreadyClaimedRefNormal,
  moonpieCommandReplyAlreadyClaimedRefStar,
  moonpieCommandReplyClaim,
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyLeaderboardErrorNoEntriesFound,
  moonpieCommandReplyLeaderboardPrefix,
];
