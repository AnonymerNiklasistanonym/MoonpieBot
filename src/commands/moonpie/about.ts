// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import { messageParserById } from "../../messageParser";
import { moonpieCommandReplyAbout } from "../../strings/moonpie/commandReply";
import { regexMoonpieChatHandlerCommandAbout } from "../../info/regex";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { EMPTY_OBJECT } from "../../info/other";

/**
 * About command: Send the name, version and source code link of the bot.
 */
export const commandAbout: TwitchChatCommandHandler<
  EMPTY_OBJECT,
  CommandGenericDetectorInputEnabledCommands
> = {
  createReply: async (
    client,
    channel,
    _tags,
    _data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    const message = await messageParserById(
      moonpieCommandReplyAbout.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
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
