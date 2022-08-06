import {
  MacroMoonpieBot,
  macroMoonpieBot,
} from "../../messageParser/macros/moonpiebot";
import {
  MacroMoonpieClaim,
  MacroMoonpieLeaderboardEntry,
  macroMoonpieClaimId,
  macroMoonpieLeaderboardEntryId,
} from "../../messageParser/macros/moonpie";
import {
  pluginIfEqual,
  pluginIfNotEqual,
  pluginTimeInSToHumanReadableStringShort,
} from "../../messageParser/plugins/general";
import {
  pluginTwitchChatUserId,
  pluginTwitchChatUserIdId,
} from "../../messageParser/plugins/twitchChat";
import { MOONPIE_STRING_ID } from "../moonpie";
import { createMessageForMessageParser } from "../../messageParser";

export const MOONPIE_COMMAND_REPLY_STRING_ID = `${MOONPIE_STRING_ID}_COMMAND_REPLY`;

export const moonpieCommandReplyAbout = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ABOUT`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: pluginTwitchChatUserId },
    " ",
    { type: "macro", name: macroMoonpieBot.id, key: MacroMoonpieBot.NAME },
    " ",
    { type: "macro", name: macroMoonpieBot.id, key: MacroMoonpieBot.VERSION },
    " (",
    { type: "macro", name: macroMoonpieBot.id, key: MacroMoonpieBot.URL },
    ")",
  ]),
};

export const moonpieCommandReplyClaim = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_CLAIM`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: pluginTwitchChatUserId },
    " You just claimed a moonpie! You have now ",
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
    " and are rank ",
    {
      type: "macro",
      name: macroMoonpieLeaderboardEntryId,
      key: MacroMoonpieLeaderboardEntry.RANK,
    },
    " on the leaderboard!",
  ]),
};

export const moonpieCommandReplyAlreadyClaimedRefNormal = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED_REF_NORMAL`,
  default: createMessageForMessageParser(
    [
      "You already claimed a moonpie for today (",
      {
        type: "plugin",
        name: pluginTimeInSToHumanReadableStringShort.id,
        args: {
          type: "macro",
          name: macroMoonpieClaimId,
          key: MacroMoonpieClaim.TIME_SINCE_CLAIM_IN_S,
        },
      },
      " ago - next claim can be made in ",
      {
        type: "plugin",
        name: pluginTimeInSToHumanReadableStringShort.id,
        args: {
          type: "macro",
          name: macroMoonpieClaimId,
          key: MacroMoonpieClaim.TIME_TILL_NEXT_CLAIM_IN_S,
        },
      },
      ") and are rank ",
      {
        type: "macro",
        name: macroMoonpieLeaderboardEntryId,
        key: MacroMoonpieLeaderboardEntry.RANK,
      },
      " on the leaderboard!",
    ],
    true
  ),
};

export const moonpieCommandReplyAlreadyClaimedRefStar = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED_REF_STAR`,
  default: createMessageForMessageParser(
    [
      "You are the cutest! You have 6969 moonpies and are rank 1 in my heart! <3",
    ],
    true
  ),
};

const starTwitchId = 93818178;

export const moonpieCommandReplyAlreadyClaimed = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: pluginTwitchChatUserId },
    " ",
    {
      type: "plugin",
      name: pluginIfEqual.id,
      args: [
        {
          type: "plugin",
          name: pluginTwitchChatUserIdId,
        },
        `===${starTwitchId}`,
      ],
      scope: {
        type: "reference",
        name: moonpieCommandReplyAlreadyClaimedRefStar.id,
      },
    },
    {
      type: "plugin",
      name: pluginIfNotEqual.id,
      args: [
        {
          type: "plugin",
          name: pluginTwitchChatUserIdId,
        },
        `!==${starTwitchId}`,
      ],
      scope: {
        type: "reference",
        name: moonpieCommandReplyAlreadyClaimedRefNormal.id,
      },
    },
  ]),
};

export const moonpieCommandReplyLeaderboardPrefix = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_PREFIX`,
  default: createMessageForMessageParser(
    ["@", { type: "plugin", name: pluginTwitchChatUserId }, " "],
    true
  ),
};

export const moonpieCommandReplyLeaderboardEntry = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_ENTRY`,
  default: createMessageForMessageParser(
    [
      {
        type: "macro",
        name: macroMoonpieLeaderboardEntryId,
        key: MacroMoonpieLeaderboardEntry.RANK,
      },
      ". ",
      {
        type: "macro",
        name: macroMoonpieLeaderboardEntryId,
        key: MacroMoonpieLeaderboardEntry.NAME,
      },
      " (",
      {
        type: "macro",
        name: macroMoonpieLeaderboardEntryId,
        key: MacroMoonpieLeaderboardEntry.COUNT,
      },
      ")",
    ],
    true
  ),
};

export const moonpieCommandReply = [
  moonpieCommandReplyAbout,
  moonpieCommandReplyClaim,
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyLeaderboardPrefix,
  moonpieCommandReplyLeaderboardEntry,
  moonpieCommandReplyAlreadyClaimedRefNormal,
  moonpieCommandReplyAlreadyClaimedRefStar,
];
