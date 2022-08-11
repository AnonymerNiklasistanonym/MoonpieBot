// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import { errorMessageEnabledCommandsUndefined } from "../../error";
import { messageParserById } from "../../messageParser";
import { moonpieCommandReplyAbout } from "../../strings/moonpie/commandReply";
// Type imports
import type { TwitchChatCommandHandler } from "../../twitch";

/**
 * Regex to recognize the `!moonpie about` command.
 *
 * @example
 * ```text
 * !moonpie about
 * ```
 */
export const regexMoonpieAbout = /^\s*!moonpie\s+about(?:\s|$)/i;

/**
 * About command: Send the name, version and source code link of the bot.
 */
export const commandAbout: TwitchChatCommandHandler = {
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
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!message.match(regexMoonpieAbout)) {
      return false;
    }
    if (!enabledCommands.includes(MoonpieCommands.ABOUT)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.ABOUT,
  },
};
