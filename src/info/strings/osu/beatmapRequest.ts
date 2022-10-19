// Local imports
import {
  createMessageParserMessage,
  generateMessageParserMessageMacro,
  generateMessageParserMessageReference,
} from "../../../messageParser";
import { MacroOsuApi, macroOsuApi } from "../../macros/osuApi";
import {
  MacroOsuBeatmap,
  macroOsuBeatmap,
  MacroOsuScore,
  macroOsuScore,
} from "../../macros/osuApi";
import {
  MacroOsuBeatmapRequest,
  macroOsuBeatmapRequest,
  macroOsuBeatmapRequestDemands,
  MacroOsuBeatmapRequestDemands,
  MacroOsuBeatmapRequests,
  macroOsuBeatmapRequests,
} from "../../macros/osuBeatmapRequest";
import {
  pluginConvertToShortNumber,
  pluginIfEqual,
  pluginIfFalse,
  pluginIfNotEmpty,
  pluginIfNotUndefined,
  pluginIfTrue,
  pluginListJoinCommaSpace,
  pluginTimeInSToStopwatchString,
} from "../../plugins/general";
import { OSU_IRC_NEWLINE } from "../../../osuIrc";
import { OSU_STRING_ID } from "../osu";
import { PluginOsuApi } from "../../plugins/osuApi";
import { PluginTwitchChat } from "../../plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../../messageParser";

const OSU_BEATMAP_REQUEST_STRING_ID = `${OSU_STRING_ID}_BEATMAP_REQUEST`;

const osuBeatmapRequestRefTopScoreShort: StringEntry = {
  default: createMessageParserMessage<MacroOsuScore>(
    [
      generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.RANK),
      {
        args: generateMessageParserMessageMacro(
          macroOsuScore,
          MacroOsuScore.MODS
        ),
        name: pluginIfNotEmpty.id,
        scope: [
          " using ",
          generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.MODS),
        ],
        type: "plugin",
      },
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_TOP_SCORE_SHORT`,
};

export const osuBeatmapRequestRefTopScore: StringEntry = {
  default: createMessageParserMessage<MacroOsuScore>(
    [
      generateMessageParserMessageReference(osuBeatmapRequestRefTopScoreShort),
      {
        args: generateMessageParserMessageMacro(
          macroOsuScore,
          MacroOsuScore.PP
        ),
        name: pluginIfNotUndefined.id,
        scope: [
          " with ",
          generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.PP),
          "pp",
        ],
        type: "plugin",
      },
      " (",
      generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.COUNT_300),
      "/",
      generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.COUNT_100),
      "/",
      generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.COUNT_50),
      "/",
      generateMessageParserMessageMacro(
        macroOsuScore,
        MacroOsuScore.COUNT_MISS
      ),
      ") [mc=",
      generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.MAX_COMBO),
      ", acc=",
      generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.ACC),
      "%] from ",
      generateMessageParserMessageMacro(
        macroOsuScore,
        MacroOsuScore.DATE_MONTH
      ),
      " ",
      generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.DATE_YEAR),
      " ",
      {
        args: generateMessageParserMessageMacro(
          macroOsuScore,
          MacroOsuScore.HAS_REPLAY
        ),
        name: pluginIfTrue.id,
        scope: [
          " (replay https://osu.ppy.sh/scores/osu/",
          generateMessageParserMessageMacro(macroOsuScore, MacroOsuScore.ID),
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
  default: createMessageParserMessage<
    MacroOsuApi | MacroOsuBeatmap | MacroOsuBeatmapRequest
  >([
    generateMessageParserMessageMacro(
      macroOsuBeatmapRequest,
      MacroOsuBeatmapRequest.REQUESTER
    ),
    " requested ",
    generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.TITLE),
    " '",
    generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.VERSION),
    "' by '",
    generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.ARTIST),
    "'",
    {
      args: generateMessageParserMessageMacro(
        macroOsuBeatmap,
        MacroOsuBeatmap.HAS_LEADERBOARD
      ),
      name: pluginIfTrue.id,
      scope: {
        args: [
          generateMessageParserMessageMacro(
            macroOsuBeatmapRequest,
            MacroOsuBeatmapRequest.ID
          ),
          " ",
          generateMessageParserMessageMacro(
            macroOsuApi,
            MacroOsuApi.DEFAULT_USER_ID
          ),
        ],
        name: PluginOsuApi.SCORE,
        scope: [
          " - ",
          {
            args: generateMessageParserMessageMacro(
              macroOsuScore,
              MacroOsuScore.EXISTS
            ),
            name: pluginIfTrue.id,
            scope: [
              "Current top score is a ",
              generateMessageParserMessageReference(
                osuBeatmapRequestRefTopScoreShort
              ),
            ],
            type: "plugin",
          },
          {
            args: generateMessageParserMessageMacro(
              macroOsuScore,
              MacroOsuScore.EXISTS
            ),
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
  default: createMessageParserMessage<MacroOsuBeatmap>(
    [
      "FC=",
      generateMessageParserMessageMacro(
        macroOsuBeatmap,
        MacroOsuBeatmap.MAX_COMBO
      ),
      ", CS=",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.CS),
      ", DRAIN=",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.DRAIN),
      ", ACC=",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.ACC),
      ", AR=",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.AR),
      ", BPM=",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.BPM),
      ", CC=",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.CC),
      ", SLC=",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.SLC),
      ", SPC=",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.SPC),
      ", PLAYS=",
      {
        args: generateMessageParserMessageMacro(
          macroOsuBeatmap,
          MacroOsuBeatmap.PLAY_COUNT
        ),
        name: pluginConvertToShortNumber.id,
        type: "plugin",
      },
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_REF_DETAILED_STATS`,
};

export const osuBeatmapRequestDetailed: StringEntry = {
  default: createMessageParserMessage<
    MacroOsuApi | MacroOsuBeatmap | MacroOsuBeatmapRequest
  >([
    generateMessageParserMessageMacro(
      macroOsuBeatmapRequest,
      MacroOsuBeatmapRequest.REQUESTER
    ),
    " requested ",
    generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.TITLE),
    " '",
    generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.VERSION),
    "' by '",
    generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.ARTIST),
    "' [",
    generateMessageParserMessageMacro(
      macroOsuBeatmap,
      MacroOsuBeatmap.DIFFICULTY_RATING
    ),
    "* ",
    {
      args: generateMessageParserMessageMacro(
        macroOsuBeatmap,
        MacroOsuBeatmap.LENGTH_IN_S
      ),
      name: pluginTimeInSToStopwatchString.id,
      type: "plugin",
    },
    " ",
    generateMessageParserMessageMacro(
      macroOsuBeatmap,
      MacroOsuBeatmap.RANKED_STATUS
    ),
    "] from ",
    generateMessageParserMessageMacro(
      macroOsuBeatmap,
      MacroOsuBeatmap.LAST_UPDATED_MONTH
    ),
    " ",
    generateMessageParserMessageMacro(
      macroOsuBeatmap,
      MacroOsuBeatmap.LAST_UPDATED_YEAR
    ),
    " {",
    generateMessageParserMessageReference(osuBeatmapRequestRefDetailedStats),
    "}",
    {
      args: generateMessageParserMessageMacro(
        macroOsuBeatmap,
        MacroOsuBeatmap.HAS_LEADERBOARD
      ),
      name: pluginIfTrue.id,
      scope: {
        args: [
          generateMessageParserMessageMacro(
            macroOsuBeatmapRequest,
            MacroOsuBeatmapRequest.ID
          ),
          " ",
          generateMessageParserMessageMacro(
            macroOsuApi,
            MacroOsuApi.DEFAULT_USER_ID
          ),
        ],
        name: PluginOsuApi.SCORE,
        scope: [
          {
            args: generateMessageParserMessageMacro(
              macroOsuScore,
              MacroOsuScore.EXISTS
            ),
            name: pluginIfTrue.id,
            scope: [
              " - Current top score is a ",
              generateMessageParserMessageReference(
                osuBeatmapRequestRefTopScore
              ),
            ],
            type: "plugin",
          },
          {
            args: generateMessageParserMessageMacro(
              macroOsuScore,
              MacroOsuScore.EXISTS
            ),
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
  default: createMessageParserMessage<MacroOsuBeatmapRequest>([
    "osu! beatmap was not found :( (ID='",
    generateMessageParserMessageMacro(
      macroOsuBeatmapRequest,
      MacroOsuBeatmapRequest.ID
    ),
    "')",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NOT_FOUND`,
};

export const osuBeatmapRequestDemandsRef: StringEntry = {
  default: createMessageParserMessage<
    MacroOsuBeatmapRequests | MacroOsuBeatmapRequestDemands
  >([
    {
      args: generateMessageParserMessageMacro(
        macroOsuBeatmapRequests,
        MacroOsuBeatmapRequests.CUSTOM_MESSAGE
      ),
      name: pluginIfNotEmpty.id,
      type: "plugin",
    },
    {
      args: generateMessageParserMessageMacro(
        macroOsuBeatmapRequestDemands,
        MacroOsuBeatmapRequestDemands.HAS_DEMANDS
      ),
      name: pluginIfTrue.id,
      scope: [
        " (",
        {
          args: [
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.STAR_RANGE_MIN
              ),
              name: pluginIfNotUndefined.id,
              scope: [
                ">",
                generateMessageParserMessageMacro(
                  macroOsuBeatmapRequestDemands,
                  MacroOsuBeatmapRequestDemands.STAR_RANGE_MIN
                ),
                "*;",
              ],
              type: "plugin",
            },
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.STAR_RANGE_MAX
              ),
              name: pluginIfNotUndefined.id,
              scope: [
                "<",
                generateMessageParserMessageMacro(
                  macroOsuBeatmapRequestDemands,
                  MacroOsuBeatmapRequestDemands.STAR_RANGE_MAX
                ),
                "*;",
              ],
              type: "plugin",
            },
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.AR_RANGE_MIN
              ),
              name: pluginIfNotUndefined.id,
              scope: [
                "AR>",
                generateMessageParserMessageMacro(
                  macroOsuBeatmapRequestDemands,
                  MacroOsuBeatmapRequestDemands.AR_RANGE_MIN
                ),
                ";",
              ],
              type: "plugin",
            },
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.AR_RANGE_MAX
              ),
              name: pluginIfNotUndefined.id,
              scope: [
                "AR<",
                generateMessageParserMessageMacro(
                  macroOsuBeatmapRequestDemands,
                  MacroOsuBeatmapRequestDemands.AR_RANGE_MAX
                ),
                ";",
              ],
              type: "plugin",
            },
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.CS_RANGE_MIN
              ),
              name: pluginIfNotUndefined.id,
              scope: [
                "CS>",
                generateMessageParserMessageMacro(
                  macroOsuBeatmapRequestDemands,
                  MacroOsuBeatmapRequestDemands.CS_RANGE_MIN
                ),
                ";",
              ],
              type: "plugin",
            },
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.CS_RANGE_MAX
              ),
              name: pluginIfNotUndefined.id,
              scope: [
                "CS<",
                generateMessageParserMessageMacro(
                  macroOsuBeatmapRequestDemands,
                  MacroOsuBeatmapRequestDemands.CS_RANGE_MAX
                ),
                ";",
              ],
              type: "plugin",
            },
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.LENGTH_IN_MIN_RANGE_MIN
              ),
              name: pluginIfNotUndefined.id,
              scope: [
                ">",
                generateMessageParserMessageMacro(
                  macroOsuBeatmapRequestDemands,
                  MacroOsuBeatmapRequestDemands.LENGTH_IN_MIN_RANGE_MIN
                ),
                "min;",
              ],
              type: "plugin",
            },
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.LENGTH_IN_MIN_RANGE_MAX
              ),
              name: pluginIfNotUndefined.id,
              scope: [
                "<",
                generateMessageParserMessageMacro(
                  macroOsuBeatmapRequestDemands,
                  MacroOsuBeatmapRequestDemands.LENGTH_IN_MIN_RANGE_MAX
                ),
                "min;",
              ],
              type: "plugin",
            },
            {
              args: generateMessageParserMessageMacro(
                macroOsuBeatmapRequestDemands,
                MacroOsuBeatmapRequestDemands.REDEEM_ID
              ),
              name: pluginIfNotUndefined.id,
              scope: "only via channel points redeem;",
              type: "plugin",
            },
          ],
          name: pluginListJoinCommaSpace.id,
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
  default: createMessageParserMessage([
    "The requested osu! beatmap does not meet the demands of the requests. ",
    generateMessageParserMessageReference(osuBeatmapRequestDemandsRef),
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NOT_MEETING_DEMANDS`,
};

const osuBeatmapRequestRefIrcRequestString: StringEntry = {
  default: createMessageParserMessage<MacroOsuBeatmap | MacroOsuBeatmapRequest>(
    [
      generateMessageParserMessageMacro(
        macroOsuBeatmapRequest,
        MacroOsuBeatmapRequest.REQUESTER
      ),
      " requested ",
      "[https://osu.ppy.sh/beatmapsets/",
      generateMessageParserMessageMacro(
        macroOsuBeatmap,
        MacroOsuBeatmap.SET_ID
      ),
      "#osu/",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.ID),
      " ",
      generateMessageParserMessageMacro(macroOsuBeatmap, MacroOsuBeatmap.TITLE),
      " '",
      generateMessageParserMessageMacro(
        macroOsuBeatmap,
        MacroOsuBeatmap.VERSION
      ),
      "' by '",
      generateMessageParserMessageMacro(
        macroOsuBeatmap,
        MacroOsuBeatmap.ARTIST
      ),
      "']",
    ],
    true
  ),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC_REF_REQUEST_STRING`,
};

export const osuBeatmapRequestIrc: StringEntry = {
  default: createMessageParserMessage([
    generateMessageParserMessageReference(osuBeatmapRequestRefIrcRequestString),
    {
      args: [
        generateMessageParserMessageMacro(
          macroOsuBeatmapRequest,
          MacroOsuBeatmapRequest.ID
        ),
        " ",
        generateMessageParserMessageMacro(
          macroOsuApi,
          MacroOsuApi.DEFAULT_USER_ID
        ),
      ],
      name: PluginOsuApi.SCORE,
      scope: [
        {
          args: [
            generateMessageParserMessageMacro(
              macroOsuScore,
              MacroOsuScore.EXISTS
            ),
            "===true",
          ],
          name: pluginIfEqual.id,
          scope: [
            `${OSU_IRC_NEWLINE} > Top score: `,
            generateMessageParserMessageReference(
              osuBeatmapRequestRefTopScoreShort
            ),
          ],
          type: "plugin",
        },
        {
          args: generateMessageParserMessageMacro(
            macroOsuBeatmapRequest,
            MacroOsuBeatmapRequest.COMMENT
          ),
          name: pluginIfNotEmpty.id,
          scope: [
            `${OSU_IRC_NEWLINE} > Comment: `,
            generateMessageParserMessageMacro(
              macroOsuBeatmapRequest,
              MacroOsuBeatmapRequest.COMMENT
            ),
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
  default: createMessageParserMessage<
    MacroOsuBeatmap | MacroOsuBeatmapRequest | MacroOsuScore
  >([
    generateMessageParserMessageReference(osuBeatmapRequestRefIrcRequestString),
    `${OSU_IRC_NEWLINE}from `,
    generateMessageParserMessageMacro(
      macroOsuBeatmap,
      MacroOsuBeatmap.LAST_UPDATED_MONTH
    ),
    " ",
    generateMessageParserMessageMacro(
      macroOsuBeatmap,
      MacroOsuBeatmap.LAST_UPDATED_YEAR
    ),
    " {",
    { name: osuBeatmapRequestRefDetailedStats.id, type: "reference" },
    "}",
    {
      args: [
        generateMessageParserMessageMacro(
          macroOsuBeatmapRequest,
          MacroOsuBeatmapRequest.ID
        ),
        " ",
        generateMessageParserMessageMacro(
          macroOsuApi,
          MacroOsuApi.DEFAULT_USER_ID
        ),
      ],
      name: PluginOsuApi.SCORE,
      scope: {
        args: generateMessageParserMessageMacro(
          macroOsuScore,
          MacroOsuScore.EXISTS
        ),
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
      args: generateMessageParserMessageMacro(
        macroOsuBeatmapRequest,
        MacroOsuBeatmapRequest.COMMENT
      ),
      name: pluginIfNotEmpty.id,
      scope: [
        `${OSU_IRC_NEWLINE} > Comment: `,
        generateMessageParserMessageMacro(
          macroOsuBeatmapRequest,
          MacroOsuBeatmapRequest.COMMENT
        ),
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC_DETAILED`,
};

export const osuBeatmapRequestNoRequestsError: StringEntry = {
  default: createMessageParserMessage([
    "No previous beatmap request was found!",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NO_REQUESTS_ERROR`,
};

export const osuBeatmapRequestNoBlockedRequestsError: StringEntry = {
  default: createMessageParserMessage([
    "No blocked beatmap request was found!",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NO_BLOCKED_REQUESTS_ERROR`,
};

export const osuBeatmapRequestTurnedOff: StringEntry = {
  default: createMessageParserMessage<MacroOsuBeatmapRequests>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests: Off",
    {
      args: generateMessageParserMessageMacro(
        macroOsuBeatmapRequests,
        MacroOsuBeatmapRequests.CUSTOM_MESSAGE
      ),
      name: pluginIfNotEmpty.id,
      scope: [
        " (",
        generateMessageParserMessageMacro(
          macroOsuBeatmapRequests,
          MacroOsuBeatmapRequests.CUSTOM_MESSAGE
        ),
        ")",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_OFF`,
};
export const osuBeatmapRequestTurnedOn: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests: On",
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_ON`,
};
export const osuBeatmapRequestCurrentlyOff: StringEntry = {
  default: createMessageParserMessage<MacroOsuBeatmapRequests>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests are currently off.",
    {
      args: generateMessageParserMessageMacro(
        macroOsuBeatmapRequests,
        MacroOsuBeatmapRequests.CUSTOM_MESSAGE
      ),
      name: pluginIfNotEmpty.id,
      scope: [
        " (",
        generateMessageParserMessageMacro(
          macroOsuBeatmapRequests,
          MacroOsuBeatmapRequests.CUSTOM_MESSAGE
        ),
        ")",
      ],
      type: "plugin",
    },
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_OFF`,
};
export const osuBeatmapRequestCurrentlyOn: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap requests are currently on. ",
    generateMessageParserMessageReference(osuBeatmapRequestDemandsRef),
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_ON`,
};
export const osuBeatmapRequestDemandsUpdated: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Beatmap request demands were updated. ",
    generateMessageParserMessageReference(osuBeatmapRequestDemandsRef),
  ]),
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_DEMANDS_UPDATED`,
};
export const osuBeatmapRequestNoRedeem: StringEntry = {
  default: createMessageParserMessage([
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
