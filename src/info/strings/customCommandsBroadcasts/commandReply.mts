// Relative imports
import {
  createMessageParserMessage,
  generateMessageParserMessageMacro,
  generateMessageParserMessageReference,
} from "../../../messageParser.mjs";
import {
  macroCustomBroadcastInfo,
  MacroCustomBroadcastInfo,
} from "../../macros/customBroadcast.mjs";
import {
  MacroCustomCommandBroadcastInfoEdit,
  macroCustomCommandBroadcastInfoEdit,
  MacroCustomCommandInfo,
  macroCustomCommandInfo,
} from "../../macros/customCommands.mjs";
import { CUSTOM_COMMANDS_BROADCASTS_STRING_ID } from "../customCommandsBroadcasts.mjs";
import { pluginIfNotEmpty } from "../../plugins/general.mjs";
import { PluginTwitchChat } from "../../plugins/twitchChat.mjs";
// Type imports
import type { StringEntry } from "../../../messageParser.mjs";

const CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID = `${CUSTOM_COMMANDS_BROADCASTS_STRING_ID}_COMMAND_REPLY`;

export const customCommandsBroadcastsCommandReplyAddCC: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You added a command (ID=",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.ID,
    ),
    ",REGEX=",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.REGEX_OR_UNDEF,
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
        MacroCustomCommandInfo.ID,
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
      MacroCustomCommandInfo.REGEX_OR_UNDEF,
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
      MacroCustomCommandInfo.ID,
    ),
    ")",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_DEL_CC`,
};
export const customCommandsBroadcastsCommandReplyEditCC: StringEntry = {
  default: createMessageParserMessage<
    MacroCustomCommandInfo | MacroCustomCommandBroadcastInfoEdit
  >([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You edited a command (",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.ID,
    ),
    "): ",
    generateMessageParserMessageMacro(
      macroCustomCommandBroadcastInfoEdit,
      MacroCustomCommandBroadcastInfoEdit.OPTION,
    ),
    "='",
    generateMessageParserMessageMacro(
      macroCustomCommandBroadcastInfoEdit,
      MacroCustomCommandBroadcastInfoEdit.OPTION_VALUE,
    ),
    "'",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_EDIT_CC`,
};
export const customCommandsBroadcastsCommandReplyCCNotFound: StringEntry = {
  default: createMessageParserMessage<MacroCustomCommandInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No command with the ID '",
    generateMessageParserMessageMacro(
      macroCustomCommandInfo,
      MacroCustomCommandInfo.ID,
    ),
    "' was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CC_NOT_FOUND`,
};
export const customCommandsBroadcastsCommandReplyCCsNotFound: StringEntry = {
  default: createMessageParserMessage<MacroCustomCommandInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No command was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CCS_NOT_FOUND`,
};
export const customCommandsBroadcastsCommandReplyAddCB: StringEntry = {
  default: createMessageParserMessage<MacroCustomBroadcastInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You added a broadcast (ID=",
    generateMessageParserMessageMacro(
      macroCustomBroadcastInfo,
      MacroCustomBroadcastInfo.ID,
    ),
    ",CRON_STRING=",
    generateMessageParserMessageMacro(
      macroCustomBroadcastInfo,
      MacroCustomBroadcastInfo.CRON_STRING_OR_UNDEF,
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
        MacroCustomBroadcastInfo.ID,
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
      MacroCustomBroadcastInfo.ID,
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
      MacroCustomBroadcastInfo.ID,
    ),
    "' was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CB_NOT_FOUND`,
};
export const customCommandsBroadcastsCommandReplyCBsNotFound: StringEntry = {
  default: createMessageParserMessage<MacroCustomCommandInfo>([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " No broadcast was found!",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CBS_NOT_FOUND`,
};
export const customCommandsBroadcastsCommandReplyInvalidCronString: StringEntry =
  {
    default: createMessageParserMessage<MacroCustomBroadcastInfo>([
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The cron string '",
      generateMessageParserMessageMacro(
        macroCustomBroadcastInfo,
        MacroCustomBroadcastInfo.CRON_STRING_OR_UNDEF,
      ),
      "' is not valid!",
    ]),
    id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_INVALID_CRON_STRING`,
  };

export const customCommandsBroadcastsCommandReplyListCCsPrefix: StringEntry = {
  default: createMessageParserMessage(
    ["@", { name: PluginTwitchChat.USER, type: "plugin" }, " "],
    true,
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CCS_LIST_PREFIX`,
};

export const customCommandsBroadcastsCommandReplyListCCsEntry: StringEntry = {
  default: createMessageParserMessage<MacroCustomCommandInfo>(
    [
      "'",
      generateMessageParserMessageMacro(
        macroCustomCommandInfo,
        MacroCustomCommandInfo.ID,
      ),
      "' /",
      generateMessageParserMessageMacro(
        macroCustomCommandInfo,
        MacroCustomCommandInfo.REGEX_OR_UNDEF,
      ),
      "/i",
      {
        args: generateMessageParserMessageMacro(
          macroCustomCommandInfo,
          MacroCustomCommandInfo.DESCRIPTION_OR_EMPTY,
        ),
        name: pluginIfNotEmpty.id,
        scope: [
          " (",
          generateMessageParserMessageMacro(
            macroCustomCommandInfo,
            MacroCustomCommandInfo.DESCRIPTION_OR_EMPTY,
          ),
          ")",
        ],
        type: "plugin",
      },
    ],
    true,
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CCS_LIST_ENTRY`,
};

export const customCommandsBroadcastsCommandReplyListCC: StringEntry = {
  default: createMessageParserMessage(
    [
      generateMessageParserMessageReference(
        customCommandsBroadcastsCommandReplyListCCsPrefix,
      ),
      generateMessageParserMessageReference(
        customCommandsBroadcastsCommandReplyListCCsEntry,
      ),
    ],
    true,
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CC_LIST`,
};

export const customCommandsBroadcastsCommandReplyEditCB: StringEntry = {
  default: createMessageParserMessage<
    MacroCustomBroadcastInfo | MacroCustomCommandBroadcastInfoEdit
  >([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You edited a broadcast (",
    generateMessageParserMessageMacro(
      macroCustomBroadcastInfo,
      MacroCustomBroadcastInfo.ID,
    ),
    "): ",
    generateMessageParserMessageMacro(
      macroCustomCommandBroadcastInfoEdit,
      MacroCustomCommandBroadcastInfoEdit.OPTION,
    ),
    "='",
    generateMessageParserMessageMacro(
      macroCustomCommandBroadcastInfoEdit,
      MacroCustomCommandBroadcastInfoEdit.OPTION_VALUE,
    ),
    "'",
  ]),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_EDIT_CB`,
};

export const customCommandsBroadcastsCommandReplyListCBsPrefix: StringEntry = {
  default: createMessageParserMessage(
    ["@", { name: PluginTwitchChat.USER, type: "plugin" }, " "],
    true,
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CBS_LIST_PREFIX`,
};

export const customCommandsBroadcastsCommandReplyListCBsEntry: StringEntry = {
  default: createMessageParserMessage<MacroCustomBroadcastInfo>(
    [
      "'",
      generateMessageParserMessageMacro(
        macroCustomBroadcastInfo,
        MacroCustomBroadcastInfo.ID,
      ),
      "' [",
      generateMessageParserMessageMacro(
        macroCustomBroadcastInfo,
        MacroCustomBroadcastInfo.CRON_STRING_OR_UNDEF,
      ),
      "]",
      {
        args: generateMessageParserMessageMacro(
          macroCustomBroadcastInfo,
          MacroCustomBroadcastInfo.DESCRIPTION_OR_EMPTY,
        ),
        name: pluginIfNotEmpty.id,
        scope: [
          " (",
          generateMessageParserMessageMacro(
            macroCustomBroadcastInfo,
            MacroCustomBroadcastInfo.DESCRIPTION_OR_EMPTY,
          ),
          ")",
        ],
        type: "plugin",
      },
    ],
    true,
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CBS_LIST_ENTRY`,
};

export const customCommandsBroadcastsCommandReplyListCB: StringEntry = {
  default: createMessageParserMessage(
    [
      generateMessageParserMessageReference(
        customCommandsBroadcastsCommandReplyListCBsPrefix,
      ),
      generateMessageParserMessageReference(
        customCommandsBroadcastsCommandReplyListCBsEntry,
      ),
    ],
    true,
  ),
  id: `${CUSTOM_COMMANDS_BROADCASTS_COMMAND_REPLY_STRING_ID}_CB_LIST`,
};

export const customCommandsBroadcastsCommandReply: StringEntry[] = [
  customCommandsBroadcastsCommandReplyAddCB,
  customCommandsBroadcastsCommandReplyAddCBAlreadyExists,
  customCommandsBroadcastsCommandReplyAddCC,
  customCommandsBroadcastsCommandReplyAddCCAlreadyExists,
  customCommandsBroadcastsCommandReplyCBNotFound,
  customCommandsBroadcastsCommandReplyCBsNotFound,
  customCommandsBroadcastsCommandReplyCCNotFound,
  customCommandsBroadcastsCommandReplyCCsNotFound,
  customCommandsBroadcastsCommandReplyDelCB,
  customCommandsBroadcastsCommandReplyDelCC,
  customCommandsBroadcastsCommandReplyEditCB,
  customCommandsBroadcastsCommandReplyEditCC,
  customCommandsBroadcastsCommandReplyInvalidCronString,
  customCommandsBroadcastsCommandReplyInvalidRegex,
  customCommandsBroadcastsCommandReplyListCB,
  customCommandsBroadcastsCommandReplyListCBsEntry,
  customCommandsBroadcastsCommandReplyListCBsPrefix,
  customCommandsBroadcastsCommandReplyListCC,
  customCommandsBroadcastsCommandReplyListCCsEntry,
  customCommandsBroadcastsCommandReplyListCCsPrefix,
];
