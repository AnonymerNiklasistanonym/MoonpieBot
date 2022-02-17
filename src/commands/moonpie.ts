/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Client } from "tmi.js";
import type { Logger } from "winston";

import {
  create,
  exists,
  getMoonpie,
  update,
  remove,
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
  if (await exists(moonpieDbPath, userId, logger)) {
    const moonpieCount = await getMoonpie(moonpieDbPath, userId, logger);

    // If a moonpie entry already exists check if a moonpie was redeemed in the last 24 hours
    const currentTimestamp = new Date().getTime();
    millisecondsSinceLastClaim = Math.max(
      currentTimestamp - moonpieCount.timestamp,
      0
    );
    logger.info(
      `millisecondsSinceLastClaim=${currentTimestamp}-${moonpieCount.timestamp}=${millisecondsSinceLastClaim}`
    );

    if (millisecondsSinceLastClaim > 24 * 60 * 60 * 1000) {
      newMoonpieCount = moonpieCount.count + 1;
    } else {
      newMoonpieCount = moonpieCount.count;
      alreadyClaimedAMoonpie = true;
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
      timestamp: new Date().getTime(),
    },
    logger
  );

  let message = `@${username} You just claimed a moonpie! You have now ${newMoonpieCount} moonpie${
    newMoonpieCount > 1 ? "s" : ""
  }!!!`;

  if (alreadyClaimedAMoonpie) {
    // TODO Add when the moonpie was redeemed

    const ago = `${secondsToString(millisecondsSinceLastClaim / 1000)}`;
    message = `@${username} You already claimed a moonpie for today (${ago})! You have ${newMoonpieCount} moonpie${
      newMoonpieCount > 1 ? "s" : ""
    }!!!`;
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
