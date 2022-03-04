/*
 * TODO Feature idea: Enable adding osu functionality
 */

// TODO: Get current pp
//       Get current pp from a given account
// TODO: Get recent play
//       Get recent play from a given account

// TODO: Detect beatmaps
//       Detect beatmap links and send them to a user

/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import { commandNp } from "./osu/np";

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

export const regexNp = /^\s*!np(\s*|\s.*)$/i;

export const osuChatHandler = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
  databasePath: string,
  logger: Logger
): Promise<void> => {
  logger.warn(`Delete later: ${databasePath}`);
  // > !np
  if (message.match(regexNp)) {
    logDetectedCommand(logger, tags, "!moonpie np");
    await commandNp(client, channel, tags.id, logger);
    return;
  }
};
