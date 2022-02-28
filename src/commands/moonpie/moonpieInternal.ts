/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Client } from "tmi.js";
import type { Logger } from "winston";

import { moonpieDb } from "../../database/moonpieDb";

export const commandMoonpieCommands = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw Error(`Unable to reply to message since ${messageId} is undefined!`);
  }

  const commands = [
    "!moonpie [claim one moonepie per day]",
    "!moonpie commands [get all available commands]",
    "!moonpie leaderboard [get the top moonpie holder]",
    "!moonpie get $USER [get the moonpie count of a user]",
    "!moonpie set $USER [set moonpies of a user]",
    "!moonpie add $USER [add moonpies to a user]",
    "!moonpie remove $USER $COUNT [remove moonpies of a user]",
    "!moonpie delete $USER [remove a user from the database]",
  ];
  const sentMessage = await client.say(
    channel,
    "The following commands are supported: " + commands.join(", ")
  );
  logger.info(
    `Successfully replied to message ${messageId} with: '${JSON.stringify(
      sentMessage
    )}'`
  );
};

export const commandMoonpieGetUser = async (
  client: Client,
  channel: string,
  username: string | undefined,
  userId: string | undefined,
  messageId: string | undefined,
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

export const commandMoonpieSetUserCount = async (
  client: Client,
  channel: string,
  username: string | undefined,
  userId: string | undefined,
  messageId: string | undefined,
  usernameMoonpieEntry: string,
  countMoonpies: number,
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
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be changed`
    );
  }

  const moonpieEntry = await moonpieDb.getMoonpieName(
    moonpieDbPath,
    usernameMoonpieEntry,
    logger
  );
  await moonpieDb.update(
    moonpieDbPath,
    {
      id: moonpieEntry.id,
      name: moonpieEntry.name,
      count: countMoonpies,
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
  } and they are now rank ${
    currentMoonpieLeaderboardEntry.rank
  } on the leaderboard!`;

  const sentMessage = await client.say(channel, message);
  logger.info(
    `!moonpie: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};

export const commandMoonpieAddUserCount = async (
  client: Client,
  channel: string,
  username: string | undefined,
  userId: string | undefined,
  messageId: string | undefined,
  usernameMoonpieEntry: string,
  countMoonpies: number,
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
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be changed`
    );
  }

  const moonpieEntry = await moonpieDb.getMoonpieName(
    moonpieDbPath,
    usernameMoonpieEntry,
    logger
  );
  await moonpieDb.update(
    moonpieDbPath,
    {
      id: moonpieEntry.id,
      name: moonpieEntry.name,
      count: Math.max(moonpieEntry.count + countMoonpies, 0),
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

  const message = `@${username} You set the number of moonpies of the user ${usernameMoonpieEntry} to ${
    currentMoonpieLeaderboardEntry.count
  } moonpie${
    currentMoonpieLeaderboardEntry.count > 1 ? "s" : ""
  } and they are now rank ${
    currentMoonpieLeaderboardEntry.rank
  } on the leaderboard!`;

  const sentMessage = await client.say(channel, message);
  logger.info(
    `!moonpie: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};

export const commandMoonpieRemoveUserCount = async (
  client: Client,
  channel: string,
  username: string | undefined,
  userId: string | undefined,
  messageId: string | undefined,
  usernameMoonpieEntry: string,
  countMoonpies: number,
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
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be changed`
    );
  }

  const moonpieEntry = await moonpieDb.getMoonpieName(
    moonpieDbPath,
    usernameMoonpieEntry,
    logger
  );
  await moonpieDb.update(
    moonpieDbPath,
    {
      id: moonpieEntry.id,
      name: moonpieEntry.name,
      count: Math.max(moonpieEntry.count - countMoonpies, 0),
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

  const message = `@${username} You set the number of moonpies of the user ${usernameMoonpieEntry} to ${
    currentMoonpieLeaderboardEntry.count
  } moonpie${
    currentMoonpieLeaderboardEntry.count > 1 ? "s" : ""
  } and they are now rank ${
    currentMoonpieLeaderboardEntry.rank
  } on the leaderboard!`;

  const sentMessage = await client.say(channel, message);
  logger.info(
    `!moonpie: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};

export const commandMoonpieDeleteUser = async (
  client: Client,
  channel: string,
  username: string | undefined,
  userId: string | undefined,
  messageId: string | undefined,
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
