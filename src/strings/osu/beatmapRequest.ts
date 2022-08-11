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
import { OSU_IRC_NEWLINE } from "../../osuirc";
import { OSU_STRING_ID } from "../osu";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";

export const OSU_BEATMAP_REQUEST_STRING_ID = `${OSU_STRING_ID}_BEATMAP_REQUEST`;

export const osuBeatmapRequestRefTopScoreShort = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_TOP_SCORE_SHORT`,
  default: createMessageForMessageParser(
    [
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.RANK },
      {
        type: "plugin",
        name: pluginIfNotEmpty.id,
        args: {
          type: "macro",
          name: pluginOsuScoreId,
          key: MacroOsuScore.MODS,
        },
        scope: [
          " using ",
          { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.MODS },
        ],
      },
    ],
    true
  ),
};

export const osuBeatmapRequestRefTopScore = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_TOP_SCORE`,
  default: createMessageForMessageParser(
    [
      { type: "reference", name: osuBeatmapRequestRefTopScoreShort.id },
      {
        type: "plugin",
        name: pluginIfNotUndefined.id,
        args: { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.PP },
        scope: [
          " with ",
          { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.PP },
          "pp",
        ],
      },
      " (",
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.COUNT_300 },
      "/",
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.COUNT_100 },
      "/",
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.COUNT_50 },
      "/",
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.COUNT_MISS },
      ") [mc=",
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.MAX_COMBO },
      ", acc=",
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.ACC },
      "%] from ",
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.DATE_MONTH },
      " ",
      { type: "macro", name: pluginOsuScoreId, key: MacroOsuScore.DATE_YEAR },
      " ",
      {
        type: "plugin",
        name: pluginIfTrue.id,
        args: {
          type: "macro",
          name: pluginOsuScoreId,
          key: MacroOsuScore.HAS_REPLAY,
        },
        scope: " (replay available)",
      },
    ],
    true
  ),
};

export const osuBeatmapRequest = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}`,
  default: createMessageForMessageParser([
    { type: "plugin", name: PluginTwitchChat.USER },
    " requested ",
    { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.TITLE },
    " '",
    { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.VERSION },
    "' by '",
    { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.ARTIST },
    "'",
    {
      type: "plugin",
      name: pluginOsuScoreId,
      args: [
        {
          type: "macro",
          name: macroOsuBeatmapRequest.id,
          key: MacroOsuBeatmapRequest.ID,
        },
        " ",
        {
          type: "macro",
          name: macroOsuApi.id,
          key: MacroOsuApi.DEFAULT_USER_ID,
        },
      ],
      scope: [
        " - ",
        {
          type: "plugin",
          name: pluginIfTrue.id,
          args: {
            type: "macro",
            name: pluginOsuScoreId,
            key: MacroOsuScore.EXISTS,
          },
          scope: [
            "Current top score is a ",
            { type: "reference", name: osuBeatmapRequestRefTopScoreShort.id },
          ],
        },
        {
          type: "plugin",
          name: pluginIfFalse.id,
          args: {
            type: "macro",
            name: pluginOsuScoreId,
            key: MacroOsuScore.EXISTS,
          },
          scope: "No score found",
        },
      ],
    },
  ]),
};

export const osuBeatmapRequestRefDetailedStats = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_DETAILED_STATS`,
  default: createMessageForMessageParser(
    [
      "FC=",
      {
        type: "macro",
        name: pluginOsuBeatmapId,
        key: MacroOsuBeatmap.MAX_COMBO,
      },
      ", CS=",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.CS },
      ", DRAIN=",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.DRAIN },
      ", ACC=",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.ACC },
      ", AR=",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.AR },
      ", BPM=",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.BPM },
      ", CC=",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.CC },
      ", SLC=",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.SLC },
      ", SPC=",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.SPC },
      ", PLAYS=",
      {
        type: "plugin",
        name: pluginConvertToShortNumber.id,
        args: {
          type: "macro",
          name: pluginOsuBeatmapId,
          key: MacroOsuBeatmap.PLAY_COUNT,
        },
      },
    ],
    true
  ),
};

export const osuBeatmapRequestDetailed = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_DETAILED`,
  default: createMessageForMessageParser([
    { type: "plugin", name: PluginTwitchChat.USER },
    " requested ",
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.TITLE,
    },
    " '",
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.VERSION,
    },
    "' by '",
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.ARTIST,
    },
    "' [",
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.DIFFICULTY_RATING,
    },
    "* ",
    {
      type: "plugin",
      name: pluginTimeInSToStopwatchString.id,
      args: {
        type: "macro",
        name: pluginOsuBeatmapId,
        key: MacroOsuBeatmap.LENGTH_IN_S,
      },
    },
    " ",
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.RANKED_STATUS,
    },
    "] from ",
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.LAST_UPDATED_MONTH,
    },
    " ",
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.LAST_UPDATED_YEAR,
    },
    " {",
    {
      type: "reference",
      name: osuBeatmapRequestRefDetailedStats.id,
    },
    "}",
    {
      type: "plugin",
      name: pluginOsuScoreId,
      args: [
        {
          type: "macro",
          name: macroOsuBeatmapRequest.id,
          key: MacroOsuBeatmapRequest.ID,
        },
        " ",
        {
          type: "macro",
          name: macroOsuApi.id,
          key: MacroOsuApi.DEFAULT_USER_ID,
        },
      ],
      scope: [
        {
          type: "plugin",
          name: pluginIfTrue.id,
          args: {
            type: "macro",
            name: pluginOsuScoreId,
            key: MacroOsuScore.EXISTS,
          },
          scope: [
            " - Current top score is a ",
            { type: "reference", name: osuBeatmapRequestRefTopScore.id },
          ],
        },
        {
          type: "plugin",
          name: pluginIfFalse.id,
          args: {
            type: "macro",
            name: pluginOsuScoreId,
            key: MacroOsuScore.EXISTS,
          },
          scope: " - No score found",
        },
      ],
    },
  ]),
};

export const osuBeatmapRequestNotFound = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NOT_FOUND`,
  default: createMessageForMessageParser([
    "osu! beatmap was not found :( (ID='",
    {
      type: "macro",
      name: macroOsuBeatmapRequest.id,
      key: MacroOsuBeatmapRequest.ID,
    },
    "')",
  ]),
};

export const osuBeatmapRequestRefIrcRequestString = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC_REF_REQUEST_STRING`,
  default: createMessageForMessageParser(
    [
      { type: "plugin", name: PluginTwitchChat.USER },
      " requested ",
      "[https://osu.ppy.sh/beatmapsets/",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.SET_ID },
      "#osu/",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.ID },
      " ",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.TITLE },
      " '",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.VERSION },
      "' by '",
      { type: "macro", name: pluginOsuBeatmapId, key: MacroOsuBeatmap.ARTIST },
      "']",
    ],
    true
  ),
};

export const osuBeatmapRequestIrc = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC`,
  default: createMessageForMessageParser([
    { type: "reference", name: osuBeatmapRequestRefIrcRequestString.id },
    {
      type: "plugin",
      name: pluginOsuScoreId,
      args: [
        {
          type: "macro",
          name: macroOsuBeatmapRequest.id,
          key: MacroOsuBeatmapRequest.ID,
        },
        " ",
        {
          type: "macro",
          name: macroOsuApi.id,
          key: MacroOsuApi.DEFAULT_USER_ID,
        },
      ],
      scope: [
        {
          type: "plugin",
          name: pluginIfEqual.id,
          args: [
            {
              type: "macro",
              name: pluginOsuScoreId,
              key: MacroOsuScore.EXISTS,
            },
            "===true",
          ],
          scope: [
            `${OSU_IRC_NEWLINE} > Top score: `,
            { type: "reference", name: osuBeatmapRequestRefTopScoreShort.id },
          ],
        },
        {
          type: "plugin",
          name: pluginIfNotEmpty.id,
          args: {
            type: "macro",
            name: macroOsuBeatmapRequest.id,
            key: MacroOsuBeatmapRequest.COMMENT,
          },
          scope: [
            `${OSU_IRC_NEWLINE} > Comment: `,
            {
              type: "macro",
              name: macroOsuBeatmapRequest.id,
              key: MacroOsuBeatmapRequest.COMMENT,
            },
          ],
        },
      ],
    },
  ]),
};

export const osuBeatmapRequestIrcDetailed = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC_DETAILED`,
  default: createMessageForMessageParser([
    { type: "reference", name: osuBeatmapRequestRefIrcRequestString.id },
    `${OSU_IRC_NEWLINE}from `,
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.LAST_UPDATED_MONTH,
    },
    " ",
    {
      type: "macro",
      name: pluginOsuBeatmapId,
      key: MacroOsuBeatmap.LAST_UPDATED_YEAR,
    },
    " {",
    { type: "reference", name: osuBeatmapRequestRefDetailedStats.id },
    "}",
    {
      type: "plugin",
      name: pluginOsuScoreId,
      args: [
        {
          type: "macro",
          name: macroOsuBeatmapRequest.id,
          key: MacroOsuBeatmapRequest.ID,
        },
        " ",
        {
          type: "macro",
          name: macroOsuApi.id,
          key: MacroOsuApi.DEFAULT_USER_ID,
        },
      ],
      scope: {
        type: "plugin",
        name: pluginIfTrue.id,
        args: {
          type: "macro",
          name: pluginOsuScoreId,
          key: MacroOsuScore.EXISTS,
        },
        scope: [
          `${OSU_IRC_NEWLINE} > Top score: `,
          { type: "reference", name: osuBeatmapRequestRefTopScore.id },
        ],
      },
    },
    {
      type: "plugin",
      name: pluginIfNotEmpty.id,
      args: {
        type: "macro",
        name: macroOsuBeatmapRequest.id,
        key: MacroOsuBeatmapRequest.COMMENT,
      },
      scope: [
        `${OSU_IRC_NEWLINE} > Comment: `,
        {
          type: "macro",
          name: macroOsuBeatmapRequest.id,
          key: MacroOsuBeatmapRequest.COMMENT,
        },
      ],
    },
  ]),
};

export const osuBeatmapRequestPermissionError = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_PERMISSION_ERROR`,
  default: createMessageForMessageParser([
    "You are not a broadcaster and thus are not allowed to use this command!",
  ]),
};

export const osuBeatmapRequestTurnedOff = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_OFF`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginTwitchChat.USER },
    " Beatmap requests: Off",
    {
      type: "plugin",
      name: pluginIfNotEmpty.id,
      args: {
        type: "macro",
        name: macroOsuBeatmapRequests.id,
        key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
      },
      scope: [
        " (",
        {
          type: "macro",
          name: macroOsuBeatmapRequests.id,
          key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
        },
        ")",
      ],
    },
  ]),
};
export const osuBeatmapRequestTurnedOn = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_ON`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginTwitchChat.USER },
    " Beatmap requests: On",
  ]),
};
export const osuBeatmapRequestCurrentlyOff = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_OFF`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginTwitchChat.USER },
    " Beatmap requests are currently off",
    {
      type: "plugin",
      name: pluginIfNotEmpty.id,
      args: {
        type: "macro",
        name: macroOsuBeatmapRequests.id,
        key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
      },
      scope: [
        " (",
        {
          type: "macro",
          name: macroOsuBeatmapRequests.id,
          key: MacroOsuBeatmapRequests.CUSTOM_MESSAGE,
        },
        ")",
      ],
    },
  ]),
};
export const osuBeatmapRequestCurrentlyOn = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_ON`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginTwitchChat.USER },
    " Beatmap requests are currently on",
  ]),
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
