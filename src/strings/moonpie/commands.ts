// Local imports
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../messageParser/plugins/general";
import { createMessageForMessageParser } from "../../documentation/messageParser";
import { generalCommandsNone } from "../general";
import { macroCommandEnabled } from "../../messageParser/macros/commands";
import { MOONPIE_STRING_ID } from "../moonpie";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
// Type imports
import type { MessageForMessageElementPlugin } from "../../documentation/messageParser";
import type { StringEntry } from "../../strings";

const MOONPIE_COMMANDS_STRING_ID = `${MOONPIE_STRING_ID}_COMMANDS`;

export const moonpieCommandsClaim: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie [claim one moonpie per day]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_CLAIM`,
};
export const moonpieCommandsLeaderboard: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie leaderboard ($STARTING_RANK)"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_LEADERBOARD`,
};
export const moonpieCommandsGet: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie get $USER [get moonpies of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_GET`,
};
export const moonpieCommandsSet: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie set $USER $COUNT [set moonpies of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_SET`,
};
export const moonpieCommandsAdd: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie add $USER $COUNT [add moonpies to a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_ADD`,
};
export const moonpieCommandsRemove: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie remove $USER $COUNT [remove moonpies of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_REMOVE`,
};
export const moonpieCommandsDelete: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie delete $USER [remove a user from the database]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_DELETE`,
};
export const moonpieCommandsAbout: StringEntry = {
  default: createMessageForMessageParser(["!moonpie about"], true),
  id: `${MOONPIE_COMMANDS_STRING_ID}_ABOUT`,
};
export const moonpieCommandsPrefix: StringEntry = {
  default: createMessageForMessageParser(
    [
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The following Moonpie commands are supported: ",
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_PREFIX`,
};
export const moonpieCommandsString: StringEntry = {
  default: createMessageForMessageParser([
    {
      name: moonpieCommandsPrefix.id,
      type: "reference",
    },
    {
      args: {
        args: {
          args: [
            moonpieCommandsClaim,
            moonpieCommandsLeaderboard,
            moonpieCommandsGet,
            moonpieCommandsSet,
            moonpieCommandsAdd,
            moonpieCommandsRemove,
            moonpieCommandsDelete,
            moonpieCommandsAbout,
          ]
            .map(
              (a): MessageForMessageElementPlugin => ({
                args: {
                  key: a.id,
                  name: macroCommandEnabled.id,
                  type: "macro",
                },
                name: pluginIfTrue.id,
                scope: {
                  name: a.id,
                  type: "reference",
                },
                type: "plugin",
              })
            )
            .reduce<(MessageForMessageElementPlugin | string)[]>(
              (prev, curr) => prev.concat([curr, ";"]),
              []
            ),
          name: pluginListFilterUndefined.id,
          scope: {
            name: generalCommandsNone.id,
            type: "reference",
          },
          type: "plugin",
        },
        name: pluginListSort.id,
        type: "plugin",
      },
      name: pluginListJoinCommaSpace.id,
      type: "plugin",
    },
  ]),
  id: `${MOONPIE_COMMANDS_STRING_ID}_STRING`,
};

export const moonpieCommands: StringEntry[] = [
  moonpieCommandsClaim,
  moonpieCommandsLeaderboard,
  moonpieCommandsGet,
  moonpieCommandsSet,
  moonpieCommandsAdd,
  moonpieCommandsRemove,
  moonpieCommandsDelete,
  moonpieCommandsAbout,
  moonpieCommandsPrefix,
  moonpieCommandsString,
];
