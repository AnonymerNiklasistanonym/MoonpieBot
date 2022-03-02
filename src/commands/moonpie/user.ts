/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Client } from "tmi.js";
import type { Logger } from "winston";

import { moonpieDb } from "../../database/moonpieDb";

export const commandUserGet = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  username: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw Error(`Unable to reply to message since ${messageId} is undefined!`);
  }
  if (username === undefined) {
    throw Error(
      `Unable to claim Moonpie to message ${messageId} since the username is undefined!`
    );
  }
  if (userId === undefined) {
    throw Error(
      `Unable to claim Moonpie of ${username} to message ${messageId} since the userId is undefined!`
    );
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
    message = `@${username} The user ${usernameMoonpieEntry} has ${
      currentMoonpieLeaderboardEntry.count
    } moonpie${
      currentMoonpieLeaderboardEntry.count > 1 ? "s" : ""
    } and is rank ${currentMoonpieLeaderboardEntry.rank} on the leaderboard!`;
  } else {
    message = `@${username} The user ${usernameMoonpieEntry} has never claimed a moonpie!`;
  }

  const sentMessage = await client.say(channel, message);
  logger.info(
    `!moonpie: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};

export const commandUserSetCount = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  username: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
  countMoonpies: number,
  operation: "+" | "-" | "=" = "=",
  isBroadcaster: boolean,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw Error(`Unable to reply to message since ${messageId} is undefined!`);
  }
  if (username === undefined) {
    throw Error(
      `Unable to claim Moonpie to message ${messageId} since the username is undefined!`
    );
  }
  if (userId === undefined) {
    throw Error(
      `Unable to claim Moonpie of ${username} to message ${messageId} since the userId is undefined!`
    );
  }
  if (!isBroadcaster) {
    throw Error(
      `The user ${username} is not a broadcaster and thus is not allowed to use this command`
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
  switch (operation) {
    case "+":
      newCount += countMoonpies;
      break;
    case "-":
      newCount -= countMoonpies;
      break;
    case "=":
      newCount = countMoonpies;
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

  const message = `@${username} You set the number of moonpies of the user ${usernameMoonpieEntry} to ${countMoonpies} moonpie${
    countMoonpies > 1 ? "s" : ""
  } (${operation}${countMoonpies}) and they are now rank ${
    currentMoonpieLeaderboardEntry.rank
  } on the leaderboard!`;

  const sentMessage = await client.say(channel, message);
  logger.info(
    `!moonpie: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};

export const commandUserDelete = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  username: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
  isBroadcaster: boolean,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw Error(`Unable to reply to message since ${messageId} is undefined!`);
  }
  if (username === undefined) {
    throw Error(
      `Unable to claim Moonpie to message ${messageId} since the username is undefined!`
    );
  }
  if (userId === undefined) {
    throw Error(
      `Unable to claim Moonpie of ${username} to message ${messageId} since the userId is undefined!`
    );
  }

  if (!isBroadcaster) {
    throw Error(
      `The user ${username} is not a broadcaster and thus is not allowed to use this command`
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

  const message = `@${username} You deleted the entry of the user ${usernameMoonpieEntry}`;

  const sentMessage = await client.say(channel, message);
  logger.info(
    `!moonpie: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};
