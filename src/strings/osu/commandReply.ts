import {
  MacroOsuBeatmap,
  MacroOsuMostRecentPlay,
  MacroOsuUser,
  pluginOsuBeatmapId,
  pluginOsuMostRecentPlayId,
  pluginOsuUserId,
} from "../../messageParser/plugins/osuApi";
import {
  MacroOsuPpRequest,
  macroOsuPpRequest,
} from "../../messageParser/macros/osuPpRequest";
import {
  MacroOsuRpRequest,
  macroOsuRpRequest,
} from "../../messageParser/macros/osuRpRequest";
import {
  MacroOsuScoreRequest,
  macroOsuScoreRequest,
} from "../../messageParser/macros/osuScoreRequest";
import {
  macroOsuStreamCompanionCurrentMap,
  MacroOsuStreamCompanionCurrentMap,
} from "../../messageParser/macros/osuStreamCompanion";
import {
  MacroOsuWindowTitle,
  macroOsuWindowTitle,
} from "../../messageParser/macros/osuWindowTitle";
import {
  pluginIfFalse,
  pluginIfGreater,
  pluginIfNotEmpty,
  pluginIfNotEqual,
  pluginIfNotGreater,
  pluginIfNotUndefined,
  pluginIfTrue,
  pluginTimeInSToStopwatchString,
} from "../../messageParser/plugins/general";
import { createMessageForMessageParser } from "../../messageParser";

import { OSU_STRING_ID } from "../osu";
import { osuBeatmapRequestRefTopScore } from "./beatmapRequest";
import { PluginOsuStreamCompanion } from "../../messageParser/plugins/osuStreamCompanion";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";

export const OSU_COMMAND_REPLY_STRING_ID = `${OSU_STRING_ID}_COMMAND_REPLY`;

export const osuCommandReplyNp = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Currently playing '",
    {
      key: MacroOsuWindowTitle.TITLE,
      name: macroOsuWindowTitle.id,
      type: "macro",
    },
    "' from '",
    {
      key: MacroOsuWindowTitle.ARTIST,
      name: macroOsuWindowTitle.id,
      type: "macro",
    },
    "' [",
    {
      key: MacroOsuWindowTitle.VERSION,
      name: macroOsuWindowTitle.id,
      type: "macro",
    },
    "]",
    {
      args: {
        key: MacroOsuWindowTitle.MAP_ID_VIA_API,
        name: macroOsuWindowTitle.id,
        type: "macro",
      },
      name: pluginIfNotUndefined.id,
      scope: [
        " (https://osu.ppy.sh/beatmaps/",
        {
          key: MacroOsuWindowTitle.MAP_ID_VIA_API,
          name: macroOsuWindowTitle.id,
          type: "macro",
        },
        ")",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP`,
};

export const osuCommandReplyNpStreamCompanion = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Currently playing ",
    {
      name: PluginOsuStreamCompanion.CURRENT_MAP,
      scope: [
        "'",
        {
          key: MacroOsuStreamCompanionCurrentMap.TITLE_ROMAN,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        "' from '",
        {
          key: MacroOsuStreamCompanionCurrentMap.ARTIST_ROMAN,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        "' [",
        {
          key: MacroOsuStreamCompanionCurrentMap.DIFF_NAME,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        "]",
        {
          args: {
            key: MacroOsuStreamCompanionCurrentMap.MODS,
            name: macroOsuStreamCompanionCurrentMap.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: {
            args: [
              {
                key: MacroOsuStreamCompanionCurrentMap.MODS,
                name: macroOsuStreamCompanionCurrentMap.id,
                type: "macro",
              },
              "!==None",
            ],
            name: pluginIfNotEqual.id,
            scope: [
              " using ",
              {
                key: MacroOsuStreamCompanionCurrentMap.MODS,
                name: macroOsuStreamCompanionCurrentMap.id,
                type: "macro",
              },
            ],
            type: "plugin",
          },
          type: "plugin",
        },
        " - CS=",
        {
          key: MacroOsuStreamCompanionCurrentMap.CS,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        ", AR=",
        {
          key: MacroOsuStreamCompanionCurrentMap.AR,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        ", OD=",
        {
          key: MacroOsuStreamCompanionCurrentMap.OD,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        ", HP=",
        {
          key: MacroOsuStreamCompanionCurrentMap.HP,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        ", BPM=",
        {
          key: MacroOsuStreamCompanionCurrentMap.BPM,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        ", ",
        {
          key: MacroOsuStreamCompanionCurrentMap.MAX_COMBO,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        "x, ",
        {
          key: MacroOsuStreamCompanionCurrentMap.DIFFICULTY_RATING,
          name: macroOsuStreamCompanionCurrentMap.id,
          type: "macro",
        },
        "* (",
        {
          args: [
            {
              key: MacroOsuStreamCompanionCurrentMap.ID,
              name: macroOsuStreamCompanionCurrentMap.id,
              type: "macro",
            },
            ">0",
          ],
          name: pluginIfGreater.id,
          scope: [
            "https://osu.ppy.sh/beatmaps/",
            {
              key: MacroOsuStreamCompanionCurrentMap.ID,
              name: macroOsuStreamCompanionCurrentMap.id,
              type: "macro",
            },
            " - ",
          ],
          type: "plugin",
        },
        {
          args: [
            {
              key: MacroOsuStreamCompanionCurrentMap.ID,
              name: macroOsuStreamCompanionCurrentMap.id,
              type: "macro",
            },
            "<=0",
          ],
          name: pluginIfNotGreater.id,
          scope: {
            args: [
              {
                key: MacroOsuStreamCompanionCurrentMap.SET_ID,
                name: macroOsuStreamCompanionCurrentMap.id,
                type: "macro",
              },
              ">0",
            ],
            name: pluginIfGreater.id,
            scope: [
              "https://osu.ppy.sh/beatmapsets/",
              {
                key: MacroOsuStreamCompanionCurrentMap.SET_ID,
                name: macroOsuStreamCompanionCurrentMap.id,
                type: "macro",
              },
              " - ",
            ],
            type: "plugin",
          },
          type: "plugin",
        },
        "StreamCompanion)",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION`,
};

export const osuCommandReplyNpNoMap = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No map is currently being played",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP`,
};

export const osuCommandReplyNpNoMapStreamCompanion = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No map is currently being played (This is either a custom map or you need to wait until a map change happens since StreamCompanion was found running but it hasn't yet detected an osu! map!)",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP_STREAMCOMPANION`,
};

export const osuCommandReplyNpStreamCompanionNotRunning = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No map is currently being played (StreamCompanion was configured but not found running!)",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_NOT_RUNNING`,
};

export const osuCommandReplyRp = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    {
      args: {
        key: MacroOsuRpRequest.ID,
        name: macroOsuRpRequest.id,
        type: "macro",
      },
      name: pluginOsuMostRecentPlayId,
      scope: [
        {
          args: {
            key: MacroOsuMostRecentPlay.FOUND,
            name: pluginOsuMostRecentPlayId,
            type: "macro",
          },
          name: pluginIfTrue.id,
          scope: [
            "Most recent play of ",
            {
              key: MacroOsuMostRecentPlay.USER_NAME,
              name: pluginOsuMostRecentPlayId,
              type: "macro",
            },
            ": ",
            {
              args: {
                key: MacroOsuMostRecentPlay.PASSED,
                name: pluginOsuMostRecentPlayId,
                type: "macro",
              },
              name: pluginIfTrue.id,
              scope: {
                key: MacroOsuMostRecentPlay.RANK,
                name: pluginOsuMostRecentPlayId,
                type: "macro",
              },
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuMostRecentPlay.PASSED,
                name: pluginOsuMostRecentPlayId,
                type: "macro",
              },
              name: pluginIfFalse.id,
              scope: "A fail",
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuMostRecentPlay.MODS,
                name: pluginOsuMostRecentPlayId,
                type: "macro",
              },
              name: pluginIfNotEmpty.id,
              scope: [
                " using ",
                {
                  key: MacroOsuMostRecentPlay.MODS,
                  name: pluginOsuMostRecentPlayId,
                  type: "macro",
                },
              ],
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuMostRecentPlay.PP,
                name: pluginOsuMostRecentPlayId,
                type: "macro",
              },
              name: pluginIfNotUndefined.id,
              scope: [
                " with ",
                {
                  key: MacroOsuMostRecentPlay.PP,
                  name: pluginOsuMostRecentPlayId,
                  type: "macro",
                },
                "pp",
              ],
              type: "plugin",
            },
            " (",
            {
              key: MacroOsuMostRecentPlay.COUNT_300,
              name: pluginOsuMostRecentPlayId,
              type: "macro",
            },
            "/",
            {
              key: MacroOsuMostRecentPlay.COUNT_100,
              name: pluginOsuMostRecentPlayId,
              type: "macro",
            },
            "/",
            {
              key: MacroOsuMostRecentPlay.COUNT_50,
              name: pluginOsuMostRecentPlayId,
              type: "macro",
            },
            "/",
            {
              key: MacroOsuMostRecentPlay.COUNT_MISS,
              name: pluginOsuMostRecentPlayId,
              type: "macro",
            },
            ") [mc=",
            {
              key: MacroOsuMostRecentPlay.MAX_COMBO,
              name: pluginOsuMostRecentPlayId,
              type: "macro",
            },
            ", acc=",
            {
              key: MacroOsuMostRecentPlay.ACC,
              name: pluginOsuMostRecentPlayId,
              type: "macro",
            },
            "] on ",
            {
              args: {
                key: MacroOsuMostRecentPlay.MAP_ID,
                name: pluginOsuMostRecentPlayId,
                type: "macro",
              },
              name: pluginOsuBeatmapId,
              scope: [
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
                  key: MacroOsuBeatmap.URL,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", ",
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
                " {FC=",
                {
                  key: MacroOsuBeatmap.MAX_COMBO,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", CS=",
                {
                  key: MacroOsuBeatmap.CS,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", DRAIN=",
                {
                  key: MacroOsuBeatmap.DRAIN,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", ACC=",
                {
                  key: MacroOsuBeatmap.ACC,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", AR=",
                {
                  key: MacroOsuBeatmap.AR,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", BPM=",
                {
                  key: MacroOsuBeatmap.BPM,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", CC=",
                {
                  key: MacroOsuBeatmap.CC,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", SLC=",
                {
                  key: MacroOsuBeatmap.SLC,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                ", SPC=",
                {
                  key: MacroOsuBeatmap.SPC,
                  name: pluginOsuBeatmapId,
                  type: "macro",
                },
                "}",
              ],
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuMostRecentPlay.HAS_REPLAY,
                name: pluginOsuMostRecentPlayId,
                type: "macro",
              },
              name: pluginIfTrue.id,
              scope: " (replay available)",
              type: "plugin",
            },
          ],
          type: "plugin",
        },
        {
          args: {
            key: MacroOsuMostRecentPlay.FOUND,
            name: pluginOsuMostRecentPlayId,
            type: "macro",
          },
          name: pluginIfFalse.id,
          scope: "No recent play was found",
          type: "plugin",
        },
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP`,
};

export const osuCommandReplyRpNotFound = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No recent play was found",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP_NOT_FOUND`,
};

export const osuCommandReplyPp = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    {
      args: {
        key: MacroOsuPpRequest.ID,
        name: macroOsuPpRequest.id,
        type: "macro",
      },
      name: pluginOsuUserId,
      scope: [
        { key: MacroOsuUser.NAME, name: pluginOsuUserId, type: "macro" },
        " (https://osu.ppy.sh/users/",
        { key: MacroOsuUser.ID, name: pluginOsuUserId, type: "macro" },
        ") from ",
        { key: MacroOsuUser.COUNTRY, name: pluginOsuUserId, type: "macro" },
        " plays ",
        {
          args: {
            key: MacroOsuUser.PLAY_STYLE,
            name: pluginOsuUserId,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: [
            "with ",
            {
              key: MacroOsuUser.PLAY_STYLE,
              name: pluginOsuUserId,
              type: "macro",
            },
            " ",
          ],
          type: "plugin",
        },
        "since ",
        {
          key: MacroOsuUser.JOIN_DATE_MONTH,
          name: pluginOsuUserId,
          type: "macro",
        },
        " ",
        {
          key: MacroOsuUser.JOIN_DATE_YEAR,
          name: pluginOsuUserId,
          type: "macro",
        },
        {
          args: {
            key: MacroOsuUser.HAS_STATISTICS,
            name: pluginOsuUserId,
            type: "macro",
          },
          name: pluginIfTrue.id,
          scope: [
            " and reached rank #",
            {
              key: MacroOsuUser.GLOBAL_RANK,
              name: pluginOsuUserId,
              type: "macro",
            },
            " [country #",
            {
              key: MacroOsuUser.COUNTRY_RANK,
              name: pluginOsuUserId,
              type: "macro",
            },
            "] with ",
            {
              key: MacroOsuUser.PP,
              name: pluginOsuUserId,
              type: "macro",
            },
            "pp, ",
            {
              key: MacroOsuUser.ACC,
              name: pluginOsuUserId,
              type: "macro",
            },
            "%, a max combo of ",
            {
              key: MacroOsuUser.MAX_COMBO,
              name: pluginOsuUserId,
              type: "macro",
            },
            ", ",
            {
              key: MacroOsuUser.COUNTS_SSH,
              name: pluginOsuUserId,
              type: "macro",
            },
            " SSH, ",
            {
              key: MacroOsuUser.COUNTS_SS,
              name: pluginOsuUserId,
              type: "macro",
            },
            " SS, ",
            {
              key: MacroOsuUser.COUNTS_SH,
              name: pluginOsuUserId,
              type: "macro",
            },
            " SH, ",
            {
              key: MacroOsuUser.COUNTS_S,
              name: pluginOsuUserId,
              type: "macro",
            },
            " S, ",
            {
              key: MacroOsuUser.COUNTS_A,
              name: pluginOsuUserId,
              type: "macro",
            },
            " A (bunny=",
            {
              args: {
                key: MacroOsuUser.HAS_BUNNY,
                name: pluginOsuUserId,
                type: "macro",
              },
              name: pluginIfTrue.id,
              scope: "yes",
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuUser.HAS_BUNNY,
                name: pluginOsuUserId,
                type: "macro",
              },
              name: pluginIfFalse.id,
              scope: "no",
              type: "plugin",
            },
            ", tutel=",
            {
              args: {
                key: MacroOsuUser.HAS_TUTEL,
                name: pluginOsuUserId,
                type: "macro",
              },
              name: pluginIfTrue.id,
              scope: "yes",
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuUser.HAS_TUTEL,
                name: pluginOsuUserId,
                type: "macro",
              },
              name: pluginIfFalse.id,
              scope: "no",
              type: "plugin",
            },
            ")",
          ],
          type: "plugin",
        },
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_PP`,
};

export const osuScoreErrorNoBeatmap = {
  default: createMessageForMessageParser(["No beatmap was found"]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE_NO_BEATMAP`,
};

export const osuScoreErrorNotFound = {
  default: createMessageForMessageParser([
    "No score was found of the user ",
    {
      key: MacroOsuScoreRequest.USER_NAME,
      name: macroOsuScoreRequest.id,
      type: "macro",
    },
    " on the map",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE_NO_SCORE`,
};

export const osuScore = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    {
      key: MacroOsuScoreRequest.USER_NAME,
      name: macroOsuScoreRequest.id,
      type: "macro",
    },
    " has a ",
    { name: osuBeatmapRequestRefTopScore.id, type: "reference" },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE`,
};

export const osuCommandReply = [
  osuCommandReplyNp,
  osuCommandReplyNpNoMap,
  osuCommandReplyNpStreamCompanion,
  osuCommandReplyNpNoMapStreamCompanion,
  osuCommandReplyNpStreamCompanionNotRunning,
  osuCommandReplyRp,
  osuCommandReplyRpNotFound,
  osuCommandReplyPp,
  osuScoreErrorNoBeatmap,
  osuScoreErrorNotFound,
  osuScore,
];
