// Local imports
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../messageParser/plugins/general";
import { createMessageForMessageParser } from "../../documentation/messageParser";
import { CUSTOM_COMMANDS_BROADCASTS_STRING_ID } from "../customCommandsBroadcasts";
import { generalCommandsNone } from "../general";
import { macroCommandEnabled } from "../../messageParser/macros/commands";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
// Type imports
import type { MessageForMessageElementPlugin } from "../../documentation/messageParser";
import type { StringEntry } from "../../strings";

const CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID = `${CUSTOM_COMMANDS_BROADCASTS_STRING_ID}_COMMANDS`;

export const customCommandsBroadcastsCommandsAddCustomCommand: StringEntry = {
  default: createMessageForMessageParser(
    [
      "!addcc $ID $REGEX MESSAGE (-ul=$USER_LEVEL) (-cd=$COOLDOWN_IN_S) [add custom command]",
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_ADD_CUSTOM_COMMAND`,
};
export const customCommandsBroadcastsCommandsAddCustomBroadcast: StringEntry = {
  default: createMessageForMessageParser(
    ["!addcb $ID $CRON_STRING MESSAGE [add custom broadcast]"],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_ADD_CUSTOM_BROADCAST`,
};
export const customCommandsBroadcastsCommandsEditCustomCommand: StringEntry = {
  default: createMessageForMessageParser(
    ["!editcc $ID $OPTION $OPTION_VALUE [edit command]"],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_EDIT_CUSTOM_COMMAND`,
};
export const customCommandsBroadcastsCommandsEditCustomBroadcast: StringEntry =
  {
    default: createMessageForMessageParser(
      ["!editcb $ID $OPTION $OPTION_VALUE [edit broadcast]"],
      true
    ),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_EDIT_CUSTOM_BROADCAST`,
  };
export const customCommandsBroadcastsCommandsListCustomCommands: StringEntry = {
  default: createMessageForMessageParser(["!listccs [list commands]"], true),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_LIST_CUSTOM_COMMANDS`,
};
export const customCommandsBroadcastsCommandsListCustomBroadcasts: StringEntry =
  {
    default: createMessageForMessageParser(
      ["!listcbs [list broadcasts]"],
      true
    ),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_LIST_CUSTOM_BROADCAST`,
  };
export const customCommandsBroadcastsCommandsDeleteCustomCommand: StringEntry =
  {
    default: createMessageForMessageParser(
      ["!delcc $ID [delete custom command]"],
      true
    ),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_DELETE_CUSTOM_COMMAND`,
  };
export const customCommandsBroadcastsCommandsDeleteCustomBroadcast: StringEntry =
  {
    default: createMessageForMessageParser(
      ["!delcb $ID [delete custom broadcast]"],
      true
    ),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMANDS_STRING_ID}_DELETE_CUSTOM_BROADCAST`,
  };
export const customCommandsBroadcastsCommandsPrefix: StringEntry = {
  default: createMessageForMessageParser(
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
  default: createMessageForMessageParser([
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
