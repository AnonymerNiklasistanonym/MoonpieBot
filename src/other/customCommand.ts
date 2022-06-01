// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandDetected,
  logTwitchMessageCommandReply,
} from "../commands";
import { parseMessage } from "./parseMessage";
import { TwitchBadgeLevels } from "./twitchBadgeParser";
// Type imports
import type { ApiClient } from "@twurple/api";
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * The logging ID of this command.
 */
const LOG_ID_COMMAND_CUSTOM_COMMAND = "custom_command";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_CUSTOM_COMMAND = "custom_command";

export const checkCustomCommand = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
  twitchBadgeLevel: TwitchBadgeLevels,
  channels: string[],
  messageCommand: string,
  regexString: string,
  userLevel: "broadcaster" | "mod" | "vip" | "everyone" | undefined,
  commandName: string | undefined,
  commandCount: number,
  twitchApiClient: ApiClient | undefined,
  logger: Logger
): Promise<boolean> => {
  if (tags.id === undefined) {
    throw errorMessageIdUndefined();
  }
  if (tags.username === undefined) {
    throw errorMessageUserNameUndefined();
  }

  if (userLevel !== undefined) {
    switch (twitchBadgeLevel) {
      case TwitchBadgeLevels.BROADCASTER:
        break;
      case TwitchBadgeLevels.MODERATOR:
        if (userLevel === "broadcaster") {
          return false;
        }
        break;
      case TwitchBadgeLevels.VIP:
        if (userLevel === "broadcaster" || userLevel === "mod") {
          return false;
        }
        break;
      case TwitchBadgeLevels.NONE:
        if (
          userLevel === "broadcaster" ||
          userLevel === "mod" ||
          userLevel === "vip"
        ) {
          return false;
        }
        break;
    }
  }
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(regexString);
  const match = message.match(regex);
  if (!match) {
    return false;
  }

  logTwitchMessageCommandDetected(
    logger,
    tags.id,
    [tags.username ? `#${tags.username}` : "undefined", message],
    LOG_ID_COMMAND_CUSTOM_COMMAND,
    commandName ? commandName : regex.toString(),
    LOG_ID_MODULE_CUSTOM_COMMAND
  );

  if (channels.find((a) => a === channel)) {
    const parsedMessage = await parseMessage(
      messageCommand,
      match,
      commandCount,
      tags.username,
      twitchApiClient,
      tags["user-id"],
      channel
    );
    const sentMessage = await client.say(channel, parsedMessage);

    logTwitchMessageCommandReply(
      logger,
      tags.id,
      sentMessage,
      "custom_command",
      commandName ? commandName : regex.toString()
    );
  }
  return true;
};
