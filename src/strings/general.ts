// Local imports
import {
  MacroPermissionError,
  macroPermissionError,
} from "../messageParser/macros/general";
import { createMessageForMessageParser } from "../messageParser";
import { PluginTwitchChat } from "../messageParser/plugins/twitchChat";
// Type imports
import type { StringEntry } from "../strings";

export const GENERAL_STRING_ID = "GENERAL";

export const generalUserPermissionError: StringEntry = {
  default: createMessageForMessageParser([
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
  id: `${GENERAL_STRING_ID}_PERMISSION_ERROR`,
};

export const general: StringEntry[] = [generalUserPermissionError];
