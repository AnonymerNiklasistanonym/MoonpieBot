import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { MoonpieCommands, LOG_ID_COMMAND_MOONPIE } from "../moonpie";
import { messageParser } from "../../messageParser";
import { moonpieCommandReplyAbout } from "../../strings/moonpie/commandReply";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Strings } from "../../strings";
import type { Macros, Plugins } from "../../messageParser";

/**
 * About command: Send the name, version and source code link of the bot.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for global logs).
 */
export const commandAbout = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }

  const plugins: Plugins = new Map(globalPlugins);
  plugins.set("USER", () => userName);

  const message = await messageParser(
    globalStrings.get(moonpieCommandReplyAbout.id),
    plugins,
    globalMacros
  );
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_MOONPIE,
    MoonpieCommands.ABOUT
  );
};
