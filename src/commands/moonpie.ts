/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Client } from "tmi.js";
import type { Logger } from "winston";

import {
  create,
  exists,
  getMoonpie,
  update,
  remove,
  getMoonpieLeaderboard,
  getMoonpieLeaderboardEntry,
} from "../moonpiedb/moonpieManager";

// TODO Add in the future the possibility to access the message and return moonpie count for other people

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

  // TODO Moonpie integration

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

export const commandMoonpieSet0 = async (
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

  if (await exists(moonpieDbPath, userId, logger)) {
    await remove(moonpieDbPath, userId, logger);
    await client.say(channel, "ppPoof");
  } else {
    await client.say(channel, "never existed...");
  }
};

export const commandMoonpieSet24 = async (
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

  if (await exists(moonpieDbPath, userId, logger)) {
    const moonpieEntry = await getMoonpie(moonpieDbPath, userId, logger);
    await update(
      moonpieDbPath,
      {
        id: userId,
        name: username,
        count: moonpieEntry.count,
        timestamp: moonpieEntry.timestamp - 24 * 60 * 60 * 1000 + 15 * 1000,
      },
      logger
    );
    await client.say(channel, "back to the future");
  } else {
    await client.say(channel, "never existed...");
  }
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
    .map((a) => `${a.rank}. ${a.name}: ${a.count}`)
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
