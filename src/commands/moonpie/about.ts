import {
  errorMessageIdUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import { messageParserById } from "../../messageParser";
import { moonpieCommandReplyAbout } from "../../strings/moonpie/commandReply";
// Type imports
import type { TwitchChatHandler } from "../../twitch";

/**
 * About command: Send the name, version and source code link of the bot.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param tags Twitch chat state (message id, user name, ...).
 * @param _message The current Twitch message.
 * @param _data Chat handler specific data.
 * @param _enabledCommands The commands that were enabled.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for global logs).
 */
export const commandAbout: TwitchChatHandler = async (
  client,
  channel,
  tags,
  _message,
  _data,
  _enabledCommands,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
): Promise<void> => {
  if (tags.id === undefined) {
    throw errorMessageIdUndefined();
  }

  const msg = await messageParserById(
    moonpieCommandReplyAbout.id,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  );
  const sentMsg = await client.say(channel, msg);

  logTwitchMessageCommandReply(
    logger,
    tags.id,
    sentMsg,
    LOG_ID_CHAT_HANDLER_MOONPIE,
    MoonpieCommands.ABOUT
  );
};
