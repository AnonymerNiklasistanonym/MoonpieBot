// Local imports
import {
  pluginCustomCommandDataAddId,
  pluginCustomCommandDataGetId,
  pluginCustomCommandDataRemoveId,
  pluginCustomCommandDataSetId,
  pluginCustomCommandDataSetNumberId,
} from "../messageParser/plugins/customData";
import {
  pluginHelp,
  pluginIfGreater,
  pluginIfNotEqual,
  pluginIfNotUndefined,
  pluginIfUndefined,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableStringShort,
} from "../messageParser/plugins/general";
import { createMessageForMessageParser } from "../documentation/messageParser";
import { pluginRegexGroupId } from "../messageParser/plugins/regexGroup";
import { PluginTwitchApi } from "../messageParser/plugins/twitchApi";
import { PluginTwitchChat } from "../messageParser/plugins/twitchChat";
import { TwitchBadgeLevel } from "../other/twitchBadgeParser";
// Type imports
import type { CustomCommand } from "../customCommandsBroadcasts/customCommand";

const defaultExampleCommandValues = {
  count: 0,
  userLevel: TwitchBadgeLevel.NONE,
};

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
    ...defaultExampleCommandValues,
    id: `Reply > ${PluginTwitchChat.USER}`,
    message: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " pong",
    ]),
    regex: convertRegexToString(/^\s*!ping(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    id: `Random numbers > ${pluginRandomNumber.id}`,
    message: createMessageForMessageParser([
      { args: "0<->100", name: pluginRandomNumber.id, type: "plugin" },
      "%",
    ]),
    regex: convertRegexToString(/^\s*!random(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    id: `Count command calls > ${pluginRegexGroupId}`,
    message: createMessageForMessageParser([
      "the test command was called ",
      { name: pluginRegexGroupId, type: "plugin" },
      " time",
      {
        args: [{ name: pluginRegexGroupId, type: "plugin" }, ">1"],
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
    id: "Add a cooldown to a command",
    message: createMessageForMessageParser([
      "This command can only be executed every 30s",
    ]),
    regex: convertRegexToString(/^\s*!cooldown(?:\s|$)/),
  },
  {
    ...defaultExampleCommandValues,
    count: 20,
    id: `Reference parts of a message > ${pluginRegexGroupId},${pluginIfNotUndefined.id}`,
    message: createMessageForMessageParser([
      "Detected the command !regex with ",
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          "'",
          { args: "1", name: pluginRegexGroupId, type: "plugin" },
          "' as query",
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
    id: `Use Twitch API for more specific shout outs > ${pluginRegexGroupId},${PluginTwitchApi.GET_GAME}`,
    message: createMessageForMessageParser([
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
    id: `Use Twitch API to get the follow age > ${pluginRegexGroupId},${PluginTwitchApi.GET_FOLLOW_AGE},${pluginTimeInSToHumanReadableStringShort.id}`,
    message: createMessageForMessageParser([
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
    id: `Use Twitch API to get/set the title > ${pluginRegexGroupId},${PluginTwitchApi.GET_TITLE},${PluginTwitchApi.SET_TITLE} [user:edit:broadcast scope necessary to set the title]`,
    message: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          " You updated the title to '",
          {
            args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
            name: PluginTwitchApi.SET_TITLE,
            type: "plugin",
          },
          "'",
        ],
        type: "plugin",
      },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfUndefined.id,
        scope: [
          " The current title is '",
          { name: PluginTwitchApi.GET_TITLE, type: "plugin" },
          "'",
        ],
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!title(?:\s+(.*?)\s*$|\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    id: `Use Twitch API to get/set the game > ${pluginRegexGroupId},${PluginTwitchApi.GET_GAME},${PluginTwitchApi.SET_GAME} [user:edit:broadcast scope necessary to set the game]`,
    message: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " ",
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          "You updated the game to '",
          {
            args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
            name: PluginTwitchApi.SET_GAME,
            type: "plugin",
          },
          "'",
        ],
        type: "plugin",
      },
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfUndefined.id,
        scope: [
          "The current game is '",
          { name: PluginTwitchApi.GET_GAME, type: "plugin" },
          "'",
        ],
        type: "plugin",
      },
    ]),
    regex: convertRegexToString(/^\s*!game(?:\s+(.*?)\s*$|\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
  {
    ...defaultExampleCommandValues,
    id: `Death counter that works across commands [1/4] > ${pluginCustomCommandDataAddId}`,
    message: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " death was added, streamer died ",
      { args: "death+=1", name: pluginCustomCommandDataAddId, type: "plugin" },
      " time",
      {
        args: [
          {
            args: "death<>0",
            name: pluginCustomCommandDataGetId,
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
    id: `Death counter that works across commands [2/4] > ${pluginCustomCommandDataGetId}`,
    message: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " streamer died ",
      {
        args: "death<>0",
        name: pluginCustomCommandDataGetId,
        type: "plugin",
      },
      " time",
      {
        args: [
          {
            args: "death<>0",
            name: pluginCustomCommandDataGetId,
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
    id: `Death counter that works across commands [3/4] > ${pluginCustomCommandDataSetId}`,
    message: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " ",
      {
        args: { args: "1", name: pluginRegexGroupId, type: "plugin" },
        name: pluginIfNotUndefined.id,
        scope: [
          "deaths were set to '",
          { args: "1", name: pluginRegexGroupId, type: "plugin" },
          "', streamer died ",
          {
            args: [
              "death=#=",
              { args: "1", name: pluginRegexGroupId, type: "plugin" },
            ],
            name: pluginCustomCommandDataSetNumberId,
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
            args: "death=#=0",
            name: pluginCustomCommandDataSetNumberId,
            type: "plugin",
          },
        ],
        type: "plugin",
      },
      " time",
      {
        args: [
          {
            args: "death<>0",
            name: pluginCustomCommandDataGetId,
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
    id: `Death counter that works across commands [4/4] > ${pluginCustomCommandDataRemoveId}`,
    message: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " death was removed, streamer died ",
      {
        args: "death-=1",
        name: pluginCustomCommandDataRemoveId,
        type: "plugin",
      },
      " time",
      {
        args: [
          {
            args: "death<>0",
            name: pluginCustomCommandDataGetId,
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
    id: `List all available macros and plugins for debugging > ${pluginHelp.id}`,
    message: createMessageForMessageParser([
      { name: pluginHelp.id, type: "plugin" },
    ]),
    regex: convertRegexToString(/^\s*!help(?:\s|$)/),
    userLevel: TwitchBadgeLevel.MODERATOR,
  },
];
