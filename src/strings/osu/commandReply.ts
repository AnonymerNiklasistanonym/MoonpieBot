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
  MacroOsuStreamCompanion,
  pluginOsuStreamCompanionId,
} from "../../messageParser/plugins/streamcompanion";
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
import { PluginsTwitchChat } from "../../messageParser/plugins/twitchChat";

export const OSU_COMMAND_REPLY_STRING_ID = `${OSU_STRING_ID}_COMMAND_REPLY`;

export const osuCommandReplyNp = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " Currently playing '",
    {
      type: "macro",
      name: macroOsuWindowTitle.id,
      key: MacroOsuWindowTitle.TITLE,
    },
    "' from '",
    {
      type: "macro",
      name: macroOsuWindowTitle.id,
      key: MacroOsuWindowTitle.ARTIST,
    },
    "' [",
    {
      type: "macro",
      name: macroOsuWindowTitle.id,
      key: MacroOsuWindowTitle.VERSION,
    },
    "]",
    {
      type: "plugin",
      name: pluginIfNotUndefined.id,
      args: {
        type: "macro",
        name: macroOsuWindowTitle.id,
        key: MacroOsuWindowTitle.MAP_ID_VIA_API,
      },
      scope: [
        " (https://osu.ppy.sh/beatmaps/",
        {
          type: "macro",
          name: macroOsuWindowTitle.id,
          key: MacroOsuWindowTitle.MAP_ID_VIA_API,
        },
        ")",
      ],
    },
  ]),
};

export const osuCommandReplyNpStreamCompanion = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " Currently playing ",
    {
      type: "plugin",
      name: pluginOsuStreamCompanionId,
      scope: [
        "'",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.TITLE_ROMAN,
        },
        "' from '",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.ARTIST_ROMAN,
        },
        "' [",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.VERSION,
        },
        "]",
        {
          type: "plugin",
          name: pluginIfNotUndefined.id,
          args: {
            type: "macro",
            name: pluginOsuStreamCompanionId,
            key: MacroOsuStreamCompanion.MODS,
          },
          scope: {
            type: "plugin",
            name: pluginIfNotEqual.id,
            args: [
              {
                type: "macro",
                name: pluginOsuStreamCompanionId,
                key: MacroOsuStreamCompanion.MODS,
              },
              "!==None",
            ],
            scope: [
              " using ",
              {
                type: "macro",
                name: pluginOsuStreamCompanionId,
                key: MacroOsuStreamCompanion.MODS,
              },
            ],
          },
        },
        " - CS=",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.CS,
        },
        ", AR=",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.AR,
        },
        ", OD=",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.OD,
        },
        ", HP=",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.HP,
        },
        ", BPM=",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.BPM,
        },
        ", ",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.MAX_COMBO,
        },
        "x, ",
        {
          type: "macro",
          name: pluginOsuStreamCompanionId,
          key: MacroOsuStreamCompanion.DIFFICULTY_RATING,
        },
        "* (",
        {
          type: "plugin",
          name: pluginIfGreater.id,
          args: [
            {
              type: "macro",
              name: pluginOsuStreamCompanionId,
              key: MacroOsuStreamCompanion.ID,
            },
            ">0",
          ],
          scope: [
            "https://osu.ppy.sh/beatmaps/",
            {
              type: "macro",
              name: pluginOsuStreamCompanionId,
              key: MacroOsuStreamCompanion.ID,
            },
            " - ",
          ],
        },
        {
          type: "plugin",
          name: pluginIfNotGreater.id,
          args: [
            {
              type: "macro",
              name: pluginOsuStreamCompanionId,
              key: MacroOsuStreamCompanion.ID,
            },
            "<=0",
          ],
          scope: {
            type: "plugin",
            name: pluginIfGreater.id,
            args: [
              {
                type: "macro",
                name: pluginOsuStreamCompanionId,
                key: MacroOsuStreamCompanion.SET_ID,
              },
              ">0",
            ],
            scope: [
              "https://osu.ppy.sh/beatmapsets/",
              {
                type: "macro",
                name: pluginOsuStreamCompanionId,
                key: MacroOsuStreamCompanion.SET_ID,
              },
              " - ",
            ],
          },
        },
        "StreamCompanion)",
      ],
    },
  ]),
};

export const osuCommandReplyNpNoMap = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " No map is currently being played",
  ]),
};

export const osuCommandReplyNpNoMapStreamCompanion = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP_STREAMCOMPANION`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " No map is currently being played (This is either a custom map or you need to wait until a map change happens since StreamCompanion was found running but it hasn't yet detected an osu! map!)",
  ]),
};

export const osuCommandReplyNpStreamCompanionNotRunning = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_NOT_RUNNING`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " No map is currently being played (StreamCompanion was configured but not found running!)",
  ]),
};

export const osuCommandReplyRp = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " ",
    {
      type: "plugin",
      name: pluginOsuMostRecentPlayId,
      args: {
        type: "macro",
        name: macroOsuRpRequest.id,
        key: MacroOsuRpRequest.ID,
      },
      scope: [
        {
          type: "plugin",
          name: pluginIfTrue.id,
          args: {
            type: "macro",
            name: pluginOsuMostRecentPlayId,
            key: MacroOsuMostRecentPlay.FOUND,
          },
          scope: [
            "Most recent play of ",
            {
              type: "macro",
              name: pluginOsuMostRecentPlayId,
              key: MacroOsuMostRecentPlay.USER_NAME,
            },
            ": ",
            {
              type: "plugin",
              name: pluginIfTrue.id,
              args: {
                type: "macro",
                name: pluginOsuMostRecentPlayId,
                key: MacroOsuMostRecentPlay.PASSED,
              },
              scope: {
                type: "macro",
                name: pluginOsuMostRecentPlayId,
                key: MacroOsuMostRecentPlay.RANK,
              },
            },
            {
              type: "plugin",
              name: pluginIfFalse.id,
              args: {
                type: "macro",
                name: pluginOsuMostRecentPlayId,
                key: MacroOsuMostRecentPlay.PASSED,
              },
              scope: "A fail",
            },
            {
              type: "plugin",
              name: pluginIfNotEmpty.id,
              args: {
                type: "macro",
                name: pluginOsuMostRecentPlayId,
                key: MacroOsuMostRecentPlay.MODS,
              },
              scope: [
                " using ",
                {
                  type: "macro",
                  name: pluginOsuMostRecentPlayId,
                  key: MacroOsuMostRecentPlay.MODS,
                },
              ],
            },
            {
              type: "plugin",
              name: pluginIfNotUndefined.id,
              args: {
                type: "macro",
                name: pluginOsuMostRecentPlayId,
                key: MacroOsuMostRecentPlay.PP,
              },
              scope: [
                " with ",
                {
                  type: "macro",
                  name: pluginOsuMostRecentPlayId,
                  key: MacroOsuMostRecentPlay.PP,
                },
                "pp",
              ],
            },
            " (",
            {
              type: "macro",
              name: pluginOsuMostRecentPlayId,
              key: MacroOsuMostRecentPlay.COUNT_300,
            },
            "/",
            {
              type: "macro",
              name: pluginOsuMostRecentPlayId,
              key: MacroOsuMostRecentPlay.COUNT_100,
            },
            "/",
            {
              type: "macro",
              name: pluginOsuMostRecentPlayId,
              key: MacroOsuMostRecentPlay.COUNT_50,
            },
            "/",
            {
              type: "macro",
              name: pluginOsuMostRecentPlayId,
              key: MacroOsuMostRecentPlay.COUNT_MISS,
            },
            ") [mc=",
            {
              type: "macro",
              name: pluginOsuMostRecentPlayId,
              key: MacroOsuMostRecentPlay.MAX_COMBO,
            },
            ", acc=",
            {
              type: "macro",
              name: pluginOsuMostRecentPlayId,
              key: MacroOsuMostRecentPlay.ACC,
            },
            "] on ",
            {
              type: "plugin",
              name: pluginOsuBeatmapId,
              args: {
                type: "macro",
                name: pluginOsuMostRecentPlayId,
                key: MacroOsuMostRecentPlay.MAP_ID,
              },
              scope: [
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
                  key: MacroOsuBeatmap.URL,
                },
                ", ",
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
                " {FC=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.MAX_COMBO,
                },
                ", CS=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.CS,
                },
                ", DRAIN=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.DRAIN,
                },
                ", ACC=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.ACC,
                },
                ", AR=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.AR,
                },
                ", BPM=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.BPM,
                },
                ", CC=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.CC,
                },
                ", SLC=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.SLC,
                },
                ", SPC=",
                {
                  type: "macro",
                  name: pluginOsuBeatmapId,
                  key: MacroOsuBeatmap.SPC,
                },
                "}",
              ],
            },
            {
              type: "plugin",
              name: pluginIfTrue.id,
              args: {
                type: "macro",
                name: pluginOsuMostRecentPlayId,
                key: MacroOsuMostRecentPlay.HAS_REPLAY,
              },
              scope: " (replay available)",
            },
          ],
        },
        {
          type: "plugin",
          name: pluginIfFalse.id,
          args: {
            type: "macro",
            name: pluginOsuMostRecentPlayId,
            key: MacroOsuMostRecentPlay.FOUND,
          },
          scope: "No recent play was found",
        },
      ],
    },
  ]),
};

export const osuCommandReplyRpNotFound = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP_NOT_FOUND`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " No recent play was found",
  ]),
};

export const osuCommandReplyPp = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_PP`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " ",
    {
      type: "plugin",
      name: pluginOsuUserId,
      args: {
        type: "macro",
        name: macroOsuPpRequest.id,
        key: MacroOsuPpRequest.ID,
      },
      scope: [
        { type: "macro", name: pluginOsuUserId, key: MacroOsuUser.NAME },
        " (https://osu.ppy.sh/users/",
        { type: "macro", name: pluginOsuUserId, key: MacroOsuUser.ID },
        ") from ",
        { type: "macro", name: pluginOsuUserId, key: MacroOsuUser.COUNTRY },
        " plays ",
        {
          type: "plugin",
          name: pluginIfNotUndefined.id,
          args: {
            type: "macro",
            name: pluginOsuUserId,
            key: MacroOsuUser.PLAYSTYLE,
          },
          scope: [
            "with ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.PLAYSTYLE,
            },
            " ",
          ],
        },
        "since ",
        {
          type: "macro",
          name: pluginOsuUserId,
          key: MacroOsuUser.JOIN_DATE_MONTH,
        },
        " ",
        {
          type: "macro",
          name: pluginOsuUserId,
          key: MacroOsuUser.JOIN_DATE_YEAR,
        },
        {
          type: "plugin",
          name: pluginIfTrue.id,
          args: {
            type: "macro",
            name: pluginOsuUserId,
            key: MacroOsuUser.HAS_STATISTICS,
          },
          scope: [
            " and reached rank #",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.GLOBAL_RANK,
            },
            " [country #",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.COUNTRY_RANK,
            },
            "] with ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.PP,
            },
            "pp, ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.ACC,
            },
            "%, a max combo of ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.MAX_COMBO,
            },
            ", ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.COUNTS_SSH,
            },
            " SSH, ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.COUNTS_SS,
            },
            " SS, ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.COUNTS_SH,
            },
            " SH, ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.COUNTS_S,
            },
            " S, ",
            {
              type: "macro",
              name: pluginOsuUserId,
              key: MacroOsuUser.COUNTS_A,
            },
            " A (bunny=",
            {
              type: "plugin",
              name: pluginIfTrue.id,
              args: {
                type: "macro",
                name: pluginOsuUserId,
                key: MacroOsuUser.HAS_BUNNY,
              },
              scope: "yes",
            },
            {
              type: "plugin",
              name: pluginIfFalse.id,
              args: {
                type: "macro",
                name: pluginOsuUserId,
                key: MacroOsuUser.HAS_BUNNY,
              },
              scope: "no",
            },
            ", tutel=",
            {
              type: "plugin",
              name: pluginIfTrue.id,
              args: {
                type: "macro",
                name: pluginOsuUserId,
                key: MacroOsuUser.HAS_TUTEL,
              },
              scope: "yes",
            },
            {
              type: "plugin",
              name: pluginIfFalse.id,
              args: {
                type: "macro",
                name: pluginOsuUserId,
                key: MacroOsuUser.HAS_TUTEL,
              },
              scope: "no",
            },
            ")",
          ],
        },
      ],
    },
  ]),
};

export const osuScoreErrorNoBeatmap = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE_NO_BEATMAP`,
  default: createMessageForMessageParser(["No beatmap was found"]),
};

export const osuScoreErrorNotFound = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE_NO_SCORE`,
  default: createMessageForMessageParser([
    "No score was found of the user ",
    {
      type: "macro",
      name: macroOsuScoreRequest.id,
      key: MacroOsuScoreRequest.USER_NAME,
    },
    " on the map",
  ]),
};

export const osuScore = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " ",
    {
      type: "macro",
      name: macroOsuScoreRequest.id,
      key: MacroOsuScoreRequest.USER_NAME,
    },
    " has a ",
    { type: "reference", name: osuBeatmapRequestRefTopScore.id },
  ]),
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
