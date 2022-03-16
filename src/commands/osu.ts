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
import type { Client as IrcClient } from "irc";
import type { ChatUserstate, Client } from "tmi.js";
import type { Logger } from "winston";
import { commandBeatmap } from "./osu/beatmap";
import { commandNp } from "./osu/np";
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

export const regexNp = /^\s*!np(\s*|\s.*)$/i;

export const regexRp = /^\s*!rp(\s*|\s.*)$/i;
export const regexRpCustomId = /^\s*!rp\s+([0-9]+)\s*.*$/i;
export const regexRpCustomName = /^\s*!rp\s+(\S+)\s*.*$/i;

export const regexPp = /^\s*!pp(\s*|\s.*)$/i;
export const regexPpCustomId = /^\s*!pp\s+([0-9]+)\s*.*$/i;
export const regexPpCustomName = /^\s*!pp\s+(\S+)\s*.*$/i;

/**
 * Regex that matches the following 2 kinds of URLs in any message:
 * - https://osu.ppy.sh/beatmapsets/1228734#osu/2554945
 * - https://osu.ppy.sh/beatmaps/2587891
 */
export const regexBeatmapUrl =
  /(?:^|.*?\s)https:\/\/osu\.ppy\.sh\/(?:beatmaps\/(\d+)|beatmapsets\/\d+#\S+\/(\d+))(?:(?:\s|,).*?|$)/gi;

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
  enableOsuBeatmapRecognition: undefined | boolean,
  osuIrcBot: (() => IrcClient) | undefined,
  osuIrcRequestTarget: undefined | string,
  logger: Logger
): Promise<void> => {
  // > !np
  if (message.match(regexNp)) {
    logDetectedCommand(logger, tags, "!np");
    await commandNp(
      client,
      channel,
      tags.id,
      osuApiV2Credentials,
      osuDefaultId,
      logger
    );
    return;
  }
  // > !rp
  if (message.match(regexRp)) {
    logDetectedCommand(logger, tags, "!rp");
    const matchId = regexRpCustomId.exec(message);
    const matchName = regexRpCustomName.exec(message);
    console.log(matchId, matchName);
    await commandRp(
      client,
      channel,
      tags.id,
      osuApiV2Credentials,
      osuDefaultId,
      matchId && matchId.length >= 2 ? parseInt(matchId[1]) : undefined,
      matchName && matchName.length >= 2 ? matchName[1] : undefined,
      logger
    );
    return;
  }
  // > !pp
  if (message.match(regexPp)) {
    logDetectedCommand(logger, tags, "!pp");
    const matchId = regexPpCustomId.exec(message);
    const matchName = regexPpCustomName.exec(message);
    console.log(matchId, matchName);
    await commandPp(
      client,
      channel,
      tags.id,
      osuApiV2Credentials,
      osuDefaultId,
      matchId && matchId.length >= 2 ? parseInt(matchId[1]) : undefined,
      matchName && matchName.length >= 2 ? matchName[1] : undefined,
      logger
    );
    return;
  }
  // > Any beatmap link
  if (enableOsuBeatmapRecognition) {
    if (message.match(regexBeatmapUrl)) {
      logDetectedCommand(logger, tags, "beatmap");
      for (const match of [...message.matchAll(regexBeatmapUrl)]) {
        await commandBeatmap(
          client,
          channel,
          tags.id,
          tags.username,
          osuApiV2Credentials,
          osuDefaultId,
          match[1] !== undefined ? parseInt(match[1]) : parseInt(match[2]),
          osuIrcBot,
          osuIrcRequestTarget,
          logger
        );
      }
      return;
    }
  }
};
