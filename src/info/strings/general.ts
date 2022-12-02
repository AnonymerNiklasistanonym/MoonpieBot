// Local imports
import { MacroPermissionError, macroPermissionError } from "../macros/general";
import { createMessageParserMessage } from "../../messageParser";
import { PluginTwitchChat } from "../plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../messageParser";

const GENERAL_STRING_ID = "GENERAL";

export const generalUserPermissionError: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " You do not have the permission to use this command! (expected ",
    {
      key: MacroPermissionError.EXPECTED,
      name: macroPermissionError.id,
      type: "macro",
    },
    " but found ",
    {
      key: MacroPermissionError.FOUND,
      name: macroPermissionError.id,
      type: "macro",
    },
    ")",
  ]),
  id: `${GENERAL_STRING_ID}_USER_PERMISSION_ERROR`,
};

export const generalCommandsNone: StringEntry = {
  default: createMessageParserMessage(["None"], true),
  id: `${GENERAL_STRING_ID}_COMMANDS_NONE`,
};

export const general: StringEntry[] = [
  generalCommandsNone,
  generalUserPermissionError,
];
