// Local imports
import { MacroOsuApi, macroOsuApi } from "../../messageParser/macros/osuApi";
import {
  MacroOsuBeatmap,
  macroOsuBeatmap,
  MacroOsuScore,
  macroOsuScore,
} from "../../messageParser/macros/osuApi";
import {
  MacroOsuBeatmapRequest,
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequestDemands,
  MacroOsuBeatmapRequestDemands,
  MacroOsuBeatmapRequests,
  macroOsuBeatmapRequests,
} from "../../messageParser/macros/osuBeatmapRequest";
import {
  pluginConvertToShortNumber,
  pluginIfEqual,
  pluginIfFalse,
  pluginIfNotEmpty,
  pluginIfNotUndefined,
  pluginIfTrue,
  pluginTimeInSToStopwatchString,
} from "../../messageParser/plugins/general";
import { createMessageForMessageParser } from "../../messageParser";
import { OSU_IRC_NEWLINE } from "../../osuIrc";
import { OSU_STRING_ID } from "../osu";
import { PluginOsuApi } from "../../messageParser/plugins/osuApi";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../strings";

const OSU_BEATMAP_REQUEST_STRING_ID = `${OSU_STRING_ID}_BEATMAP_REQUEST`;

const osuBeatmapRequestRefTopScoreShort: StringEntry = {
  default: createMessageForMessageParser(
    [
      { key: MacroOsuScore.RANK, name: macroOsuScore.id, type: "macro" },
      {
        args: {
          key: MacroOsuScore.MODS,
          name: macroOsuScore.id,
          type: "macro",
        },
        name: pluginIfNotEmpty.id,
        scope: [
          " using ",
          { key: MacroOsuScore.MODS, name: macroOsuScore.id, type: "macro" },
        ],
        type: "plugin",
      },
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_TOP_SCORE_SHORT`,
};

export const osuBeatmapRequestRefTopScore: StringEntry = {
  default: createMessageForMessageParser(
    [
      { name: osuBeatmapRequestRefTopScoreShort.id, type: "reference" },
      {
        args: { key: MacroOsuScore.PP, name: macroOsuScore.id, type: "macro" },
        name: pluginIfNotUndefined.id,
        scope: [
          " with ",
          { key: MacroOsuScore.PP, name: macroOsuScore.id, type: "macro" },
          "pp",
        ],
        type: "plugin",
      },
      " (",
      { key: MacroOsuScore.COUNT_300, name: macroOsuScore.id, type: "macro" },
      "/",
      { key: MacroOsuScore.COUNT_100, name: macroOsuScore.id, type: "macro" },
      "/",
      { key: MacroOsuScore.COUNT_50, name: macroOsuScore.id, type: "macro" },
      "/",
      { key: MacroOsuScore.COUNT_MISS, name: macroOsuScore.id, type: "macro" },
      ") [mc=",
      { key: MacroOsuScore.MAX_COMBO, name: macroOsuScore.id, type: "macro" },
      ", acc=",
      { key: MacroOsuScore.ACC, name: macroOsuScore.id, type: "macro" },
      "%] from ",
      { key: MacroOsuScore.DATE_MONTH, name: macroOsuScore.id, type: "macro" },
      " ",
      { key: MacroOsuScore.DATE_YEAR, name: macroOsuScore.id, type: "macro" },
      " ",
      {
        args: {
          key: MacroOsuScore.HAS_REPLAY,
          name: macroOsuScore.id,
          type: "macro",
        },
        name: pluginIfTrue.id,
        scope: [
          " (replay https://osu.ppy.sh/scores/osu/",
          {
            key: MacroOsuScore.ID,
            name: macroOsuScore.id,
            type: "macro",
          },
          ")",
        ],
        type: "plugin",
      },
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_TOP_SCORE`,
};

export const osuBeatmapRequest: StringEntry = {
  default: createMessageForMessageParser([
    { name: PluginTwitchChat.USER, type: "plugin" },
    " requested ",
    { key: MacroOsuBeatmap.TITLE, name: macroOsuBeatmap.id, type: "macro" },
    " '",
    { key: MacroOsuBeatmap.VERSION, name: macroOsuBeatmap.id, type: "macro" },
    "' by '",
    { key: MacroOsuBeatmap.ARTIST, name: macroOsuBeatmap.id, type: "macro" },
    "'",
    {
      args: {
        key: MacroOsuBeatmap.HAS_LEADERBOARD,
        name: macroOsuBeatmap.id,
        type: "macro",
      },
      name: pluginIfTrue.id,
      scope: {
        args: [
          {
            key: MacroOsuBeatmapRequest.ID,
            name: macroOsuBeatmapRequest.id,
            type: "macro",
          },
          " ",
          {
            key: MacroOsuApi.DEFAULT_USER_ID,
            name: macroOsuApi.id,
            type: "macro",
          },
        ],
        name: PluginOsuApi.SCORE,
        scope: [
          " - ",
          {
            args: {
              key: MacroOsuScore.EXISTS,
              name: macroOsuScore.id,
              type: "macro",
            },
            name: pluginIfTrue.id,
            scope: [
              "Current top score is a ",
              { name: osuBeatmapRequestRefTopScoreShort.id, type: "reference" },
            ],
            type: "plugin",
          },
          {
            args: {
              key: MacroOsuScore.EXISTS,
              name: macroOsuScore.id,
              type: "macro",
            },
            name: pluginIfFalse.id,
            scope: "No score found",
            type: "plugin",
          },
        ],
        type: "plugin",
      },
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}`,
};

const osuBeatmapRequestRefDetailedStats: StringEntry = {
  default: createMessageForMessageParser(
    [
      "FC=",
      {
        key: MacroOsuBeatmap.MAX_COMBO,
        name: macroOsuBeatmap.id,
        type: "macro",
      },
      ", CS=",
      { key: MacroOsuBeatmap.CS, name: macroOsuBeatmap.id, type: "macro" },
      ", DRAIN=",
      { key: MacroOsuBeatmap.DRAIN, name: macroOsuBeatmap.id, type: "macro" },
      ", ACC=",
      { key: MacroOsuBeatmap.ACC, name: macroOsuBeatmap.id, type: "macro" },
      ", AR=",
      { key: MacroOsuBeatmap.AR, name: macroOsuBeatmap.id, type: "macro" },
      ", BPM=",
      { key: MacroOsuBeatmap.BPM, name: macroOsuBeatmap.id, type: "macro" },
      ", CC=",
      { key: MacroOsuBeatmap.CC, name: macroOsuBeatmap.id, type: "macro" },
      ", SLC=",
      { key: MacroOsuBeatmap.SLC, name: macroOsuBeatmap.id, type: "macro" },
      ", SPC=",
      { key: MacroOsuBeatmap.SPC, name: macroOsuBeatmap.id, type: "macro" },
      ", PLAYS=",
      {
        args: {
          key: MacroOsuBeatmap.PLAY_COUNT,
          name: macroOsuBeatmap.id,
          type: "macro",
        },
        name: pluginConvertToShortNumber.id,
        type: "plugin",
      },
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_DETAILED_STATS`,
};

export const osuBeatmapRequestDetailed: StringEntry = {
  default: createMessageForMessageParser([
    { name: PluginTwitchChat.USER, type: "plugin" },
    " requested ",
    {
      key: MacroOsuBeatmap.TITLE,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    " '",
    {
      key: MacroOsuBeatmap.VERSION,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    "' by '",
    {
      key: MacroOsuBeatmap.ARTIST,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    "' [",
    {
      key: MacroOsuBeatmap.DIFFICULTY_RATING,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    "* ",
    {
      args: {
        key: MacroOsuBeatmap.LENGTH_IN_S,
        name: macroOsuBeatmap.id,
        type: "macro",
      },
      name: pluginTimeInSToStopwatchString.id,
      type: "plugin",
    },
    " ",
    {
      key: MacroOsuBeatmap.RANKED_STATUS,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    "] from ",
    {
      key: MacroOsuBeatmap.LAST_UPDATED_MONTH,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    " ",
    {
      key: MacroOsuBeatmap.LAST_UPDATED_YEAR,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    " {",
    {
      name: osuBeatmapRequestRefDetailedStats.id,
      type: "reference",
    },
    "}",
    {
      args: {
        key: MacroOsuBeatmap.HAS_LEADERBOARD,
        name: macroOsuBeatmap.id,
        type: "macro",
      },
      name: pluginIfTrue.id,
      scope: {
        args: [
          {
            key: MacroOsuBeatmapRequest.ID,
            name: macroOsuBeatmapRequest.id,
            type: "macro",
          },
          " ",
          {
            key: MacroOsuApi.DEFAULT_USER_ID,
            name: macroOsuApi.id,
            type: "macro",
          },
        ],
        name: PluginOsuApi.SCORE,
        scope: [
          {
            args: {
              key: MacroOsuScore.EXISTS,
              name: macroOsuScore.id,
              type: "macro",
            },
            name: pluginIfTrue.id,
            scope: [
              " - Current top score is a ",
              { name: osuBeatmapRequestRefTopScore.id, type: "reference" },
            ],
            type: "plugin",
          },
          {
            args: {
              key: MacroOsuScore.EXISTS,
              name: macroOsuScore.id,
              type: "macro",
            },
            name: pluginIfFalse.id,
            scope: " - No score found",
            type: "plugin",
          },
        ],
        type: "plugin",
      },
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_DETAILED`,
};

export const osuBeatmapRequestNotFound: StringEntry = {
  default: createMessageForMessageParser([
    "osu! beatmap was not found :( (ID='",
    {
      key: MacroOsuBeatmapRequest.ID,
      name: macroOsuBeatmapRequest.id,
      type: "macro",
    },
    "')",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NOT_FOUND`,
};

export const osuBeatmapRequestDemandsRef: StringEntry = {
  default: createMessageForMessageParser([
    {
      args: {
        key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
        name: macroOsuBeatmapRequests.id,
        type: "macro",
      },
      name: pluginIfNotEmpty.id,
      type: "plugin",
    },
    {
      args: {
        key: MacroOsuBeatmapRequestDemands.HAS_DEMANDS,
        name: macroOsuBeatmapRequestDemands.id,
        type: "macro",
      },
      name: pluginIfTrue.id,
      scope: [
        " (",
        {
          args: {
            key: MacroOsuBeatmapRequestDemands.STAR_RANGE_MIN,
            name: macroOsuBeatmapRequestDemands.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: [
            " >",
            {
              key: MacroOsuBeatmapRequestDemands.STAR_RANGE_MIN,
              name: macroOsuBeatmapRequestDemands.id,
              type: "macro",
            },
            "*",
          ],
          type: "plugin",
        },
        {
          args: {
            key: MacroOsuBeatmapRequestDemands.STAR_RANGE_MAX,
            name: macroOsuBeatmapRequestDemands.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: [
            " <",
            {
              key: MacroOsuBeatmapRequestDemands.STAR_RANGE_MAX,
              name: macroOsuBeatmapRequestDemands.id,
              type: "macro",
            },
            "*",
          ],
          type: "plugin",
        },
        {
          args: {
            key: MacroOsuBeatmapRequestDemands.AR_RANGE_MIN,
            name: macroOsuBeatmapRequestDemands.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: [
            " AR>",
            {
              key: MacroOsuBeatmapRequestDemands.AR_RANGE_MIN,
              name: macroOsuBeatmapRequestDemands.id,
              type: "macro",
            },
          ],
          type: "plugin",
        },
        {
          args: {
            key: MacroOsuBeatmapRequestDemands.AR_RANGE_MAX,
            name: macroOsuBeatmapRequestDemands.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: [
            " AR<",
            {
              key: MacroOsuBeatmapRequestDemands.AR_RANGE_MAX,
              name: macroOsuBeatmapRequestDemands.id,
              type: "macro",
            },
          ],
          type: "plugin",
        },
        {
          args: {
            key: MacroOsuBeatmapRequestDemands.CS_RANGE_MIN,
            name: macroOsuBeatmapRequestDemands.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: [
            " CS>",
            {
              key: MacroOsuBeatmapRequestDemands.CS_RANGE_MIN,
              name: macroOsuBeatmapRequestDemands.id,
              type: "macro",
            },
          ],
          type: "plugin",
        },
        {
          args: {
            key: MacroOsuBeatmapRequestDemands.CS_RANGE_MAX,
            name: macroOsuBeatmapRequestDemands.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: [
            " CS<",
            {
              key: MacroOsuBeatmapRequestDemands.CS_RANGE_MAX,
              name: macroOsuBeatmapRequestDemands.id,
              type: "macro",
            },
          ],
          type: "plugin",
        },
        ")",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_DEMANDS_REF`,
};

export const osuBeatmapRequestNotMeetingDemands: StringEntry = {
  default: createMessageForMessageParser([
    "The requested osu! beatmap does not meet the demands of the requests. ",
    {
      name: osuBeatmapRequestDemandsRef.id,
      type: "reference",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NOT_MEETING_DEMANDS`,
};

const osuBeatmapRequestRefIrcRequestString: StringEntry = {
  default: createMessageForMessageParser(
    [
      { name: PluginTwitchChat.USER, type: "plugin" },
      " requested ",
      "[https://osu.ppy.sh/beatmapsets/",
      { key: MacroOsuBeatmap.SET_ID, name: macroOsuBeatmap.id, type: "macro" },
      "#osu/",
      { key: MacroOsuBeatmap.ID, name: macroOsuBeatmap.id, type: "macro" },
      " ",
      { key: MacroOsuBeatmap.TITLE, name: macroOsuBeatmap.id, type: "macro" },
      " '",
      { key: MacroOsuBeatmap.VERSION, name: macroOsuBeatmap.id, type: "macro" },
      "' by '",
      { key: MacroOsuBeatmap.ARTIST, name: macroOsuBeatmap.id, type: "macro" },
      "']",
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC_REF_REQUEST_STRING`,
};

export const osuBeatmapRequestIrc: StringEntry = {
  default: createMessageForMessageParser([
    { name: osuBeatmapRequestRefIrcRequestString.id, type: "reference" },
    {
      args: [
        {
          key: MacroOsuBeatmapRequest.ID,
          name: macroOsuBeatmapRequest.id,
          type: "macro",
        },
        " ",
        {
          key: MacroOsuApi.DEFAULT_USER_ID,
          name: macroOsuApi.id,
          type: "macro",
        },
      ],
      name: PluginOsuApi.SCORE,
      scope: [
        {
          args: [
            {
              key: MacroOsuScore.EXISTS,
              name: macroOsuScore.id,
              type: "macro",
            },
            "===true",
          ],
          name: pluginIfEqual.id,
          scope: [
            `${OSU_IRC_NEWLINE} > Top score: `,
            { name: osuBeatmapRequestRefTopScoreShort.id, type: "reference" },
          ],
          type: "plugin",
        },
        {
          args: {
            key: MacroOsuBeatmapRequest.COMMENT,
            name: macroOsuBeatmapRequest.id,
            type: "macro",
          },
          name: pluginIfNotEmpty.id,
          scope: [
            `${OSU_IRC_NEWLINE} > Comment: `,
            {
              key: MacroOsuBeatmapRequest.COMMENT,
              name: macroOsuBeatmapRequest.id,
              type: "macro",
            },
          ],
          type: "plugin",
        },
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC`,
};

export const osuBeatmapRequestIrcDetailed: StringEntry = {
  default: createMessageForMessageParser([
    { name: osuBeatmapRequestRefIrcRequestString.id, type: "reference" },
    `${OSU_IRC_NEWLINE}from `,
    {
      key: MacroOsuBeatmap.LAST_UPDATED_MONTH,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    " ",
    {
      key: MacroOsuBeatmap.LAST_UPDATED_YEAR,
      name: macroOsuBeatmap.id,
      type: "macro",
    },
    " {",
    { name: osuBeatmapRequestRefDetailedStats.id, type: "reference" },
    "}",
    {
      args: [
        {
          key: MacroOsuBeatmapRequest.ID,
          name: macroOsuBeatmapRequest.id,
          type: "macro",
        },
        " ",
        {
          key: MacroOsuApi.DEFAULT_USER_ID,
          name: macroOsuApi.id,
          type: "macro",
        },
      ],
      name: PluginOsuApi.SCORE,
      scope: {
        args: {
          key: MacroOsuScore.EXISTS,
          name: macroOsuScore.id,
          type: "macro",
        },
        name: pluginIfTrue.id,
        scope: [
          `${OSU_IRC_NEWLINE} > Top score: `,
          { name: osuBeatmapRequestRefTopScore.id, type: "reference" },
        ],
        type: "plugin",
      },
      type: "plugin",
    },
    {
      args: {
        key: MacroOsuBeatmapRequest.COMMENT,
        name: macroOsuBeatmapRequest.id,
        type: "macro",
      },
      name: pluginIfNotEmpty.id,
      scope: [
        `${OSU_IRC_NEWLINE} > Comment: `,
        {
          key: MacroOsuBeatmapRequest.COMMENT,
          name: macroOsuBeatmapRequest.id,
          type: "macro",
        },
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC_DETAILED`,
};

export const osuBeatmapRequestNoRequestsError: StringEntry = {
  default: createMessageForMessageParser([
    "No previous beatmap request was found!",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NO_REQUESTS_ERROR`,
};

export const osuBeatmapRequestNoBlockedRequestsError: StringEntry = {
  default: createMessageForMessageParser([
    "No blocked beatmap request was found!",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NO_BLOCKED_REQUESTS_ERROR`,
};

export const osuBeatmapRequestTurnedOff: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests: Off",
    {
      args: {
        key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
        name: macroOsuBeatmapRequests.id,
        type: "macro",
      },
      name: pluginIfNotEmpty.id,
      scope: [
        " (",
        {
          key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
          name: macroOsuBeatmapRequests.id,
          type: "macro",
        },
        ")",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_OFF`,
};
export const osuBeatmapRequestTurnedOn: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests: On",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_ON`,
};
export const osuBeatmapRequestCurrentlyOff: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests are currently off.",
    {
      args: {
        key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
        name: macroOsuBeatmapRequests.id,
        type: "macro",
      },
      name: pluginIfNotEmpty.id,
      scope: [
        " (",
        {
          key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
          name: macroOsuBeatmapRequests.id,
          type: "macro",
        },
        ")",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_OFF`,
};
export const osuBeatmapRequestCurrentlyOn: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests are currently on. ",
    {
      name: osuBeatmapRequestDemandsRef.id,
      type: "reference",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_ON`,
};
export const osuBeatmapRequestDemandsUpdated: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap request demands were updated. ",
    {
      name: osuBeatmapRequestDemandsRef.id,
      type: "reference",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_DEMANDS_UPDATED`,
};
export const osuBeatmapRequestNoRedeem: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Please only submit map requests via the channel point redeem",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NO_REDEEM`,
};

export const osuBeatmapRequests: StringEntry[] = [
  osuBeatmapRequest,
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestCurrentlyOn,
  osuBeatmapRequestDemandsRef,
  osuBeatmapRequestDemandsUpdated,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNoBlockedRequestsError,
  osuBeatmapRequestNotFound,
  osuBeatmapRequestNotMeetingDemands,
  osuBeatmapRequestNoRedeem,
  osuBeatmapRequestNoRequestsError,
  osuBeatmapRequestRefDetailedStats,
  osuBeatmapRequestRefIrcRequestString,
  osuBeatmapRequestRefTopScore,
  osuBeatmapRequestRefTopScoreShort,
  osuBeatmapRequestTurnedOff,
  osuBeatmapRequestTurnedOn,
];
