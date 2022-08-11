import { MacroOsuApi, macroOsuApi } from "../../messageParser/macros/osuApi";
import {
  MacroOsuBeatmap,
  MacroOsuScore,
  pluginOsuBeatmapId,
  pluginOsuScoreId,
} from "../../messageParser/plugins/osuApi";
import {
  MacroOsuBeatmapRequest,
  macroOsuBeatmapRequest,
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
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";

export const OSU_BEATMAP_REQUEST_STRING_ID = `${OSU_STRING_ID}_BEATMAP_REQUEST`;

export const osuBeatmapRequestRefTopScoreShort = {
  default: createMessageForMessageParser(
    [
      { key: MacroOsuScore.RANK, name: pluginOsuScoreId, type: "macro" },
      {
        args: {
          key: MacroOsuScore.MODS,
          name: pluginOsuScoreId,
          type: "macro",
        },
        name: pluginIfNotEmpty.id,
        scope: [
          " using ",
          { key: MacroOsuScore.MODS, name: pluginOsuScoreId, type: "macro" },
        ],
        type: "plugin",
      },
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_TOP_SCORE_SHORT`,
};

export const osuBeatmapRequestRefTopScore = {
  default: createMessageForMessageParser(
    [
      { name: osuBeatmapRequestRefTopScoreShort.id, type: "reference" },
      {
        args: { key: MacroOsuScore.PP, name: pluginOsuScoreId, type: "macro" },
        name: pluginIfNotUndefined.id,
        scope: [
          " with ",
          { key: MacroOsuScore.PP, name: pluginOsuScoreId, type: "macro" },
          "pp",
        ],
        type: "plugin",
      },
      " (",
      { key: MacroOsuScore.COUNT_300, name: pluginOsuScoreId, type: "macro" },
      "/",
      { key: MacroOsuScore.COUNT_100, name: pluginOsuScoreId, type: "macro" },
      "/",
      { key: MacroOsuScore.COUNT_50, name: pluginOsuScoreId, type: "macro" },
      "/",
      { key: MacroOsuScore.COUNT_MISS, name: pluginOsuScoreId, type: "macro" },
      ") [mc=",
      { key: MacroOsuScore.MAX_COMBO, name: pluginOsuScoreId, type: "macro" },
      ", acc=",
      { key: MacroOsuScore.ACC, name: pluginOsuScoreId, type: "macro" },
      "%] from ",
      { key: MacroOsuScore.DATE_MONTH, name: pluginOsuScoreId, type: "macro" },
      " ",
      { key: MacroOsuScore.DATE_YEAR, name: pluginOsuScoreId, type: "macro" },
      " ",
      {
        args: {
          key: MacroOsuScore.HAS_REPLAY,
          name: pluginOsuScoreId,
          type: "macro",
        },
        name: pluginIfTrue.id,
        scope: " (replay available)",
        type: "plugin",
      },
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_TOP_SCORE`,
};

export const osuBeatmapRequest = {
  default: createMessageForMessageParser([
    { name: PluginTwitchChat.USER, type: "plugin" },
    " requested ",
    { key: MacroOsuBeatmap.TITLE, name: pluginOsuBeatmapId, type: "macro" },
    " '",
    { key: MacroOsuBeatmap.VERSION, name: pluginOsuBeatmapId, type: "macro" },
    "' by '",
    { key: MacroOsuBeatmap.ARTIST, name: pluginOsuBeatmapId, type: "macro" },
    "'",
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
      name: pluginOsuScoreId,
      scope: [
        " - ",
        {
          args: {
            key: MacroOsuScore.EXISTS,
            name: pluginOsuScoreId,
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
            name: pluginOsuScoreId,
            type: "macro",
          },
          name: pluginIfFalse.id,
          scope: "No score found",
          type: "plugin",
        },
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}`,
};

export const osuBeatmapRequestRefDetailedStats = {
  default: createMessageForMessageParser(
    [
      "FC=",
      {
        key: MacroOsuBeatmap.MAX_COMBO,
        name: pluginOsuBeatmapId,
        type: "macro",
      },
      ", CS=",
      { key: MacroOsuBeatmap.CS, name: pluginOsuBeatmapId, type: "macro" },
      ", DRAIN=",
      { key: MacroOsuBeatmap.DRAIN, name: pluginOsuBeatmapId, type: "macro" },
      ", ACC=",
      { key: MacroOsuBeatmap.ACC, name: pluginOsuBeatmapId, type: "macro" },
      ", AR=",
      { key: MacroOsuBeatmap.AR, name: pluginOsuBeatmapId, type: "macro" },
      ", BPM=",
      { key: MacroOsuBeatmap.BPM, name: pluginOsuBeatmapId, type: "macro" },
      ", CC=",
      { key: MacroOsuBeatmap.CC, name: pluginOsuBeatmapId, type: "macro" },
      ", SLC=",
      { key: MacroOsuBeatmap.SLC, name: pluginOsuBeatmapId, type: "macro" },
      ", SPC=",
      { key: MacroOsuBeatmap.SPC, name: pluginOsuBeatmapId, type: "macro" },
      ", PLAYS=",
      {
        args: {
          key: MacroOsuBeatmap.PLAY_COUNT,
          name: pluginOsuBeatmapId,
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

export const osuBeatmapRequestDetailed = {
  default: createMessageForMessageParser([
    { name: PluginTwitchChat.USER, type: "plugin" },
    " requested ",
    {
      key: MacroOsuBeatmap.TITLE,
      name: pluginOsuBeatmapId,
      type: "macro",
    },
    " '",
    {
      key: MacroOsuBeatmap.VERSION,
      name: pluginOsuBeatmapId,
      type: "macro",
    },
    "' by '",
    {
      key: MacroOsuBeatmap.ARTIST,
      name: pluginOsuBeatmapId,
      type: "macro",
    },
    "' [",
    {
      key: MacroOsuBeatmap.DIFFICULTY_RATING,
      name: pluginOsuBeatmapId,
      type: "macro",
    },
    "* ",
    {
      args: {
        key: MacroOsuBeatmap.LENGTH_IN_S,
        name: pluginOsuBeatmapId,
        type: "macro",
      },
      name: pluginTimeInSToStopwatchString.id,
      type: "plugin",
    },
    " ",
    {
      key: MacroOsuBeatmap.RANKED_STATUS,
      name: pluginOsuBeatmapId,
      type: "macro",
    },
    "] from ",
    {
      key: MacroOsuBeatmap.LAST_UPDATED_MONTH,
      name: pluginOsuBeatmapId,
      type: "macro",
    },
    " ",
    {
      key: MacroOsuBeatmap.LAST_UPDATED_YEAR,
      name: pluginOsuBeatmapId,
      type: "macro",
    },
    " {",
    {
      name: osuBeatmapRequestRefDetailedStats.id,
      type: "reference",
    },
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
      name: pluginOsuScoreId,
      scope: [
        {
          args: {
            key: MacroOsuScore.EXISTS,
            name: pluginOsuScoreId,
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
            name: pluginOsuScoreId,
            type: "macro",
          },
          name: pluginIfFalse.id,
          scope: " - No score found",
          type: "plugin",
        },
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_DETAILED`,
};

export const osuBeatmapRequestNotFound = {
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

export const osuBeatmapRequestRefIrcRequestString = {
  default: createMessageForMessageParser(
    [
      { name: PluginTwitchChat.USER, type: "plugin" },
      " requested ",
      "[https://osu.ppy.sh/beatmapsets/",
      { key: MacroOsuBeatmap.SET_ID, name: pluginOsuBeatmapId, type: "macro" },
      "#osu/",
      { key: MacroOsuBeatmap.ID, name: pluginOsuBeatmapId, type: "macro" },
      " ",
      { key: MacroOsuBeatmap.TITLE, name: pluginOsuBeatmapId, type: "macro" },
      " '",
      { key: MacroOsuBeatmap.VERSION, name: pluginOsuBeatmapId, type: "macro" },
      "' by '",
      { key: MacroOsuBeatmap.ARTIST, name: pluginOsuBeatmapId, type: "macro" },
      "']",
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC_REF_REQUEST_STRING`,
};

export const osuBeatmapRequestIrc = {
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
      name: pluginOsuScoreId,
      scope: [
        {
          args: [
            {
              key: MacroOsuScore.EXISTS,
              name: pluginOsuScoreId,
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

export const osuBeatmapRequestIrcDetailed = {
  default: createMessageForMessageParser([
    { name: osuBeatmapRequestRefIrcRequestString.id, type: "reference" },
    `${OSU_IRC_NEWLINE}from `,
    {
      key: MacroOsuBeatmap.LAST_UPDATED_MONTH,
      name: pluginOsuBeatmapId,
      type: "macro",
    },
    " ",
    {
      key: MacroOsuBeatmap.LAST_UPDATED_YEAR,
      name: pluginOsuBeatmapId,
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
      name: pluginOsuScoreId,
      scope: {
        args: {
          key: MacroOsuScore.EXISTS,
          name: pluginOsuScoreId,
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

export const osuBeatmapRequestPermissionError = {
  default: createMessageForMessageParser([
    "You are not a broadcaster and thus are not allowed to use this command!",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_PERMISSION_ERROR`,
};

export const osuBeatmapRequestTurnedOff = {
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
export const osuBeatmapRequestTurnedOn = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests: On",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_ON`,
};
export const osuBeatmapRequestCurrentlyOff = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests are currently off",
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
export const osuBeatmapRequestCurrentlyOn = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests are currently on",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_ON`,
};

export const osuBeatmapRequests = [
  osuBeatmapRequest,
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestCurrentlyOn,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestNotFound,
  osuBeatmapRequestPermissionError,
  osuBeatmapRequestRefDetailedStats,
  osuBeatmapRequestRefIrcRequestString,
  osuBeatmapRequestRefTopScore,
  osuBeatmapRequestRefTopScoreShort,
  osuBeatmapRequestTurnedOff,
  osuBeatmapRequestTurnedOn,
];
