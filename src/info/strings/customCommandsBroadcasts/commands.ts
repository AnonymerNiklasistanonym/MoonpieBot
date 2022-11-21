// Local imports
import {
  CustomCommandsBroadcastsCommands,
  getChatCommandsCustomCommandsBroadcasts,
} from "../../../info/chatCommands";
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../plugins/general";
import { createMessageParserMessage } from "../../../messageParser";
import { createShortCommandDescription } from "../../../chatCommand";
import { CUSTOM_COMMANDS_BROADCASTS_STRING_ID } from "../customCommandsBroadcasts";
import { generalCommandsNone } from "../general";
import { macroCommandEnabled } from "../../macros/commands";
import { PluginTwitchChat } from "../../plugins/twitchChat";
// Type imports
import type { MessageForParserMessagePlugin } from "../../../messageParser";
import type { StringEntry } from "../../../messageParser";

const CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID = `${CUSTOM_COMMANDS_BROADCASTS_STRING_ID}_COMMANDS`;

export const customCommandsBroadcastsCommandsAddCustomCommand: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        CustomCommandsBroadcastsCommands.ADD_CUSTOM_COMMAND,
        getChatCommandsCustomCommandsBroadcasts
      ),
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_ADD_CUSTOM_COMMAND`,
};
export const customCommandsBroadcastsCommandsAddCustomBroadcast: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        CustomCommandsBroadcastsCommands.ADD_CUSTOM_BROADCAST,
        getChatCommandsCustomCommandsBroadcasts
      ),
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_ADD_CUSTOM_BROADCAST`,
};
export const customCommandsBroadcastsCommandsEditCustomCommand: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        CustomCommandsBroadcastsCommands.EDIT_CUSTOM_COMMAND,
        getChatCommandsCustomCommandsBroadcasts
      ),
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_EDIT_CUSTOM_COMMAND`,
};
export const customCommandsBroadcastsCommandsEditCustomBroadcast: StringEntry =
  {
    default: createMessageParserMessage(
      [
        createShortCommandDescription(
          CustomCommandsBroadcastsCommands.EDIT_CUSTOM_BROADCAST,
          getChatCommandsCustomCommandsBroadcasts
        ),
      ],
      true
    ),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_EDIT_CUSTOM_BROADCAST`,
  };
export const customCommandsBroadcastsCommandsListCustomCommands: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        CustomCommandsBroadcastsCommands.LIST_CUSTOM_COMMANDS,
        getChatCommandsCustomCommandsBroadcasts
      ),
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_LIST_CUSTOM_COMMANDS`,
};
export const customCommandsBroadcastsCommandsListCustomBroadcasts: StringEntry =
  {
    default: createMessageParserMessage(
      [
        createShortCommandDescription(
          CustomCommandsBroadcastsCommands.LIST_CUSTOM_BROADCASTS,
          getChatCommandsCustomCommandsBroadcasts
        ),
      ],
      true
    ),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_LIST_CUSTOM_BROADCAST`,
  };
export const customCommandsBroadcastsCommandsDeleteCustomCommand: StringEntry =
  {
    default: createMessageParserMessage(
      [
        createShortCommandDescription(
          CustomCommandsBroadcastsCommands.DELETE_CUSTOM_COMMAND,
          getChatCommandsCustomCommandsBroadcasts
        ),
      ],
      true
    ),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_DELETE_CUSTOM_COMMAND`,
  };
export const customCommandsBroadcastsCommandsDeleteCustomBroadcast: StringEntry =
  {
    default: createMessageParserMessage(
      [
        createShortCommandDescription(
          CustomCommandsBroadcastsCommands.DELETE_CUSTOM_BROADCAST,
          getChatCommandsCustomCommandsBroadcasts
        ),
      ],
      true
    ),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_DELETE_CUSTOM_BROADCAST`,
  };
export const customCommandsBroadcastsCommandsPrefix: StringEntry = {
  default: createMessageParserMessage(
    [
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The following custom commands/broadcasts commands are supported: ",
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_PREFIX`,
};
export const customCommandsBroadcastsCommandsString: StringEntry = {
  default: createMessageParserMessage([
    {
      name: customCommandsBroadcastsCommandsPrefix.id,
      type: "reference",
    },
    {
      args: {
        args: {
          args: [
            customCommandsBroadcastsCommandsAddCustomBroadcast,
            customCommandsBroadcastsCommandsAddCustomCommand,
            customCommandsBroadcastsCommandsEditCustomBroadcast,
            customCommandsBroadcastsCommandsEditCustomCommand,
            customCommandsBroadcastsCommandsDeleteCustomBroadcast,
            customCommandsBroadcastsCommandsDeleteCustomCommand,
            customCommandsBroadcastsCommandsListCustomBroadcasts,
            customCommandsBroadcastsCommandsListCustomCommands,
          ]
            .sort()
            .map(
              (a): MessageForParserMessagePlugin => ({
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
            .reduce<(MessageForParserMessagePlugin | string)[]>(
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
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_STRING`,
};

export const customCommandsBroadcastsCommands: StringEntry[] = [
  customCommandsBroadcastsCommandsAddCustomBroadcast,
  customCommandsBroadcastsCommandsAddCustomCommand,
  customCommandsBroadcastsCommandsDeleteCustomBroadcast,
  customCommandsBroadcastsCommandsDeleteCustomCommand,
  customCommandsBroadcastsCommandsEditCustomBroadcast,
  customCommandsBroadcastsCommandsEditCustomCommand,
  customCommandsBroadcastsCommandsListCustomBroadcasts,
  customCommandsBroadcastsCommandsListCustomCommands,
  customCommandsBroadcastsCommandsPrefix,
  customCommandsBroadcastsCommandsString,
];
