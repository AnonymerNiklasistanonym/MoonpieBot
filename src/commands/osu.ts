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
import { commandPp } from "./osu/pp";
import { commandRp } from "./osu/rp";

const logDetectedCommand = (
  logger: Logger,
  tags: ChatUserstate,
  command: string
) => {
  logger.log({
    level: "debug",
    message: `Detected command '${command}' by ${tags?.username} in message ${tags?.id}`,
    section: "twitchClient",
    subsection: "osuChatHandler",
  });
};

export const regexRp = /^\s*!rp(\s*|\s.*)$/i;
export const regexRpCustomId = /^\s*!rp\s+([0-9]+)\s*.*$/i;

export const regexPp = /^\s*!pp(\s*|\s.*)$/i;
export const regexPpCustomId = /^\s*!pp\s+([0-9]+)\s*.*$/i;

export interface OsuApiV2Credentials {
  clientId: number;
  clientSecret: string;
}

export const osuChatHandler = async (
  client: Client,
  channel: string,
  tags: ChatUserstate,
  message: string,
  osuApiV2Credentials: OsuApiV2Credentials,
  osuDefaultId: number,
  logger: Logger
): Promise<void> => {
  // > !rp
  if (message.match(regexRp)) {
    logDetectedCommand(logger, tags, "!rp");
    const match = regexRpCustomId.exec(message);
    await commandRp(
      client,
      channel,
      tags.id,
      osuApiV2Credentials,
      osuDefaultId,
      match && match.length >= 2 ? parseInt(match[1]) : undefined,
      logger
    );
    return;
  }
  // > !pp
  if (message.match(regexPp)) {
    logDetectedCommand(logger, tags, "!pp");
    const match = regexPpCustomId.exec(message);
    await commandPp(
      client,
      channel,
      tags.id,
      osuApiV2Credentials,
      osuDefaultId,
      match && match.length >= 2 ? parseInt(match[1]) : undefined,
      logger
    );
    return;
  }
};
