/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import {
  commandMoonpie,
  commandMoonpieCommands,
  commandMoonpieGetUser,
  commandMoonpieLeaderboard,
  commandMoonpieSetUserCount,
  commandMoonpieAddUserCount,
  commandMoonpieRemoveUserCount,
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
  const regexMoonpie = /\s*!moonpie(\s*$|\s.*$)/i;
  const regexMoonpieClaim = /\s*!moonpie(\s*$|\s.*$)/i;
  const regexMoonpieCommands = /\s*!moonpie\s+commands\s*$/i;
  const regexMoonpieLeaderboard = /\s*!moonpie\s+leaderboard\s*$/i;
  const regexMoonpieGet = /\s*!moonpie\s+get\s+(.*?)\s*$/i;
  const regexMoonpieSet = /\s*!moonpie\s+set\s+(.*?)\s+([0-9]+)\s*$/i;
  const regexMoonpieAdd = /\s*!moonpie\s+add\s+(.*?)\s+([0-9]+)\s*$/i;
  const regexMoonpieRemove = /\s*!moonpie\s+remove\s+(.*?)\s+([0-9]+)\s*$/i;

  if (message.match(regexMoonpie)) {
    logDetectedCommand(logger, tags, "!moonpie");
    // > !moonpie commands
    if (message.match(regexMoonpieCommands)) {
      logDetectedCommand(logger, tags, "!moonpie commands");
      await commandMoonpieCommands(client, channel, tags.id, logger);
      return;
    }
    // > !moonpie leaderboard
    if (message.match(regexMoonpieLeaderboard)) {
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
    if (message.match(regexMoonpieGet)) {
      logDetectedCommand(logger, tags, "!moonpie get $USER");
      const match = regexMoonpieGet.exec(message);
      if (match && match.length >= 2) {
        await commandMoonpieGetUser(
          client,
          channel,
          tags.username,
          tags["user-id"],
          tags.id,
          match[1],
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User was not found for !moonpie get $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie set $USER (only broadcaster badge)
    if (message.match(regexMoonpieSet)) {
      logDetectedCommand(logger, tags, "!moonpie set $USER $COUNT");
      const match = regexMoonpieSet.exec(message);
      if (match && match.length >= 3) {
        await commandMoonpieSetUserCount(
          client,
          channel,
          tags.username,
          tags["user-id"],
          tags.id,
          match[1],
          parseInt(match[2]),
          tags?.badges?.broadcaster === "1",
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User was not found for !moonpie get $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie add $USER $COUNT (only broadcaster badge)
    if (message.match(regexMoonpieAdd)) {
      logDetectedCommand(logger, tags, "!moonpie add $USER $COUNT");
      const match = regexMoonpieAdd.exec(message);
      if (match && match.length >= 3) {
        await commandMoonpieAddUserCount(
          client,
          channel,
          tags.username,
          tags["user-id"],
          tags.id,
          match[1],
          parseInt(match[2]),
          tags?.badges?.broadcaster === "1",
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User was not found for !moonpie get $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie remove $USER $COUNT (only broadcaster badge)
    if (message.match(regexMoonpieRemove)) {
      logDetectedCommand(logger, tags, "!moonpie remove $USER $COUNT");
      const match = regexMoonpieRemove.exec(message);
      if (match && match.length >= 3) {
        await commandMoonpieRemoveUserCount(
          client,
          channel,
          tags.username,
          tags["user-id"],
          tags.id,
          match[1],
          parseInt(match[2]),
          tags?.badges?.broadcaster === "1",
          databasePath,
          logger
        );
      } else {
        logger.error(
          `User was not found for !moonpie get $USER in message '${message}'`
        );
      }
      return;
    }
    // > !moonpie ($MESSAGE)
    if (message.match(regexMoonpieClaim)) {
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
