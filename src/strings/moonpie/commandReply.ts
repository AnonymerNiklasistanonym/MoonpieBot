// Local imports
import {
  MacroMoonpieBot,
  macroMoonpieBot,
} from "../../messageParser/macros/moonpiebot";
import {
  MacroMoonpieClaim,
  macroMoonpieClaim,
  macroMoonpieLeaderboard,
  MacroMoonpieLeaderboard,
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
} from "../../messageParser/macros/moonpie";
import {
  pluginIfEqual,
  pluginIfNotEqual,
  pluginIfNotUndefined,
  pluginTimeInSToHumanReadableStringShort,
} from "../../messageParser/plugins/general";
import { createMessageParserMessage } from "../../messageParser/createMessageParserMessage";
import { MOONPIE_STRING_ID } from "../moonpie";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../strings";

const MOONPIE_COMMAND_REPLY_STRING_ID = `${MOONPIE_STRING_ID}_COMMAND_REPLY`;

export const moonpieCommandReplyAbout: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    { key: MacroMoonpieBot.NAME, name: macroMoonpieBot.id, type: "macro" },
    " ",
    { key: MacroMoonpieBot.VERSION, name: macroMoonpieBot.id, type: "macro" },
    " (",
    { key: MacroMoonpieBot.URL, name: macroMoonpieBot.id, type: "macro" },
    ")",
  ]),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ABOUT`,
};

export const moonpieCommandReplyClaim: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You just claimed a moonpie! You have now ",
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
    " and are rank ",
    {
      key: MacroMoonpieLeaderboardEntry.RANK,
      name: macroMoonpieLeaderboardEntry.id,
      type: "macro",
    },
    " on the leaderboard!",
  ]),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_CLAIM`,
};

const moonpieCommandReplyAlreadyClaimedRefNormal: StringEntry = {
  default: createMessageParserMessage(
    [
      "You already claimed a moonpie for today (",
      {
        args: {
          key: MacroMoonpieClaim.TIME_SINCE_CLAIM_IN_S,
          name: macroMoonpieClaim.id,
          type: "macro",
        },
        name: pluginTimeInSToHumanReadableStringShort.id,
        type: "plugin",
      },
      " ago - next claim can be made in ",
      {
        args: {
          key: MacroMoonpieClaim.TIME_TILL_NEXT_CLAIM_IN_S,
          name: macroMoonpieClaim.id,
          type: "macro",
        },
        name: pluginTimeInSToHumanReadableStringShort.id,
        type: "plugin",
      },
      ") and are rank ",
      {
        key: MacroMoonpieLeaderboardEntry.RANK,
        name: macroMoonpieLeaderboardEntry.id,
        type: "macro",
      },
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
      scope: {
        name: moonpieCommandReplyAlreadyClaimedRefStar.id,
        type: "reference",
      },
      type: "plugin",
    },
    {
      args: [
        { name: PluginTwitchChat.USER_ID, type: "plugin" },
        `!==${starTwitchId}`,
      ],
      name: pluginIfNotEqual.id,
      scope: {
        name: moonpieCommandReplyAlreadyClaimedRefNormal.id,
        type: "reference",
      },
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
  default: createMessageParserMessage(
    [
      {
        key: MacroMoonpieLeaderboardEntry.RANK,
        name: macroMoonpieLeaderboardEntry.id,
        type: "macro",
      },
      ". ",
      {
        key: MacroMoonpieLeaderboardEntry.NAME,
        name: macroMoonpieLeaderboardEntry.id,
        type: "macro",
      },
      " (",
      {
        key: MacroMoonpieLeaderboardEntry.COUNT,
        name: macroMoonpieLeaderboardEntry.id,
        type: "macro",
      },
      ")",
    ],
    true
  ),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_ENTRY`,
};

export const moonpieCommandReplyLeaderboardErrorNoEntriesFound: StringEntry = {
  default: createMessageParserMessage([
    "No leaderboard entries were found",
    {
      args: {
        key: MacroMoonpieLeaderboard.STARTING_RANK,
        name: macroMoonpieLeaderboard.id,
        type: "macro",
      },
      name: pluginIfNotUndefined.id,
      scope: [
        " (starting from rank ",
        {
          key: MacroMoonpieLeaderboard.STARTING_RANK,
          name: macroMoonpieLeaderboard.id,
          type: "macro",
        },
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
