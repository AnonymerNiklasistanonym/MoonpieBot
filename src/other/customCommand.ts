import { loggerCommand } from "../commands/commandHelper";
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
  logger: Logger
): Promise<boolean> => {
  if (userLevel === "vip") {
    return false;
  }
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(regexString, "gi");
  if (!message.match(regex)) {
    console.log(regex);
    return false;
  }

  logDetectedCommand(logger, tags, "!customCommand commands");
  if (channels.find((a) => a === channel)) {
    const sentMessage = await client.say(channel, messageCommand);
    loggerCommand(
      logger,
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Successfully replied to message ${tags.id}: '${JSON.stringify(
        sentMessage
      )}'`,
      { commandId: "!customCommand#" + (commandName ? commandName : "no-name") }
    );
  }
  return true;
};
