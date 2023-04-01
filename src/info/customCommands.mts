// Relative imports
import {
  pluginCustomDataId,
  pluginCustomDataListAverageId,
  pluginCustomDataListClearNumberId,
  pluginCustomDataListId,
  pluginCustomDataListMaxId,
  pluginCustomDataListMinId,
  pluginCustomDataListSizeId,
  pluginCustomDataListSumId,
} from "./plugins/customData.mjs";
import {
  pluginHelp,
  pluginIfGreater,
  pluginIfNotEqual,
  pluginIfNotUndefined,
  pluginIfUndefined,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableStringShort,
} from "./plugins/general.mjs";
import { convertRegexToString } from "../other/regexToString.mjs";
import { createMessageParserMessage } from "../messageParser.mjs";
import { pluginCountGenerator } from "./plugins/count.mjs";
import { pluginRegexGroupId } from "./plugins/regexGroup.mjs";
import { PluginTwitchApi } from "./plugins/twitchApi.mjs";
import { PluginTwitchChat } from "./plugins/twitchChat.mjs";
import { TwitchBadgeLevel } from "../twitch.mjs";
// Type imports
import type { CustomCommand } from "../customCommandsBroadcasts/customCommand.mjs";
import type { DeepReadonlyArray } from "../other/types.mjs";

const defaultExampleCommandValues = Object.freeze({
  count: 0,
  userLevel: TwitchBadgeLevel.NONE,
});

export const customCommandsInformation: DeepReadonlyArray<CustomCommand> = [
  {
    ...defaultExampleCommandValues,
    description: `Reply > ${PluginTwitchChat.USER}`,
    id: "ping",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " pong",
    ]),
    regex: convertRegexToString(/^\s*!ping(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    description: `Random numbers > ${pluginRandomNumber.id}`,
    id: "random",
    message: createMessageParserMessage([
      { args: "0<->100", name: pluginRandomNumber.id, type: "plugin" },
      "%",
    ]),
    regex: convertRegexToString(/^\s*!random(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    description: `Count command calls > ${pluginCountGenerator.id}`,
    id: "count",
    message: createMessageParserMessage([
      "the test command was called ",
      { name: pluginCountGenerator.id, type: "plugin" },
      " time",
      {
        args: [{ name: pluginCountGenerator.id, type: "plugin" }, ">1"],
        name: pluginIfGreater.id,
        scope: "s",
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!count(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    cooldownInS: 30,
    description: "Add a cooldown to a command",
    id: "cooldown",
    message: createMessageParserMessage([
      "This command can only be executed every 30s",
    ]),
    regex: convertRegexToString(/^\s*!cooldown(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    count: 20,
    description: `Reference parts of a message > ${pluginRegexGroupId},${pluginIfNotUndefined.id}`,
    id: "references",
    message: createMessageParserMessage([
      "Detected the command !regex with ",
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          // eslint-disable-next-line prettier/prettier
          "\"",
          { args: "1", name: pluginRegexGroupId, type: "plugin" },
          // eslint-disable-next-line prettier/prettier
          "\" as query",
        ],
        type: "plugin",
      },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfUndefined.id,
        scope: "no query after the command :(",
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!regex(?:\s+(.*?)\s*$|\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    description: `Use Twitch API for more specific shoutouts > ${pluginRegexGroupId},${PluginTwitchApi.GET_GAME}`,
    id: "shoutout",
    message: createMessageParserMessage([
      "/announce Go check out ",
      { args: "1", name: pluginRegexGroupId, type: "plugin" },
      " at https://www.twitch.tv/",
      { args: "1", name: pluginRegexGroupId, type: "plugin" },
      " <3 They were last playing ",
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: PluginTwitchApi.GET_GAME,
        type: "plugin",
      },
    ]),
    // TODO double check regex later
    regex: convertRegexToString(/^\s*!so\s+@?(\S+)\s*(?:.*)$/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Use Twitch API to get the follow age > ${pluginRegexGroupId},${PluginTwitchApi.GET_FOLLOW_AGE},${pluginTimeInSToHumanReadableStringShort.id}`,
    id: "followage",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          " ",
          { args: "1", name: pluginRegexGroupId, type: "plugin" },
          " followed the channel since ",
          {
            args: {
              args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
              name: PluginTwitchApi.GET_FOLLOW_AGE,
              type: "plugin",
            },
            name: pluginTimeInSToHumanReadableStringShort.id,
            type: "plugin",
          },
        ],
        type: "plugin",
      },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfUndefined.id,
        scope: [
          " You followed the channel since ",
          {
            args: {
              args: { name: PluginTwitchChat.USER, type: "plugin" },
              name: PluginTwitchApi.GET_FOLLOW_AGE,
              type: "plugin",
            },
            name: pluginTimeInSToHumanReadableStringShort.id,
            type: "plugin",
          },
        ],
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!followage(?:\s+(.*?)\s*$|\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    description: `Use Twitch API to get/set the title > ${pluginRegexGroupId},${PluginTwitchApi.GET_TITLE},${PluginTwitchApi.SET_TITLE} [user:edit:broadcast scope necessary to set the title]`,
    id: "title",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          // eslint-disable-next-line prettier/prettier
          " You updated the title to \"",
          {
            args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
            name: PluginTwitchApi.SET_TITLE,
            type: "plugin",
          },
          // eslint-disable-next-line prettier/prettier
          "\"",
        ],
        type: "plugin",
      },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfUndefined.id,
        scope: [
          // eslint-disable-next-line prettier/prettier
          " The current title is \"",
          { name: PluginTwitchApi.GET_TITLE, type: "plugin" },
          // eslint-disable-next-line prettier/prettier
          "\"",
        ],
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!title(?:\s+(.*?)\s*$|\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Use Twitch API to get/set the game > ${pluginRegexGroupId},${PluginTwitchApi.GET_GAME},${PluginTwitchApi.SET_GAME} [user:edit:broadcast scope necessary to set the game]`,
    id: "game",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " ",
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          // eslint-disable-next-line prettier/prettier
          "You updated the game to \"",
          {
            args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
            name: PluginTwitchApi.SET_GAME,
            type: "plugin",
          },
          // eslint-disable-next-line prettier/prettier
          "\"",
        ],
        type: "plugin",
      },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfUndefined.id,
        scope: [
          // eslint-disable-next-line prettier/prettier
          "The current game is \"",
          { name: PluginTwitchApi.GET_GAME, type: "plugin" },
          // eslint-disable-next-line prettier/prettier
          "\"",
        ],
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!game(?:\s+(.*?)\s*$|\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Use Twitch API to get random chatters > ${PluginTwitchApi.RANDOM_USER}`,
    id: "random_user",
    message: createMessageParserMessage([
      { name: PluginTwitchChat.USER, type: "plugin" },
      " gave ",
      { name: PluginTwitchApi.RANDOM_USER, type: "plugin" },
      " a warm hug",
    ]),
    regex: convertRegexToString(/^\s*!randomHug(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    description: `Death counter that works across commands [1/4] > ${pluginCustomDataId}`,
    id: "death counter add",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " death was added, streamer died ",
      { args: "death+#=1", name: pluginCustomDataId, type: "plugin" },
      " time",
      {
        args: [
          {
            args: "death<#>0",
            name: pluginCustomDataId,
            type: "plugin",
          },
          "!==1",
        ],
        name: pluginIfNotEqual.id,
        scope: "s",
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!death(?:\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Death counter that works across commands [2/4] > ${pluginCustomDataId}`,
    id: "death counter get",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " streamer died ",
      {
        args: "death<#>0",
        name: pluginCustomDataId,
        type: "plugin",
      },
      " time",
      {
        args: [
          {
            args: "death<#>0",
            name: pluginCustomDataId,
            type: "plugin",
          },
          "!==1",
        ],
        name: pluginIfNotEqual.id,
        scope: "s",
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!deaths(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    description: `Death counter that works across commands [3/4] > ${pluginCustomDataId}`,
    id: "death counter set",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " ",
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          // eslint-disable-next-line prettier/prettier
          "deaths were set to \"",
          { args: "1", name: pluginRegexGroupId, type: "plugin" },
          // eslint-disable-next-line prettier/prettier
          "\", streamer died ",
          {
            args: [
              "death#=",
              { args: "1", name: pluginRegexGroupId, type: "plugin" },
            ],
            name: pluginCustomDataId,
            type: "plugin",
          },
        ],
        type: "plugin",
      },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfUndefined.id,
        scope: [
          "deaths were reset to 0, streamer died ",
          {
            args: "death#=0",
            name: pluginCustomDataId,
            type: "plugin",
          },
        ],
        type: "plugin",
      },
      " time",
      {
        args: [
          {
            args: "death<#>0",
            name: pluginCustomDataId,
            type: "plugin",
          },
          "!==1",
        ],
        name: pluginIfNotEqual.id,
        scope: "s",
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!resetDeaths(?:\s+(.*?)\s*$|\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Death counter that works across commands [4/4] > ${pluginCustomDataId}`,
    id: "death counter remove",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " death was removed, streamer died ",
      {
        args: "death-#=1",
        name: pluginCustomDataId,
        type: "plugin",
      },
      " time",
      {
        args: [
          {
            args: "death<#>0",
            name: pluginCustomDataId,
            type: "plugin",
          },
          "!==1",
        ],
        name: pluginIfNotEqual.id,
        scope: "s",
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!removeDeath(?:\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Quote database [1/3] > ${pluginCustomDataListId}`,
    id: "quote list add",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      // eslint-disable-next-line prettier/prettier
      " Quote was added \"",
      {
        args: [
          "quote+=",
          { args: "1", name: pluginRegexGroupId, type: "plugin" },
        ],
        name: pluginCustomDataListId,
        type: "plugin",
      },
      // eslint-disable-next-line prettier/prettier
      "\"",
    ]),
    regex: convertRegexToString(/^\s*!quoteAdd\s+(.*\s*)(?:\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Quote database [2/3] > ${pluginCustomDataListId}`,
    id: "quote list get index or random",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      // eslint-disable-next-line prettier/prettier
      " Quote \"",
      {
        args: {
          args: "1",
          name: pluginRegexGroupId,
          type: "plugin",
        },
        name: pluginIfUndefined.id,
        scope: {
          args: [
            "quote=@=",
            {
              args: [
                "0<-]",
                {
                  args: "quote",
                  name: pluginCustomDataListSizeId,
                  type: "plugin",
                },
              ],
              name: pluginRandomNumber.id,
              type: "plugin",
            },
          ],
          name: pluginCustomDataListId,
          type: "plugin",
        },
        type: "plugin",
      },
      {
        args: {
          args: "1",
          name: pluginRegexGroupId,
          type: "plugin",
        },
        name: pluginIfNotUndefined.id,
        scope: {
          args: [
            "quote=@=",
            {
              args: "1",
              name: pluginRegexGroupId,
              type: "plugin",
            },
          ],
          name: pluginCustomDataListId,
          type: "plugin",
        },
        type: "plugin",
      },
      // eslint-disable-next-line prettier/prettier
      "\"",
    ]),
    // eslint-disable-next-line security/detect-unsafe-regex
    regex: convertRegexToString(/^\s*!quote(?:\s+([0-9]+))?(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    description: `Quote database [3/3] > ${pluginCustomDataListId}`,
    id: "quote list remove index",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " ",
      {
        args: {
          args: "1",
          name: pluginRegexGroupId,
          type: "plugin",
        },
        name: pluginIfUndefined.id,
        scope: "No quote index was found!",
        type: "plugin",
      },
      {
        args: {
          args: "1",
          name: pluginRegexGroupId,
          type: "plugin",
        },
        name: pluginIfNotUndefined.id,
        scope: [
          // eslint-disable-next-line prettier/prettier
          "Removed quote: \"",
          {
            args: [
              "quote-@=",
              {
                args: "1",
                name: pluginRegexGroupId,
                type: "plugin",
              },
            ],
            name: pluginCustomDataListId,
            type: "plugin",
          },
          // eslint-disable-next-line prettier/prettier
          "\"",
        ],
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!quoteRemove\s+([0-9]+)(?:\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Score metrics [1/2] > ${pluginCustomDataListId}`,
    id: "score list",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " ",
      {
        args: {
          args: "1",
          name: pluginRegexGroupId,
          type: "plugin",
        },
        name: pluginIfNotUndefined.id,
        scope: [
          "(added to the scores ",
          {
            args: [
              "scores+#=",
              {
                args: "1",
                name: pluginRegexGroupId,
                type: "plugin",
              },
            ],
            name: pluginCustomDataListId,
            type: "plugin",
          },
          ") ",
        ],
        type: "plugin",
      },
      "sum=",
      {
        args: "scores",
        name: pluginCustomDataListSumId,
        type: "plugin",
      },
      " average=",
      {
        args: "scores",
        name: pluginCustomDataListAverageId,
        type: "plugin",
      },
      " max=",
      {
        args: "scores",
        name: pluginCustomDataListMaxId,
        type: "plugin",
      },
      " min=",
      {
        args: "scores",
        name: pluginCustomDataListMinId,
        type: "plugin",
      },
      " size=",
      {
        args: "scores",
        name: pluginCustomDataListSizeId,
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!scoresAdd\s+(-?[0-9]+)(?:\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `Score metrics [2/2] > ${pluginCustomDataListId}`,
    id: "scores list reset",
    message: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " Scores were reset",
      {
        args: "scores",
        name: pluginCustomDataListClearNumberId,
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!scoresReset(?:\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    description: `List all available macros and plugins for debugging > ${pluginHelp.id}`,
    id: "help",
    message: createMessageParserMessage([
      { name: pluginHelp.id, type: "plugin" },
    ]),
    regex: convertRegexToString(/^\s*!help(?:\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
];
