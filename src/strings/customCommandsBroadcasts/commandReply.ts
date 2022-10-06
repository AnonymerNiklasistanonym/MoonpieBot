// Local imports
import {
  macroCustomBroadcastInfo,
  MacroCustomBroadcastInfo,
} from "../../messageParser/macros/customBroadcast";
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
    " You added a command (ID=",
    {
      key: MacroCustomCommandInfo.ID,
      name: macroCustomCommandInfo.id,
      type: "macro",
    },
    ",REGEX=",
    {
      key: MacroCustomCommandInfo.REGEX,
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
export const customCommandsBroadcastsCommandReplyInvalidRegex: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " The regex '",
    {
      key: MacroCustomCommandInfo.REGEX,
      name: macroCustomCommandInfo.id,
      type: "macro",
    },
    "' is not valid!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_INVALID_REGEX`,
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
    " No command with the ID '",
    {
      key: MacroCustomCommandInfo.ID,
      name: macroCustomCommandInfo.id,
      type: "macro",
    },
    "' was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CC_NOT_FOUND`,
};
export const customCommandsBroadcastsCommandReplyAddCB: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You added a broadcast (ID=",
    {
      key: MacroCustomBroadcastInfo.ID,
      name: macroCustomBroadcastInfo.id,
      type: "macro",
    },
    ",CRON_STRING=",
    {
      key: MacroCustomBroadcastInfo.CRON_STRING,
      name: macroCustomBroadcastInfo.id,
      type: "macro",
    },
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_ADD_CB`,
};
export const customCommandsBroadcastsCommandReplyAddCBAlreadyExists: StringEntry =
  {
    default: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " A broadcast with the ID '",
      {
        key: MacroCustomBroadcastInfo.ID,
        name: macroCustomBroadcastInfo.id,
        type: "macro",
      },
      "' already exists!",
    ]),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_ADD_CB_ALREADY_EXISTS`,
  };
export const customCommandsBroadcastsCommandReplyDelCB: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You deleted a broadcast (",
    {
      key: MacroCustomBroadcastInfo.ID,
      name: macroCustomBroadcastInfo.id,
      type: "macro",
    },
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_DEL_CB`,
};
export const customCommandsBroadcastsCommandReplyCBNotFound: StringEntry = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No broadcast with the ID '",
    {
      key: MacroCustomBroadcastInfo.ID,
      name: macroCustomBroadcastInfo.id,
      type: "macro",
    },
    "' was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CB_NOT_FOUND`,
};
export const customCommandsBroadcastsCommandReplyInvalidCronString: StringEntry =
  {
    default: createMessageForMessageParser([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The cron string '",
      {
        key: MacroCustomBroadcastInfo.CRON_STRING,
        name: macroCustomBroadcastInfo.id,
        type: "macro",
      },
      "' is not valid!",
    ]),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_INVALID_CRON_STRING`,
  };

export const customCommandsBroadcastsCommandReply: StringEntry[] = [
  customCommandsBroadcastsCommandReplyAddCB,
  customCommandsBroadcastsCommandReplyAddCBAlreadyExists,
  customCommandsBroadcastsCommandReplyInvalidCronString,
  customCommandsBroadcastsCommandReplyCBNotFound,
  customCommandsBroadcastsCommandReplyDelCB,
  customCommandsBroadcastsCommandReplyAddCC,
  customCommandsBroadcastsCommandReplyAddCCAlreadyExists,
  customCommandsBroadcastsCommandReplyInvalidRegex,
  customCommandsBroadcastsCommandReplyCCNotFound,
  customCommandsBroadcastsCommandReplyDelCC,
];
