import { moonpieDb } from "../../database/moonpieDb";
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
  loggerCommandReply,
} from "../commandHelper";
import { MoonpieCommands } from "../moonpie";
import { secondsToString } from "../../other/timePeriodToString";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * Claim command: Claim a moonpie if no moonpie was claimed in the last 24
 * hours.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param userId Twitch user ID (used for checking the database).
 * @param moonpieDbPath Database file path of the moonpie database.
 * @param logger Logger (used for global logs).
 */
export const commandClaim = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  userId: string | undefined,
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

  // Check if a moonpie entry already exists
  let newMoonpieCount = 1;
  let millisecondsSinceLastClaim = 0;
  let alreadyClaimedAMoonpie = false;
  let newTimestamp = new Date().getTime();
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (await moonpieDb.exists(moonpieDbPath, userId, logger)) {
    const moonpieEntry = await moonpieDb.getMoonpie(
      moonpieDbPath,
      userId,
      logger
    );

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
    await moonpieDb.create(
      moonpieDbPath,
      { id: userId, name: userName },
      logger
    );
  }
  await moonpieDb.update(
    moonpieDbPath,
    {
      id: userId,
      name: userName,
      count: newMoonpieCount,
      timestamp: newTimestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry =
    await moonpieDb.getMoonpieLeaderboardEntry(moonpieDbPath, userId, logger);

  let message = `@${userName} You just claimed a moonpie! You have now ${newMoonpieCount} moonpie${
    newMoonpieCount > 1 ? "s" : ""
  } and are rank ${currentMoonpieLeaderboardEntry.rank} on the leaderboard!!!`;

  if (alreadyClaimedAMoonpie) {
    const ago = `${secondsToString(millisecondsSinceLastClaim / 1000)}`;

    if (userId === "93818178") {
      // Easter egg for the most cute star there is <3
      message = `@${userName} You are the cutest! You have now 6969 moonpies and are rank 1 in my heart! <3`;
    } else {
      message = `@${userName} You already claimed a moonpie for today (${ago} ago)! You have ${newMoonpieCount} moonpie${
        newMoonpieCount > 1 ? "s" : ""
      } and are rank ${
        currentMoonpieLeaderboardEntry.rank
      } on the leaderboard!!!`;
    }
  }

  const sentMessage = await client.say(channel, message);

  loggerCommandReply(
    logger,
    messageId,
    sentMessage,
    `moonpie:${MoonpieCommands.CLAIM}`
  );
};
