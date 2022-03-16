import {
  errorMessageIdUndefined,
  loggerCommand,
} from "../commands/commandHelper";
import { parseMessage } from "./parseMessage";
import type { ApiClient } from "@twurple/api";
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";

const logDetectedCommand = (
  logger: Logger,
  tags: ChatUserstate,
  command: string
) => {
  logger.log({
    level: "debug",
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    message: `Detected command '${command}' by ${tags?.username} in message ${tags?.id}`,
    section: "twitchClient",
    subsection: "customCommand",
  });
};

export const checkCustomCommand = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
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
    throw Error(
      `Unable to parse message ${tags.id} since the username is undefined!`
    );
  }

  if (userLevel === "vip") {
    return false;
  }
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(regexString);
  const match = message.match(regex);
  if (!match) {
    return false;
  }

  logDetectedCommand(
    logger,
    tags,
    `!customCommand ${commandName ? commandName : regex.toString()}`
  );
  if (channels.find((a) => a === channel)) {
    const parsedMessage = await parseMessage(
      messageCommand,
      match,
      commandCount,
      tags.username,
      twitchApiClient
    );
    const sentMessage = await client.say(channel, parsedMessage);
    loggerCommand(
      logger,
      `Successfully replied to message ${tags.id}: '${JSON.stringify(
        sentMessage
      )}'`,
      {
        commandId:
          "!customCommand#" + (commandName ? commandName : regex.toString()),
      }
    );
  }
  return true;
};
