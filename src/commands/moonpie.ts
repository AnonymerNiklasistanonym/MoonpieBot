/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Client } from "tmi.js";
import type { Logger } from "winston";

import {
  create,
  exists,
  getMoonpie,
  update,
  getMoonpieLeaderboard,
  getMoonpieLeaderboardEntry,
  getMoonpieName,
  existsName,
  removeName,
} from "../moonpiedb/moonpieManager";

const secondsToString = (seconds: number) => {
  // The input should never be higher than 24 hours
  const hoursNumber = Math.floor(((seconds % 31536000) % 86400) / 3600);
  const minutesNumber = Math.floor(
    (((seconds % 31536000) % 86400) % 3600) / 60
  );
  const secondsNumber = Math.floor(
    (((seconds % 31536000) % 86400) % 3600) % 60
  );
  if (hoursNumber > 0) {
    return `${hoursNumber} hours, ${minutesNumber} minutes and ${secondsNumber} seconds ago`;
  }
  if (minutesNumber > 0) {
    return `${minutesNumber} minutes and ${secondsNumber} seconds ago`;
  }
  return `${secondsNumber} seconds ago`;
};

export const commandMoonpie = async (
  client: Client,
  channel: string,
  username: string | undefined,
  userId: string | undefined,
  messageId: string | undefined,
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

  // Check if a moonpie entry already exists
  let newMoonpieCount = 1;
  let millisecondsSinceLastClaim = 0;
  let alreadyClaimedAMoonpie = false;
  let newTimestamp = new Date().getTime();
  if (await exists(moonpieDbPath, userId, logger)) {
    const moonpieEntry = await getMoonpie(moonpieDbPath, userId, logger);

    // If a moonpie entry already exists check if a moonpie was redeemed in the last 24 hours
    const currentTimestamp = new Date().getTime();
    millisecondsSinceLastClaim = Math.max(
      currentTimestamp - moonpieEntry.timestamp,
      0
    );
    logger.info(
      `millisecondsSinceLastClaim=${currentTimestamp}-${moonpieEntry.timestamp}=${millisecondsSinceLastClaim}`
    );

    if (millisecondsSinceLastClaim > 24 * 60 * 60 * 1000) {
      newMoonpieCount = moonpieEntry.count + 1;
    } else {
      newMoonpieCount = moonpieEntry.count;
      alreadyClaimedAMoonpie = true;
      newTimestamp = moonpieEntry.timestamp;
    }
  } else {
    await create(moonpieDbPath, { id: userId, name: username }, logger);
  }
  await update(
    moonpieDbPath,
    {
      id: userId,
      name: username,
      count: newMoonpieCount,
      timestamp: newTimestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry = await getMoonpieLeaderboardEntry(
    moonpieDbPath,
    userId,
    logger
  );

  let message = `@${username} You just claimed a moonpie! You have now ${newMoonpieCount} moonpie${
    newMoonpieCount > 1 ? "s" : ""
  } and are rank ${currentMoonpieLeaderboardEntry.rank} on the leaderboard!!!`;

  if (alreadyClaimedAMoonpie) {
    const ago = `${secondsToString(millisecondsSinceLastClaim / 1000)}`;
    message = `@${username} You already claimed a moonpie for today (${ago})! You have ${newMoonpieCount} moonpie${
      newMoonpieCount > 1 ? "s" : ""
    } and are rank ${
      currentMoonpieLeaderboardEntry.rank
    } on the leaderboard!!!`;
  }

  const sentMessage = await client.say(channel, message);
  logger.info(
    `!moonpie: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};

export const commandMoonpieTop15 = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw Error(`Unable to reply to message since ${messageId} is undefined!`);
  }

  const moonpieEntries = await getMoonpieLeaderboard(moonpieDbPath, 15, logger);
  const message = moonpieEntries
    .map((a) => `${a.rank}. ${a.name} (${a.count})`)
    .join(", ");
  await client.say(channel, message);
};

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

export const commandMoonpieLeaderboard = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw Error(`Unable to reply to message since ${messageId} is undefined!`);
  }

  const moonpieEntries = await getMoonpieLeaderboard(moonpieDbPath, 15, logger);
  const message = moonpieEntries
    .map((a) => `${a.rank}. ${a.name}: ${a.count}`)
    .join(", ");

  const sentMessage = await client.say(channel, message);
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

  if (await existsName(moonpieDbPath, usernameMoonpieEntry, logger)) {
    const moonpieEntry = await getMoonpieName(
      moonpieDbPath,
      usernameMoonpieEntry,
      logger
    );

    const currentMoonpieLeaderboardEntry = await getMoonpieLeaderboardEntry(
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
  if (!(await existsName(moonpieDbPath, usernameMoonpieEntry, logger))) {
    throw Error(
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be changed`
    );
  }

  const moonpieEntry = await getMoonpieName(
    moonpieDbPath,
    usernameMoonpieEntry,
    logger
  );
  await update(
    moonpieDbPath,
    {
      id: moonpieEntry.id,
      name: moonpieEntry.name,
      count: countMoonpies,
      timestamp: moonpieEntry.timestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry = await getMoonpieLeaderboardEntry(
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
  if (!(await existsName(moonpieDbPath, usernameMoonpieEntry, logger))) {
    throw Error(
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be changed`
    );
  }

  const moonpieEntry = await getMoonpieName(
    moonpieDbPath,
    usernameMoonpieEntry,
    logger
  );
  await update(
    moonpieDbPath,
    {
      id: moonpieEntry.id,
      name: moonpieEntry.name,
      count: Math.max(moonpieEntry.count + countMoonpies, 0),
      timestamp: moonpieEntry.timestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry = await getMoonpieLeaderboardEntry(
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
  if (!(await existsName(moonpieDbPath, usernameMoonpieEntry, logger))) {
    throw Error(
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be changed`
    );
  }

  const moonpieEntry = await getMoonpieName(
    moonpieDbPath,
    usernameMoonpieEntry,
    logger
  );
  await update(
    moonpieDbPath,
    {
      id: moonpieEntry.id,
      name: moonpieEntry.name,
      count: Math.max(moonpieEntry.count - countMoonpies, 0),
      timestamp: moonpieEntry.timestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry = await getMoonpieLeaderboardEntry(
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
  if (!(await existsName(moonpieDbPath, usernameMoonpieEntry, logger))) {
    throw Error(
      `The user ${usernameMoonpieEntry} has never claimed a moonpie and thus has no entry to be deleted`
    );
  }

  await removeName(moonpieDbPath, usernameMoonpieEntry, logger);

  const message = `@${username} You deleted the entry of the user ${usernameMoonpieEntry}`;

  const sentMessage = await client.say(channel, message);
  logger.info(
    `!moonpie: Successfully replied to message ${messageId}: ${JSON.stringify(
      sentMessage
    )}`
  );
};
