// Local imports
import { moonpieDb } from "../../database/moonpieDb";
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  errorMessageUserIdUndefined,
  loggerCommandReply,
} from "../commandHelper";
import { TwitchBadgeLevels } from "../../other/twitchBadgeParser";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { MoonpieCommands, MOONPIE_COMMAND_ID } from "../moonpie";

export const commandUserGet = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }
  if (userId === undefined) {
    throw errorMessageUserIdUndefined();
  }

  let message = "";

  if (await moonpieDb.existsName(moonpieDbPath, usernameMoonpieEntry, logger)) {
    const moonpieEntry = await moonpieDb.getMoonpieName(
      moonpieDbPath,
      usernameMoonpieEntry,
      logger
    );

    const currentMoonpieLeaderboardEntry =
      await moonpieDb.getMoonpieLeaderboardEntry(
        moonpieDbPath,
        moonpieEntry.id,
        logger
      );
    message = `@${userName} The user ${usernameMoonpieEntry} has ${
      currentMoonpieLeaderboardEntry.count
    } moonpie${
      currentMoonpieLeaderboardEntry.count > 1 ? "s" : ""
    } and is rank ${currentMoonpieLeaderboardEntry.rank} on the leaderboard!`;
  } else {
    message = `@${userName} The user ${usernameMoonpieEntry} has never claimed a moonpie!`;
  }

  const sentMessage = await client.say(channel, message);

  loggerCommandReply(
    logger,
    messageId,
    sentMessage,
    MOONPIE_COMMAND_ID,
    MoonpieCommands.GET
  );
};

export const commandUserSetCount = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
  countMoonpies: number,
  operation: "+" | "-" | "=" = "=",
  twitchBadgeLevel: TwitchBadgeLevels,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }
  if (userId === undefined) {
    throw errorMessageUserIdUndefined();
  }

  if (twitchBadgeLevel != TwitchBadgeLevels.BROADCASTER) {
    throw Error(
      `The user ${userName} is not a broadcaster and thus is not allowed to use this command`
    );
  }
  if (!Number.isInteger(countMoonpies)) {
    throw Error(`The given moonpie count ${countMoonpies} is not an integer`);
  }

  // Check if a moonpie entry already exists
  if (
    !(await moonpieDb.existsName(moonpieDbPath, usernameMoonpieEntry, logger))
  ) {
    throw Error(
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be changed`
    );
  }

  const moonpieEntry = await moonpieDb.getMoonpieName(
    moonpieDbPath,
    usernameMoonpieEntry,
    logger
  );
  let newCount = moonpieEntry.count;
  let moonpieCommandId;
  switch (operation) {
    case "+":
      newCount += countMoonpies;
      moonpieCommandId = MoonpieCommands.ADD;
      break;
    case "-":
      newCount -= countMoonpies;
      moonpieCommandId = MoonpieCommands.REMOVE;
      break;
    case "=":
      newCount = countMoonpies;
      moonpieCommandId = MoonpieCommands.SET;
      break;
  }
  if (newCount < 0) {
    newCount = 0;
  }
  await moonpieDb.update(
    moonpieDbPath,
    {
      id: moonpieEntry.id,
      name: moonpieEntry.name,
      count: newCount,
      timestamp: moonpieEntry.timestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry =
    await moonpieDb.getMoonpieLeaderboardEntry(
      moonpieDbPath,
      moonpieEntry.id,
      logger
    );

  const message = `@${userName} You set the number of moonpies of the user ${usernameMoonpieEntry} to ${countMoonpies} moonpie${
    countMoonpies > 1 ? "s" : ""
  } (${operation}${countMoonpies}) and they are now rank ${
    currentMoonpieLeaderboardEntry.rank
  } on the leaderboard!`;

  const sentMessage = await client.say(channel, message);

  loggerCommandReply(
    logger,
    messageId,
    sentMessage,
    MOONPIE_COMMAND_ID,
    moonpieCommandId
  );
};

export const commandUserDelete = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
  twitchBadgeLevel: TwitchBadgeLevels,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }
  if (userId === undefined) {
    throw errorMessageUserIdUndefined();
  }

  if (twitchBadgeLevel != TwitchBadgeLevels.BROADCASTER) {
    throw Error(
      `The user ${userName} is not a broadcaster and thus is not allowed to use this command`
    );
  }

  // Check if a moonpie entry already exists
  if (
    !(await moonpieDb.existsName(moonpieDbPath, usernameMoonpieEntry, logger))
  ) {
    throw Error(
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be deleted`
    );
  }

  await moonpieDb.removeName(moonpieDbPath, usernameMoonpieEntry, logger);

  const message = `@${userName} You deleted the entry of the user ${usernameMoonpieEntry}`;

  const sentMessage = await client.say(channel, message);

  loggerCommandReply(
    logger,
    messageId,
    sentMessage,
    MOONPIE_COMMAND_ID,
    MoonpieCommands.DELETE
  );
};
