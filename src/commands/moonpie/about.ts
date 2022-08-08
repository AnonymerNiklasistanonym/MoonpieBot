// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import { errorMessageEnabledCommandsUndefined } from "../../commands";
import { messageParserById } from "../../messageParser";
import { moonpieCommandReplyAbout } from "../../strings/moonpie/commandReply";
// Type imports
import type { TwitchMessageCommandHandler } from "../../twitch";

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
export const commandAbout: TwitchMessageCommandHandler = {
  info: {
    id: MoonpieCommands.ABOUT,
    groupId: LOG_ID_CHAT_HANDLER_MOONPIE,
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
  handle: async (
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
};
