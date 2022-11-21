// Local imports
import {
  createMessageParserMessage,
  generateMessageParserMessageMacro,
  generateMessageParserMessageReference,
} from "../../../messageParser";
import {
  getChatCommandsMoonpie,
  MoonpieCommands,
} from "../../../info/chatCommands";
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../plugins/general";
import { createShortCommandDescription } from "../../../chatCommand";
import { generalCommandsNone } from "../general";
import { macroCommandEnabled } from "../../macros/commands";
import { MOONPIE_STRING_ID } from "../moonpie";
import { PluginTwitchChat } from "../../plugins/twitchChat";
// Type imports
import type { MessageForParserMessagePlugin } from "../../../messageParser";
import type { StringEntry } from "../../../messageParser";

const MOONPIE_COMMANDS_STRING_ID = `${MOONPIE_STRING_ID}_COMMANDS`;

export const moonpieCommandsClaim: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        MoonpieCommands.CLAIM,
        getChatCommandsMoonpie
      ),
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_CLAIM`,
};
export const moonpieCommandsLeaderboard: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        MoonpieCommands.LEADERBOARD,
        getChatCommandsMoonpie
      ),
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_LEADERBOARD`,
};
export const moonpieCommandsGet: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        MoonpieCommands.GET,
        getChatCommandsMoonpie
      ),
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_GET`,
};
export const moonpieCommandsSet: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        MoonpieCommands.SET,
        getChatCommandsMoonpie
      ),
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_SET`,
};
export const moonpieCommandsAdd: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        MoonpieCommands.ADD,
        getChatCommandsMoonpie
      ),
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_ADD`,
};
export const moonpieCommandsRemove: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        MoonpieCommands.REMOVE,
        getChatCommandsMoonpie
      ),
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_REMOVE`,
};
export const moonpieCommandsDelete: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        MoonpieCommands.DELETE,
        getChatCommandsMoonpie
      ),
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_DELETE`,
};
export const moonpieCommandsAbout: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        MoonpieCommands.ABOUT,
        getChatCommandsMoonpie
      ),
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_ABOUT`,
};
export const moonpieCommandsPrefix: StringEntry = {
  default: createMessageParserMessage(
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
  default: createMessageParserMessage([
    generateMessageParserMessageReference(moonpieCommandsPrefix),
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
            .sort()
            .map(
              (a): MessageForParserMessagePlugin => ({
                args: generateMessageParserMessageMacro(
                  macroCommandEnabled,
                  a.id
                ),
                name: pluginIfTrue.id,
                scope: generateMessageParserMessageReference(a),
                type: "plugin",
              })
            )
            .reduce<(MessageForParserMessagePlugin | string)[]>(
              (prev, curr) => prev.concat([curr, ";"]),
              []
            ),
          name: pluginListFilterUndefined.id,
          scope: generateMessageParserMessageReference(generalCommandsNone),
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
