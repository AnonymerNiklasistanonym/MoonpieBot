// Local imports
import {
  MacroCustomCommandInfo,
  macroCustomCommandInfo,
} from "../../messageParser/macros/customCommands";
import { createMessageForMessageParser } from "../../documentation/messageParser";
import { CUSTOM_COMMANDS_BROADCASTS_STRING_ID } from "../customCommandsBroadcasts";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../strings";

const CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID = `${CUSTOM_COMMANDS_BROADCASTS_STRING_ID}_COMMAND_REPLY`;

export const customCommandsBroadcastsCommandReplyAddCC: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You added a command (",
    {
      key: MacroCustomCommandInfo.ID,
      name: macroCustomCommandInfo.id,
      type: "macro",
    },
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_ADD_CC`,
};
export const customCommandsBroadcastsCommandReplyAddCCAlreadyExists: StringEntry =
  {
    default: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " A command with the ID '",
      {
        key: MacroCustomCommandInfo.ID,
        name: macroCustomCommandInfo.id,
        type: "macro",
      },
      "' already exists!",
    ]),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_ADD_CC_ALREADY_EXISTS`,
  };
export const customCommandsBroadcastsCommandReplyCCInvalidRegex: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " The regex string '",
    {
      key: MacroCustomCommandInfo.REGEX,
      name: macroCustomCommandInfo.id,
      type: "macro",
    },
    "' is not valid!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CC_INVALID_REGEX`,
};
export const customCommandsBroadcastsCommandReplyDelCC: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You deleted a command (",
    {
      key: MacroCustomCommandInfo.ID,
      name: macroCustomCommandInfo.id,
      type: "macro",
    },
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_DEL_CC`,
};
export const customCommandsBroadcastsCommandReplyCCNotFound: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No custom command with the ID '",
    {
      key: MacroCustomCommandInfo.ID,
      name: macroCustomCommandInfo.id,
      type: "macro",
    },
    "' was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CC_NOT_FOUND`,
};

export const customCommandsBroadcastsCommandReply: StringEntry[] = [
  customCommandsBroadcastsCommandReplyAddCC,
  customCommandsBroadcastsCommandReplyAddCCAlreadyExists,
  customCommandsBroadcastsCommandReplyCCInvalidRegex,
  customCommandsBroadcastsCommandReplyCCNotFound,
  customCommandsBroadcastsCommandReplyDelCC,
];
