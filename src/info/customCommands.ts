// Local imports
import {
  CustomCommandUserLevel,
  pluginRegexGroupId,
} from "../customCommandsTimers/customCommand";
import {
  pluginCustomCommandDataAddId,
  pluginCustomCommandDataGetId,
  pluginCustomCommandDataRemoveId,
  pluginCustomCommandDataSetId,
  pluginCustomCommandDataSetNumberId,
} from "../messageParser/plugins/customCommand";
import {
  pluginHelp,
  pluginIfGreater,
  pluginIfNotEqual,
  pluginIfNotUndefined,
  pluginIfUndefined,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableStringShort,
} from "../messageParser/plugins/general";
import { createMessageForMessageParser } from "../messageParser";
import { PluginTwitchChat } from "../messageParser/plugins/twitchChat";
import { PluginTwitchApi } from "../messageParser/plugins/twitchApi";
// Type imports
import type { CustomCommand } from "../customCommandsTimers/customCommand";

const channels = ["salk1n616"];

/**
 * This method converts a regex to a string.
 * It will remove all modifiers/flags.
 *
 * @param regex The regex that should be converted to a string.
 * @returns Regex as a string.
 */
const convertRegexToString = (regex: RegExp) => {
  const regexString = regex.toString();
  const indexLastSlash = regexString.lastIndexOf("/");
  return regexString.slice(1, indexLastSlash);
};

export const customCommandsInformation: CustomCommand[] = [
  {
    id: `Reply > ${PluginTwitchChat.USER}`,
    channels,
    message: createMessageForMessageParser([
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      " pong",
    ]),
    regexString: convertRegexToString(/^\s*!ping(?:\s|$)/),
  },
  {
    id: `Random numbers > ${pluginRandomNumber.id}`,
    channels,
    message: createMessageForMessageParser([
      { type: "plugin", name: pluginRandomNumber.id, args: "0<->100" },
      "%",
    ]),
    regexString: convertRegexToString(/^\s*!random(?:\s|$)/),
  },
  {
    id: `Count command calls > ${pluginRegexGroupId}`,
    channels,
    message: createMessageForMessageParser([
      "the test command was called ",
      { type: "plugin", name: pluginRegexGroupId },
      " time",
      {
        type: "plugin",
        name: pluginIfGreater.id,
        args: [{ type: "plugin", name: pluginRegexGroupId }, ">1"],
        scope: "s",
      },
    ]),
    regexString: convertRegexToString(/^\s*!count(?:\s|$)/),
  },
  {
    id: "Add a cooldown to a command",
    channels,
    message: createMessageForMessageParser([
      "This command can only be executed every 30s",
    ]),
    cooldownInS: 30,
    regexString: convertRegexToString(/^\s*!cooldown(?:\s|$)/),
  },
  {
    id: `Reference parts of a message > ${pluginRegexGroupId},${pluginIfNotUndefined.id}`,
    channels,
    count: 20,
    message: createMessageForMessageParser([
      "Detected the command !regex with ",
      {
        type: "plugin",
        name: pluginIfNotUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          "'",
          { type: "plugin", name: pluginRegexGroupId, args: "1" },
          "' as query",
        ],
      },
      {
        type: "plugin",
        name: pluginIfUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: "no query after the command :(",
      },
    ]),
    regexString: convertRegexToString(/^\s*!regex(?:\s+(.*?)\s*$|\s|$)/),
  },
  {
    id: `Use Twitch API for more specific shout outs > ${pluginRegexGroupId},${PluginTwitchApi.GET_GAME}`,
    channels,
    message: createMessageForMessageParser([
      "/announce Go check out ",
      { type: "plugin", name: pluginRegexGroupId, args: "1" },
      " at https://www.twitch.tv/",
      { type: "plugin", name: pluginRegexGroupId, args: "1" },
      " <3 They were last playing ",
      {
        type: "plugin",
        name: PluginTwitchApi.GET_GAME,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
      },
    ]),
    // TODO double check regex later
    regexString: convertRegexToString(/^\s*!so\s+@?(\S+)\s*(?:.*)$/),
    userLevel: CustomCommandUserLevel.MOD,
  },
  {
    id: `Use Twitch API to get the follow age > ${pluginRegexGroupId},${PluginTwitchApi.GET_FOLLOW_AGE},${pluginTimeInSToHumanReadableStringShort.id}`,
    channels,
    message: createMessageForMessageParser([
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      {
        type: "plugin",
        name: pluginIfNotUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          " ",
          { type: "plugin", name: pluginRegexGroupId, args: "1" },
          " followed the channel since ",
          {
            type: "plugin",
            name: pluginTimeInSToHumanReadableStringShort.id,
            args: {
              type: "plugin",
              name: PluginTwitchApi.GET_FOLLOW_AGE,
              args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
            },
          },
        ],
      },
      {
        type: "plugin",
        name: pluginIfUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          " You followed the channel since ",
          {
            type: "plugin",
            name: pluginTimeInSToHumanReadableStringShort.id,
            args: {
              type: "plugin",
              name: PluginTwitchApi.GET_FOLLOW_AGE,
              args: { type: "plugin", name: PluginTwitchChat.USER },
            },
          },
        ],
      },
    ]),
    regexString: convertRegexToString(/^\s*!followage(?:\s+(.*?)\s*$|\s|$)/),
  },
  {
    id: `Use Twitch API to get/set the title > ${pluginRegexGroupId},${PluginTwitchApi.GET_TITLE},${PluginTwitchApi.SET_TITLE} [user:edit:broadcast scope necessary to set the title]`,
    channels,
    message: createMessageForMessageParser([
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      {
        type: "plugin",
        name: pluginIfNotUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          " You updated the title to '",
          {
            type: "plugin",
            name: PluginTwitchApi.SET_TITLE,
            args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
          },
          "'",
        ],
      },
      {
        type: "plugin",
        name: pluginIfUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          " The current title is '",
          {
            type: "plugin",
            name: PluginTwitchApi.GET_TITLE,
          },
          "'",
        ],
      },
    ]),
    regexString: convertRegexToString(/^\s*!title(?:\s+(.*?)\s*$|\s|$)/),
    userLevel: CustomCommandUserLevel.MOD,
  },
  {
    id: `Use Twitch API to get/set the game > ${pluginRegexGroupId},${PluginTwitchApi.GET_GAME},${PluginTwitchApi.SET_GAME} [user:edit:broadcast scope necessary to set the game]`,
    channels,
    message: createMessageForMessageParser([
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      " ",
      {
        type: "plugin",
        name: pluginIfNotUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          "You updated the game to '",
          {
            type: "plugin",
            name: PluginTwitchApi.SET_GAME,
            args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
          },
          "'",
        ],
      },
      {
        type: "plugin",
        name: pluginIfUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          "The current game is '",
          {
            type: "plugin",
            name: PluginTwitchApi.GET_GAME,
          },
          "'",
        ],
      },
    ]),
    regexString: convertRegexToString(/^\s*!game(?:\s+(.*?)\s*$|\s|$)/),
    userLevel: CustomCommandUserLevel.MOD,
  },
  {
    id: `Death counter that works across commands [1/4] > ${pluginCustomCommandDataAddId}`,
    channels,
    message: createMessageForMessageParser([
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      " death was added, streamer died ",
      {
        type: "plugin",
        name: pluginCustomCommandDataAddId,
        args: "death+=1",
      },
      " time",
      {
        type: "plugin",
        name: pluginIfNotEqual.id,
        args: [
          {
            type: "plugin",
            name: pluginCustomCommandDataGetId,
            args: "death<>0",
          },
          "!==1",
        ],
        scope: "s",
      },
    ]),
    regexString: convertRegexToString(/^\s*!death(?:\s|$)/),
    userLevel: CustomCommandUserLevel.MOD,
  },
  {
    id: `Death counter that works across commands [2/4] > ${pluginCustomCommandDataGetId}`,
    channels,
    message: createMessageForMessageParser([
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      " streamer died ",
      {
        type: "plugin",
        name: pluginCustomCommandDataGetId,
        args: "death<>0",
      },
      " time",
      {
        type: "plugin",
        name: pluginIfNotEqual.id,
        args: [
          {
            type: "plugin",
            name: pluginCustomCommandDataGetId,
            args: "death<>0",
          },
          "!==1",
        ],
        scope: "s",
      },
    ]),
    regexString: convertRegexToString(/^\s*!deaths(?:\s|$)/),
  },
  {
    id: `Death counter that works across commands [3/4] > ${pluginCustomCommandDataSetId}`,
    channels,
    message: createMessageForMessageParser([
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      " ",
      {
        type: "plugin",
        name: pluginIfNotUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          "deaths were set to '",
          { type: "plugin", name: pluginRegexGroupId, args: "1" },
          "', streamer died ",
          {
            type: "plugin",
            name: pluginCustomCommandDataSetNumberId,
            args: [
              "death=#=",
              { type: "plugin", name: pluginRegexGroupId, args: "1" },
            ],
          },
        ],
      },
      {
        type: "plugin",
        name: pluginIfUndefined.id,
        args: { type: "plugin", name: pluginRegexGroupId, args: "1" },
        scope: [
          "deaths were reset to 0, streamer died ",
          {
            type: "plugin",
            name: pluginCustomCommandDataSetNumberId,
            args: "death=#=0",
          },
        ],
      },
      " time",
      {
        type: "plugin",
        name: pluginIfNotEqual.id,
        args: [
          {
            type: "plugin",
            name: pluginCustomCommandDataGetId,
            args: "death<>0",
          },
          "!==1",
        ],
        scope: "s",
      },
    ]),
    regexString: convertRegexToString(/^\s*!resetDeaths(?:\s+(.*?)\s*$|\s|$)/),
    userLevel: CustomCommandUserLevel.MOD,
  },
  {
    id: `Death counter that works across commands [4/4] > ${pluginCustomCommandDataRemoveId}`,
    channels,
    message: createMessageForMessageParser([
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      " death was removed, streamer died ",
      {
        type: "plugin",
        name: pluginCustomCommandDataRemoveId,
        args: "death-=1",
      },
      " time",
      {
        type: "plugin",
        name: pluginIfNotEqual.id,
        args: [
          {
            type: "plugin",
            name: pluginCustomCommandDataGetId,
            args: "death<>0",
          },
          "!==1",
        ],
        scope: "s",
      },
    ]),
    regexString: convertRegexToString(/^\s*!removeDeath(?:\s|$)/),
    userLevel: CustomCommandUserLevel.MOD,
  },
  {
    id: `List all available macros and plugins for debugging > ${pluginHelp.id}`,
    channels,
    message: createMessageForMessageParser([
      { type: "plugin", name: pluginHelp.id },
    ]),
    regexString: convertRegexToString(/^\s*!help(?:\s|$)/),
    userLevel: CustomCommandUserLevel.MOD,
  },
];
