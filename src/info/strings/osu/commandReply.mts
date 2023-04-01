// Relative imports
import {
  macroOsuBeatmap,
  MacroOsuBeatmap,
  macroOsuMostRecentPlay,
  MacroOsuMostRecentPlay,
  MacroOsuScore,
  macroOsuScore,
  macroOsuUser,
  MacroOsuUser,
} from "../../macros/osuApi.mjs";
import {
  MacroOsuPpRpRequest,
  macroOsuPpRpRequest,
} from "../../macros/osuPpRpRequest.mjs";
import {
  MacroOsuScoreRequest,
  macroOsuScoreRequest,
} from "../../macros/osuScoreRequest.mjs";
import {
  macroOsuStreamCompanionCurrentMapFile,
  MacroOsuStreamCompanionCurrentMapFile,
  macroOsuStreamCompanionCurrentMapWebSocket,
  MacroOsuStreamCompanionCurrentMapWebSocket,
} from "../../macros/osuStreamCompanion.mjs";
import {
  MacroOsuWindowTitle,
  macroOsuWindowTitle,
} from "../../macros/osuWindowTitle.mjs";
import {
  pluginIfFalse,
  pluginIfGreater,
  pluginIfNotEmpty,
  pluginIfNotEqual,
  pluginIfNotGreater,
  pluginIfNotUndefined,
  pluginIfTrue,
  pluginTimeInSToStopwatchString,
} from "../../plugins/general.mjs";
import { createMessageParserMessage } from "../../../messageParser.mjs";
import { OSU_STRING_ID } from "../osu.mjs";
import { osuBeatmapRequestRefTopScore } from "./beatmapRequest.mjs";
import { PluginOsuApi } from "../../plugins/osuApi.mjs";
import { PluginOsuStreamCompanion } from "../../plugins/osuStreamCompanion.mjs";
import { PluginTwitchChat } from "../../plugins/twitchChat.mjs";
// Type imports
import type { StringEntry } from "../../../messageParser.mjs";

const OSU_COMMAND_REPLY_STRING_ID = `${OSU_STRING_ID}_COMMAND_REPLY`;

export const osuCommandReplyNp: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Now playing '",
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
        " https://osu.ppy.sh/beatmaps/",
        {
          key: MacroOsuWindowTitle.MAP_ID_VIA_API,
          name: macroOsuWindowTitle.id,
          type: "macro",
        },
        "",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP`,
};

export const osuCommandReplyNpStreamCompanionWebSocket: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Now playing ",
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
        ")",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_WEBSOCKET`,
};

export const osuCommandReplyNpStreamCompanionFile: StringEntry = {
  alternatives: [
    createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " Now playing ",
      {
        name: PluginOsuStreamCompanion.CURRENT_MAP_FILE,
        scope: [
          {
            key: MacroOsuStreamCompanionCurrentMapFile.CUSTOM,
            name: macroOsuStreamCompanionCurrentMapFile.id,
            type: "macro",
          },
          {
            args: {
              key: MacroOsuStreamCompanionCurrentMapFile.NP_PLAYING_DL,
              name: macroOsuStreamCompanionCurrentMapFile.id,
              type: "macro",
            },
            name: pluginIfNotEmpty.id,
            scope: [
              " ",
              {
                key: MacroOsuStreamCompanionCurrentMapFile.NP_PLAYING_DL,
                name: macroOsuStreamCompanionCurrentMapFile.id,
                type: "macro",
              },
            ],
            type: "plugin",
          },
        ],
        type: "plugin",
      },
    ]),
  ],
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Now playing ",
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
          scope: {
            args: [
              {
                key: MacroOsuStreamCompanionCurrentMapFile.CURRENT_MODS,
                name: macroOsuStreamCompanionCurrentMapFile.id,
                type: "macro",
              },
              "!==",
              "None",
            ],
            name: pluginIfNotEqual.id,
            scope: [
              " (active mods: ",
              {
                key: MacroOsuStreamCompanionCurrentMapFile.CURRENT_MODS,
                name: macroOsuStreamCompanionCurrentMapFile.id,
                type: "macro",
              },
              ")",
            ],
            type: "plugin",
          },
          type: "plugin",
        },
        {
          args: {
            key: MacroOsuStreamCompanionCurrentMapFile.NP_PLAYING_DL,
            name: macroOsuStreamCompanionCurrentMapFile.id,
            type: "macro",
          },
          name: pluginIfNotEmpty.id,
          scope: [
            " ",
            {
              key: MacroOsuStreamCompanionCurrentMapFile.NP_PLAYING_DL,
              name: macroOsuStreamCompanionCurrentMapFile.id,
              type: "macro",
            },
          ],
          type: "plugin",
        },
      ],
      type: "plugin",
    },
  ]),
  description:
    "For less information/stats open StreamCompanion, go to 'Settings', 'Output Patterns' select the column 'np_all' and edit the text cell labeled 'Formatting' to '!mapArtistTitle! !mapDiff!' instead of the default '!mapArtistTitle! !mapDiff! CS:!cs! AR:!ar! OD:!od! HP:!hp!'",
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_FILE`,
};

export const osuCommandReplyNpNoMap: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No map is currently being played",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP`,
};

export const osuCommandReplyNpNoMapStreamCompanionWebsocket: StringEntry = {
  default: createMessageParserMessage([
    {
      name: osuCommandReplyNpNoMap.id,
      type: "reference",
    },
    " (This is either a custom map or you need to wait until a map change happens since StreamCompanion was found running but it hasn't yet detected an osu! map!)",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP_STREAMCOMPANION`,
};

export const osuCommandReplyNpStreamCompanionFileNotRunning: StringEntry = {
  default: createMessageParserMessage([
    {
      name: osuCommandReplyNpNoMap.id,
      type: "reference",
    },
    " (It's also possible that StreamCompanion is not running)",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_NOT_RUNNING`,
};

export const osuCommandReplyNpStreamCompanionWebSocketNotRunning: StringEntry =
  {
    default: createMessageParserMessage([
      {
        name: osuCommandReplyNpNoMap.id,
        type: "reference",
      },
      " (StreamCompanion [websocket] was configured but not found running!)",
    ]),
    id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_WEB_SOCKET_NOT_RUNNING`,
  };

export const osuCommandReplyRp: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    {
      args: {
        key: MacroOsuPpRpRequest.ID,
        name: macroOsuPpRpRequest.id,
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
              scope: [
                " (best score replay https://osu.ppy.sh/scores/osu/",
                {
                  key: MacroOsuMostRecentPlay.BEST_SCORE_ID,
                  name: macroOsuMostRecentPlay.id,
                  type: "macro",
                },
                ")",
              ],
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

export const osuCommandReplyRpNotFound: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No recent play was found",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP_NOT_FOUND`,
};

export const osuCommandReplyPp: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    {
      args: {
        key: MacroOsuPpRpRequest.ID,
        name: macroOsuPpRpRequest.id,
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

export const osuScoreErrorNoBeatmap: StringEntry = {
  default: createMessageParserMessage(["No beatmap was found"]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE_NO_BEATMAP`,
};

export const osuScoreErrorNotFound: StringEntry = {
  default: createMessageParserMessage([
    "No score was found of the user ",
    {
      key: MacroOsuScoreRequest.USER_NAME,
      name: macroOsuScoreRequest.id,
      type: "macro",
    },
    " on ",
    {
      args: {
        key: MacroOsuScoreRequest.BEATMAP_ID,
        name: macroOsuScoreRequest.id,
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
        "'",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE_NO_SCORE`,
};

export const osuScore: StringEntry = {
  default: createMessageParserMessage<MacroOsuScoreRequest | MacroOsuScore>([
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
    " on ",
    {
      args: {
        key: MacroOsuScore.BEATMAP_ID,
        name: macroOsuScore.id,
        type: "macro",
      },
      name: PluginOsuApi.BEATMAP,
      scope: {
        key: MacroOsuBeatmap.TITLE,
        name: macroOsuBeatmap.id,
        type: "macro",
      },
      type: "plugin",
    },
    " '",
    { key: MacroOsuScore.VERSION, name: macroOsuScore.id, type: "macro" },
    "'",
  ]),
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE`,
};

export const osuCommandReply: StringEntry[] = [
  osuCommandReplyNp,
  osuCommandReplyNpNoMap,
  osuCommandReplyNpNoMapStreamCompanionWebsocket,
  osuCommandReplyNpStreamCompanionFile,
  osuCommandReplyNpStreamCompanionFileNotRunning,
  osuCommandReplyNpStreamCompanionWebSocket,
  osuCommandReplyNpStreamCompanionWebSocketNotRunning,
  osuCommandReplyPp,
  osuCommandReplyRp,
  osuCommandReplyRpNotFound,
  osuScore,
  osuScoreErrorNoBeatmap,
  osuScoreErrorNotFound,
];
