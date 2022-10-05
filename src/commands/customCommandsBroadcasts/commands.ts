// Local imports
import {
  CustomCommandsBroadcastsCommands,
  LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
} from "../../info/commands";
import {
  customCommandsBroadcastsCommandsAddCustomBroadcast,
  customCommandsBroadcastsCommandsAddCustomCommand,
  customCommandsBroadcastsCommandsDeleteCustomBroadcast,
  customCommandsBroadcastsCommandsDeleteCustomCommand,
  customCommandsBroadcastsCommandsEditCustomBroadcast,
  customCommandsBroadcastsCommandsEditCustomCommand,
  customCommandsBroadcastsCommandsListCustomBroadcasts,
  customCommandsBroadcastsCommandsListCustomCommands,
  customCommandsBroadcastsCommandsString,
} from "../../strings/customCommandsBroadcasts/commands";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import { macroCommandEnabled } from "../../messageParser/macros/commands";
import { regexCustomCommandsBroadcastsCommands } from "../../info/regex";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";

export type CommandCommandsCreateReplyInput =
  CommandGenericDetectorInputEnabledCommands;
export type CommandCommandsDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
/**
 * Commands command: Send all available commands of the bot in chat.
 */
export const commandCommands: TwitchChatCommandHandler<
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput
> = {
  createReply: (_channel, _tags, data) => {
    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCommandEnabled,
        {
          convertEnumValueToInfo: (enumValue) => {
            const enabled = data.enabledCommands.includes(enumValue);
            switch (enumValue as CustomCommandsBroadcastsCommands) {
              case CustomCommandsBroadcastsCommands.ADD_CUSTOM_BROADCAST:
                return [
                  customCommandsBroadcastsCommandsAddCustomBroadcast.id,
                  enabled,
                ];
              case CustomCommandsBroadcastsCommands.ADD_CUSTOM_COMMAND:
                return [
                  customCommandsBroadcastsCommandsAddCustomCommand.id,
                  enabled,
                ];
              case CustomCommandsBroadcastsCommands.COMMANDS:
                break;
              case CustomCommandsBroadcastsCommands.EDIT_CUSTOM_BROADCAST:
                return [
                  customCommandsBroadcastsCommandsEditCustomBroadcast.id,
                  enabled,
                ];
              case CustomCommandsBroadcastsCommands.EDIT_CUSTOM_COMMAND:
                return [
                  customCommandsBroadcastsCommandsEditCustomCommand.id,
                  enabled,
                ];
              case CustomCommandsBroadcastsCommands.LIST_CUSTOM_BROADCASTS:
                return [
                  customCommandsBroadcastsCommandsListCustomBroadcasts.id,
                  enabled,
                ];
              case CustomCommandsBroadcastsCommands.LIST_CUSTOM_COMMANDS:
                return [
                  customCommandsBroadcastsCommandsListCustomCommands.id,
                  enabled,
                ];
              case CustomCommandsBroadcastsCommands.DELETE_CUSTOM_BROADCAST:
                return [
                  customCommandsBroadcastsCommandsDeleteCustomCommand.id,
                  enabled,
                ];
              case CustomCommandsBroadcastsCommands.DELETE_CUSTOM_COMMAND:
                return [
                  customCommandsBroadcastsCommandsDeleteCustomBroadcast.id,
                  enabled,
                ];
            }
            return ["undefined", false];
          },
          enumValues: Object.values(CustomCommandsBroadcastsCommands),
        }
      ),
      messageId: customCommandsBroadcastsCommandsString.id,
    };
  },
  detect: (_tags, message, data) => {
    if (
      !data.enabledCommands.includes(CustomCommandsBroadcastsCommands.COMMANDS)
    ) {
      return false;
    }
    if (!message.match(regexCustomCommandsBroadcastsCommands)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS,
    id: CustomCommandsBroadcastsCommands.COMMANDS,
  },
};
