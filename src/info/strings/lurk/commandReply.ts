// Local imports
import { MacroWelcomeBack, macroWelcomeBack } from "../../macros/lurk";
import { createMessageParserMessage } from "../../../messageParser";
import { LURK_STRING_ID } from "../lurk";
import { pluginTimeInSToHumanReadableString } from "../../plugins/general";
import { PluginTwitchChat } from "../../plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../../messageParser";

const LURK_COMMAND_REPLY_STRING_ID = `${LURK_STRING_ID}_COMMAND_REPLY`;

export const lurkCommandReplyLurk: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " I see you lurking <3",
  ]),
  id: `${LURK_COMMAND_REPLY_STRING_ID}_LURK`,
};

export const lurkCommandReplyWelcomeBack: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " Welcome back! (you were gone for ",
    {
      args: {
        key: MacroWelcomeBack.LURK_TIME_IN_S,
        name: macroWelcomeBack.id,
        type: "macro",
      },
      name: pluginTimeInSToHumanReadableString.id,
      type: "plugin",
    },
    ")",
  ]),
  id: `${LURK_COMMAND_REPLY_STRING_ID}_WELCOME_BACK`,
};

export const lurkCommandReply: StringEntry[] = [
  lurkCommandReplyLurk,
  lurkCommandReplyWelcomeBack,
];
