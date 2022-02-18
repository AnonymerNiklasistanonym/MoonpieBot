/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import {
  commandMoonpie,
  commandMoonpieCommands,
  commandMoonpieLeaderboard,
} from "./commands/moonpie";

const logDetectedCommand = (
  logger: Logger,
  tags: ChatUserstate,
  command: string
) => {
  logger.log({
    level: "debug",
    message: `Detected command '${command}' by ${tags?.username} in message ${tags?.id}`,
    section: "twitchClient",
  });
};

export const moonpieChatHandler = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
  databasePath: string,
  logger: Logger
): Promise<void> => {
  const regexMoonpie = /\s*!moonpie(\s*$|\s.*$)/;
  const regexMoonpieClaim = /\s*!moonpie(\s*$|\s.*$)/;
  const regexMoonpieCommands = /\s*!moonpie\s+commands\s*$/;
  const regexMoonpieLeaderboard = /\s*!moonpie\s+leaderboard\s*$/;

  if (message.toLowerCase().match(regexMoonpie)) {
    logDetectedCommand(logger, tags, "!moonpie");
    // > !moonpie commands
    if (message.toLowerCase().match(regexMoonpieCommands)) {
      logDetectedCommand(logger, tags, "!moonpie commands");
      await commandMoonpieCommands(client, channel, tags.id, logger);
      return;
    }
    // > !moonpie leaderboard
    if (message.toLowerCase().match(regexMoonpieLeaderboard)) {
      logDetectedCommand(logger, tags, "!moonpie leaderboard");
      await commandMoonpieLeaderboard(
        client,
        channel,
        tags.id,
        databasePath,
        logger
      );
      return;
    }
    // > !moonpie get $USER
    // TODO
    // > !moonpie set $USER (only broadcaster badge)
    // TODO
    // > !moonpie add $USER $COUNT (only broadcaster badge)
    // TODO
    // > !moonpie remove $USER $COUNT (only broadcaster badge)
    // TODO
    // > !moonpie ($MESSAGE)
    if (message.toLowerCase().match(regexMoonpieClaim)) {
      logDetectedCommand(logger, tags, "!moonpie ($MESSAGE)");
      await commandMoonpie(
        client,
        channel,
        tags.username,
        tags["user-id"],
        tags.id,
        databasePath,
        logger
      );
      return;
    }
  }
};
