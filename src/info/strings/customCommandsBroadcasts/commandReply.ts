// Local imports
import {
  createMessageParserMessage,
  generateMessageParserMessageMacro,
  generateMessageParserMessageReference,
} from "../../../messageParser";
import {
  macroCustomBroadcastInfo,
  MacroCustomBroadcastInfo,
} from "../../macros/customBroadcast";
import {
  MacroCustomCommandInfo,
  macroCustomCommandInfo,
} from "../../macros/customCommands";
import { CUSTOM_COMMANDS_BROADCASTS_STRING_ID } from "../customCommandsBroadcasts";
import { PluginTwitchChat } from "../../plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../../messageParser";

const CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID = `${CUSTOM_COMMANDS_BROADCASTS_STRING_ID}_COMMAND_REPLY`;

export const customCommandsBroadcastsCommandReplyAddCC: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You added a command (ID=",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.ID
    ),
    ",REGEX=",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.REGEX
    ),
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_ADD_CC`,
};
export const customCommandsBroadcastsCommandReplyAddCCAlreadyExists: StringEntry =
  {
    default: createMessageParserMessage([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " A command with the ID '",
      generateMessageParserMessageMacro(
        macroCustomCommandInfo,
        MacroCustomCommandInfo.ID
      ),
      "' already exists!",
    ]),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_ADD_CC_ALREADY_EXISTS`,
  };
export const customCommandsBroadcastsCommandReplyInvalidRegex: StringEntry = {
  default: createMessageParserMessage<MacroCustomCommandInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " The regex '",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.REGEX
    ),
    "' is not valid!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_INVALID_REGEX`,
};
export const customCommandsBroadcastsCommandReplyDelCC: StringEntry = {
  default: createMessageParserMessage<MacroCustomCommandInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You deleted a command (",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.ID
    ),
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_DEL_CC`,
};
export const customCommandsBroadcastsCommandReplyCCNotFound: StringEntry = {
  default: createMessageParserMessage<MacroCustomCommandInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No command with the ID '",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.ID
    ),
    "' was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CC_NOT_FOUND`,
};
export const customCommandsBroadcastsCommandReplyAddCB: StringEntry = {
  default: createMessageParserMessage<MacroCustomBroadcastInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You added a broadcast (ID=",
    generateMessageParserMessageMacro(
      macroCustomBroadcastInfo,
      MacroCustomBroadcastInfo.ID
    ),
    ",CRON_STRING=",
    generateMessageParserMessageMacro(
      macroCustomBroadcastInfo,
      MacroCustomBroadcastInfo.CRON_STRING
    ),
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_ADD_CB`,
};
export const customCommandsBroadcastsCommandReplyAddCBAlreadyExists: StringEntry =
  {
    default: createMessageParserMessage<MacroCustomBroadcastInfo>([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " A broadcast with the ID '",
      generateMessageParserMessageMacro(
        macroCustomBroadcastInfo,
        MacroCustomBroadcastInfo.ID
      ),
      "' already exists!",
    ]),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_ADD_CB_ALREADY_EXISTS`,
  };
export const customCommandsBroadcastsCommandReplyDelCB: StringEntry = {
  default: createMessageParserMessage<MacroCustomBroadcastInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You deleted a broadcast (",
    generateMessageParserMessageMacro(
      macroCustomBroadcastInfo,
      MacroCustomBroadcastInfo.ID
    ),
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_DEL_CB`,
};
export const customCommandsBroadcastsCommandReplyCBNotFound: StringEntry = {
  default: createMessageParserMessage<MacroCustomBroadcastInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No broadcast with the ID '",
    generateMessageParserMessageMacro(
      macroCustomBroadcastInfo,
      MacroCustomBroadcastInfo.ID
    ),
    "' was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CB_NOT_FOUND`,
};
export const customCommandsBroadcastsCommandReplyInvalidCronString: StringEntry =
  {
    default: createMessageParserMessage<MacroCustomBroadcastInfo>([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The cron string '",
      generateMessageParserMessageMacro(
        macroCustomBroadcastInfo,
        MacroCustomBroadcastInfo.CRON_STRING
      ),
      "' is not valid!",
    ]),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_INVALID_CRON_STRING`,
  };

export const customCommandsBroadcastsCommandReplyListCCsPrefix: StringEntry = {
  default: createMessageParserMessage(
    ["@", { name: PluginTwitchChat.USER, type: "plugin" }, " "],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CCS_LIST_PREFIX`,
};

export const customCommandsBroadcastsCommandReplyListCCsEntry: StringEntry = {
  default: createMessageParserMessage<MacroCustomCommandInfo>(
    [
      "'",
      generateMessageParserMessageMacro(
        macroCustomCommandInfo,
        MacroCustomCommandInfo.ID
      ),
      "' (",
      generateMessageParserMessageMacro(
        macroCustomCommandInfo,
        MacroCustomCommandInfo.REGEX
      ),
      ")",
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CCS_LIST_ENTRY`,
};

export const customCommandsBroadcastsCommandReplyListCC: StringEntry = {
  default: createMessageParserMessage(
    [
      generateMessageParserMessageReference(
        customCommandsBroadcastsCommandReplyListCCsPrefix
      ),
      generateMessageParserMessageReference(
        customCommandsBroadcastsCommandReplyListCCsEntry
      ),
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CC_LIST`,
};

export const customCommandsBroadcastsCommandReplyListCBsPrefix: StringEntry = {
  default: createMessageParserMessage(
    ["@", { name: PluginTwitchChat.USER, type: "plugin" }, " "],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CBS_LIST_PREFIX`,
};

export const customCommandsBroadcastsCommandReplyListCBsEntry: StringEntry = {
  default: createMessageParserMessage(
    [
      "'",
      generateMessageParserMessageMacro(
        macroCustomBroadcastInfo,
        MacroCustomBroadcastInfo.ID
      ),
      "' (",
      generateMessageParserMessageMacro(
        macroCustomBroadcastInfo,
        MacroCustomBroadcastInfo.CRON_STRING
      ),
      ")",
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CBS_LIST_ENTRY`,
};

export const customCommandsBroadcastsCommandReplyListCB: StringEntry = {
  default: createMessageParserMessage(
    [
      generateMessageParserMessageReference(
        customCommandsBroadcastsCommandReplyListCBsPrefix
      ),
      generateMessageParserMessageReference(
        customCommandsBroadcastsCommandReplyListCBsEntry
      ),
    ],
    true
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CB_LIST`,
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
  customCommandsBroadcastsCommandReplyListCCsPrefix,
  customCommandsBroadcastsCommandReplyListCCsEntry,
  customCommandsBroadcastsCommandReplyListCC,
  customCommandsBroadcastsCommandReplyListCBsPrefix,
  customCommandsBroadcastsCommandReplyListCBsEntry,
  customCommandsBroadcastsCommandReplyListCB,
  customCommandsBroadcastsCommandReplyCCNotFound,
  customCommandsBroadcastsCommandReplyDelCC,
];
