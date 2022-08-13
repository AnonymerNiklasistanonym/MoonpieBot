import {
  macroOsuBeatmap,
  MacroOsuBeatmap,
  macroOsuMostRecentPlay,
  MacroOsuMostRecentPlay,
  macroOsuUser,
  MacroOsuUser,
} from "../../messageParser/macros/osuApi";
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
  macroOsuStreamCompanionCurrentMapFile,
  MacroOsuStreamCompanionCurrentMapFile,
  macroOsuStreamCompanionCurrentMapWebSocket,
  MacroOsuStreamCompanionCurrentMapWebSocket,
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
import { PluginOsuApi } from "../../messageParser/plugins/osuApi";
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

export const osuCommandReplyNpStreamCompanionWebSocket = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Currently playing ",
    {
      name: PluginOsuStreamCompanion.CURRENT_MAP_WEBSOCKET,
      scope: [
        "'",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.TITLE_ROMAN,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        "' from '",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.ARTIST_ROMAN,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        "' [",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.DIFF_NAME,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        "]",
        {
          args: {
            key: MacroOsuStreamCompanionCurrentMapWebSocket.MODS,
            name: macroOsuStreamCompanionCurrentMapWebSocket.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: {
            args: [
              {
                key: MacroOsuStreamCompanionCurrentMapWebSocket.MODS,
                name: macroOsuStreamCompanionCurrentMapWebSocket.id,
                type: "macro",
              },
              "!==None",
            ],
            name: pluginIfNotEqual.id,
            scope: [
              " using ",
              {
                key: MacroOsuStreamCompanionCurrentMapWebSocket.MODS,
                name: macroOsuStreamCompanionCurrentMapWebSocket.id,
                type: "macro",
              },
            ],
            type: "plugin",
          },
          type: "plugin",
        },
        " - CS=",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.CS,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        ", AR=",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.AR,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        ", OD=",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.OD,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        ", HP=",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.HP,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        ", BPM=",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.BPM,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        ", ",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.MAX_COMBO,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        "x, ",
        {
          key: MacroOsuStreamCompanionCurrentMapWebSocket.DIFFICULTY_RATING,
          name: macroOsuStreamCompanionCurrentMapWebSocket.id,
          type: "macro",
        },
        "* (",
        {
          args: [
            {
              key: MacroOsuStreamCompanionCurrentMapWebSocket.ID,
              name: macroOsuStreamCompanionCurrentMapWebSocket.id,
              type: "macro",
            },
            ">0",
          ],
          name: pluginIfGreater.id,
          scope: [
            "https://osu.ppy.sh/beatmaps/",
            {
              key: MacroOsuStreamCompanionCurrentMapWebSocket.ID,
              name: macroOsuStreamCompanionCurrentMapWebSocket.id,
              type: "macro",
            },
            " - ",
          ],
          type: "plugin",
        },
        {
          args: [
            {
              key: MacroOsuStreamCompanionCurrentMapWebSocket.ID,
              name: macroOsuStreamCompanionCurrentMapWebSocket.id,
              type: "macro",
            },
            "<=0",
          ],
          name: pluginIfNotGreater.id,
          scope: {
            args: [
              {
                key: MacroOsuStreamCompanionCurrentMapWebSocket.SET_ID,
                name: macroOsuStreamCompanionCurrentMapWebSocket.id,
                type: "macro",
              },
              ">0",
            ],
            name: pluginIfGreater.id,
            scope: [
              "https://osu.ppy.sh/beatmapsets/",
              {
                key: MacroOsuStreamCompanionCurrentMapWebSocket.SET_ID,
                name: macroOsuStreamCompanionCurrentMapWebSocket.id,
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
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_WEBSOCKET`,
};

export const osuCommandReplyNpStreamCompanionFile = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Currently playing ",
    {
      name: PluginOsuStreamCompanion.CURRENT_MAP_FILE,
      scope: [
        {
          key: MacroOsuStreamCompanionCurrentMapFile.NP_ALL,
          name: macroOsuStreamCompanionCurrentMapFile.id,
          type: "macro",
        },
        {
          args: {
            key: MacroOsuStreamCompanionCurrentMapFile.CURRENT_MODS,
            name: macroOsuStreamCompanionCurrentMapFile.id,
            type: "macro",
          },
          name: pluginIfNotEmpty.id,
          scope: [
            " (currently playing with ",
            {
              key: MacroOsuStreamCompanionCurrentMapFile.CURRENT_MODS,
              name: macroOsuStreamCompanionCurrentMapFile.id,
              type: "macro",
            },
            ")",
          ],
          type: "plugin",
        },
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_FILE`,
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
      name: PluginOsuApi.MOST_RECENT_PLAY,
      scope: [
        {
          args: {
            key: MacroOsuMostRecentPlay.FOUND,
            name: macroOsuMostRecentPlay.id,
            type: "macro",
          },
          name: pluginIfTrue.id,
          scope: [
            "Most recent play of ",
            {
              key: MacroOsuMostRecentPlay.USER_NAME,
              name: macroOsuMostRecentPlay.id,
              type: "macro",
            },
            ": ",
            {
              args: {
                key: MacroOsuMostRecentPlay.PASSED,
                name: macroOsuMostRecentPlay.id,
                type: "macro",
              },
              name: pluginIfTrue.id,
              scope: {
                key: MacroOsuMostRecentPlay.RANK,
                name: macroOsuMostRecentPlay.id,
                type: "macro",
              },
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuMostRecentPlay.PASSED,
                name: macroOsuMostRecentPlay.id,
                type: "macro",
              },
              name: pluginIfFalse.id,
              scope: "A fail",
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuMostRecentPlay.MODS,
                name: macroOsuMostRecentPlay.id,
                type: "macro",
              },
              name: pluginIfNotEmpty.id,
              scope: [
                " using ",
                {
                  key: MacroOsuMostRecentPlay.MODS,
                  name: macroOsuMostRecentPlay.id,
                  type: "macro",
                },
              ],
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuMostRecentPlay.PP,
                name: macroOsuMostRecentPlay.id,
                type: "macro",
              },
              name: pluginIfNotUndefined.id,
              scope: [
                " with ",
                {
                  key: MacroOsuMostRecentPlay.PP,
                  name: macroOsuMostRecentPlay.id,
                  type: "macro",
                },
                "pp",
              ],
              type: "plugin",
            },
            " (",
            {
              key: MacroOsuMostRecentPlay.COUNT_300,
              name: macroOsuMostRecentPlay.id,
              type: "macro",
            },
            "/",
            {
              key: MacroOsuMostRecentPlay.COUNT_100,
              name: macroOsuMostRecentPlay.id,
              type: "macro",
            },
            "/",
            {
              key: MacroOsuMostRecentPlay.COUNT_50,
              name: macroOsuMostRecentPlay.id,
              type: "macro",
            },
            "/",
            {
              key: MacroOsuMostRecentPlay.COUNT_MISS,
              name: macroOsuMostRecentPlay.id,
              type: "macro",
            },
            ") [mc=",
            {
              key: MacroOsuMostRecentPlay.MAX_COMBO,
              name: macroOsuMostRecentPlay.id,
              type: "macro",
            },
            ", acc=",
            {
              key: MacroOsuMostRecentPlay.ACC,
              name: macroOsuMostRecentPlay.id,
              type: "macro",
            },
            "] on ",
            {
              args: {
                key: MacroOsuMostRecentPlay.MAP_ID,
                name: macroOsuMostRecentPlay.id,
                type: "macro",
              },
              name: PluginOsuApi.BEATMAP,
              scope: [
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
                  key: MacroOsuBeatmap.URL,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", ",
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
                " {FC=",
                {
                  key: MacroOsuBeatmap.MAX_COMBO,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", CS=",
                {
                  key: MacroOsuBeatmap.CS,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", DRAIN=",
                {
                  key: MacroOsuBeatmap.DRAIN,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", ACC=",
                {
                  key: MacroOsuBeatmap.ACC,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", AR=",
                {
                  key: MacroOsuBeatmap.AR,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", BPM=",
                {
                  key: MacroOsuBeatmap.BPM,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", CC=",
                {
                  key: MacroOsuBeatmap.CC,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", SLC=",
                {
                  key: MacroOsuBeatmap.SLC,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                ", SPC=",
                {
                  key: MacroOsuBeatmap.SPC,
                  name: macroOsuBeatmap.id,
                  type: "macro",
                },
                "}",
              ],
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuMostRecentPlay.HAS_REPLAY,
                name: macroOsuMostRecentPlay.id,
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
            name: macroOsuMostRecentPlay.id,
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
      name: PluginOsuApi.USER,
      scope: [
        { key: MacroOsuUser.NAME, name: macroOsuUser.id, type: "macro" },
        " (https://osu.ppy.sh/users/",
        { key: MacroOsuUser.ID, name: macroOsuUser.id, type: "macro" },
        ") from ",
        { key: MacroOsuUser.COUNTRY, name: macroOsuUser.id, type: "macro" },
        " plays ",
        {
          args: {
            key: MacroOsuUser.PLAY_STYLE,
            name: macroOsuUser.id,
            type: "macro",
          },
          name: pluginIfNotUndefined.id,
          scope: [
            "with ",
            {
              key: MacroOsuUser.PLAY_STYLE,
              name: macroOsuUser.id,
              type: "macro",
            },
            " ",
          ],
          type: "plugin",
        },
        "since ",
        {
          key: MacroOsuUser.JOIN_DATE_MONTH,
          name: macroOsuUser.id,
          type: "macro",
        },
        " ",
        {
          key: MacroOsuUser.JOIN_DATE_YEAR,
          name: macroOsuUser.id,
          type: "macro",
        },
        {
          args: {
            key: MacroOsuUser.HAS_STATISTICS,
            name: macroOsuUser.id,
            type: "macro",
          },
          name: pluginIfTrue.id,
          scope: [
            " and reached rank #",
            {
              key: MacroOsuUser.GLOBAL_RANK,
              name: macroOsuUser.id,
              type: "macro",
            },
            " [country #",
            {
              key: MacroOsuUser.COUNTRY_RANK,
              name: macroOsuUser.id,
              type: "macro",
            },
            "] with ",
            {
              key: MacroOsuUser.PP,
              name: macroOsuUser.id,
              type: "macro",
            },
            "pp, ",
            {
              key: MacroOsuUser.ACC,
              name: macroOsuUser.id,
              type: "macro",
            },
            "%, a max combo of ",
            {
              key: MacroOsuUser.MAX_COMBO,
              name: macroOsuUser.id,
              type: "macro",
            },
            ", ",
            {
              key: MacroOsuUser.COUNTS_SSH,
              name: macroOsuUser.id,
              type: "macro",
            },
            " SSH, ",
            {
              key: MacroOsuUser.COUNTS_SS,
              name: macroOsuUser.id,
              type: "macro",
            },
            " SS, ",
            {
              key: MacroOsuUser.COUNTS_SH,
              name: macroOsuUser.id,
              type: "macro",
            },
            " SH, ",
            {
              key: MacroOsuUser.COUNTS_S,
              name: macroOsuUser.id,
              type: "macro",
            },
            " S, ",
            {
              key: MacroOsuUser.COUNTS_A,
              name: macroOsuUser.id,
              type: "macro",
            },
            " A (bunny=",
            {
              args: {
                key: MacroOsuUser.HAS_BUNNY,
                name: macroOsuUser.id,
                type: "macro",
              },
              name: pluginIfTrue.id,
              scope: "yes",
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuUser.HAS_BUNNY,
                name: macroOsuUser.id,
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
                name: macroOsuUser.id,
                type: "macro",
              },
              name: pluginIfTrue.id,
              scope: "yes",
              type: "plugin",
            },
            {
              args: {
                key: MacroOsuUser.HAS_TUTEL,
                name: macroOsuUser.id,
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
  osuCommandReplyNpNoMapStreamCompanion,
  osuCommandReplyNpStreamCompanionFile,
  osuCommandReplyNpStreamCompanionNotRunning,
  osuCommandReplyNpStreamCompanionWebSocket,
  osuCommandReplyPp,
  osuCommandReplyRp,
  osuCommandReplyRpNotFound,
  osuScore,
  osuScoreErrorNoBeatmap,
  osuScoreErrorNotFound,
];
