// Local imports
import {
  MacroMoonpieBot,
  macroMoonpieBot,
} from "../../messageParser/macros/moonpiebot";
import {
  MacroMoonpieClaim,
  macroMoonpieClaim,
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
} from "../../messageParser/macros/moonpie";
import {
  pluginIfEqual,
  pluginIfNotEqual,
  pluginTimeInSToHumanReadableStringShort,
} from "../../messageParser/plugins/general";
import { createMessageForMessageParser } from "../../messageParser";
import { MOONPIE_STRING_ID } from "../moonpie";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../strings";

const MOONPIE_COMMAND_REPLY_STRING_ID = `${MOONPIE_STRING_ID}_COMMAND_REPLY`;

export const moonpieCommandReplyAbout: StringEntry = {
  default: createMessageForMessageParser([
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
  default: createMessageForMessageParser([
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

export const moonpieCommandReplyAlreadyClaimedRefNormal: StringEntry = {
  default: createMessageForMessageParser(
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

export const moonpieCommandReplyAlreadyClaimedRefStar: StringEntry = {
  default: createMessageForMessageParser(
    [
      "You are the cutest! You have 6969 moonpies and are rank 1 in my heart! <3",
    ],
    true
  ),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED_REF_STAR`,
};

const starTwitchId = 93818178;

export const moonpieCommandReplyAlreadyClaimed: StringEntry = {
  default: createMessageForMessageParser([
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
  default: createMessageForMessageParser(
    ["@", { name: PluginTwitchChat.USER, type: "plugin" }, " "],
    true
  ),
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_PREFIX`,
};

export const moonpieCommandReplyLeaderboardEntry: StringEntry = {
  default: createMessageForMessageParser(
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

export const moonpieCommandReply: StringEntry[] = [
  moonpieCommandReplyAbout,
  moonpieCommandReplyClaim,
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyLeaderboardPrefix,
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyAlreadyClaimedRefNormal,
  moonpieCommandReplyAlreadyClaimedRefStar,
];
