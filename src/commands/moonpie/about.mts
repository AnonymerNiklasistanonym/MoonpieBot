// Relative imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/chatCommands.mjs";
import { moonpieCommandReplyAbout } from "../../info/strings/moonpie/commandReply.mjs";
import { regexMoonpieChatHandlerCommandAbout } from "../../info/regex.mjs";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type { EMPTY_OBJECT } from "../../other/types.mjs";

/**
 * About command: Send the name, version and source code link of the bot.
 */
export const commandAbout: ChatMessageHandlerReplyCreator<
  EMPTY_OBJECT,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands
> = {
  createReply: () => ({ messageId: moonpieCommandReplyAbout.id }),
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(MoonpieCommands.ABOUT)) {
      return false;
    }
    if (!message.match(regexMoonpieChatHandlerCommandAbout)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.ABOUT,
  },
};
