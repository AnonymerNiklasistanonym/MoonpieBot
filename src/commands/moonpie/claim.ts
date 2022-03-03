import { moonpieDb } from "../../database/moonpieDb";
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
import { secondsToString } from "../../other/timePeriodToString";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

/**
 * Claim: Claim a moonpie if no moonpie was claimed in the last 24 hours
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param username Twitch username (used for replying to user)
 * @param userId Twitch user ID (used for checking the database)
 * @param moonpieDbPath Database file path of the moonpie database
 * @param logger Logger (used for logging)
 */
export const commandClaim = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  username: string | undefined,
  userId: string | undefined,
  moonpieDbPath: string,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
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
      { id: userId, name: username },
      logger
    );
  }
  await moonpieDb.update(
    moonpieDbPath,
    {
      id: userId,
      name: username,
      count: newMoonpieCount,
      timestamp: newTimestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry =
    await moonpieDb.getMoonpieLeaderboardEntry(moonpieDbPath, userId, logger);

  let message = `@${username} You just claimed a moonpie! You have now ${newMoonpieCount} moonpie${
    newMoonpieCount > 1 ? "s" : ""
  } and are rank ${currentMoonpieLeaderboardEntry.rank} on the leaderboard!!!`;

  if (alreadyClaimedAMoonpie) {
    const ago = `${secondsToString(millisecondsSinceLastClaim / 1000)}`;

    if (userId === "93818178") {
      // Easter egg for the most cute star there is <3
      message = `@${username} You are the cutest! You have now 6969 moonpies and are rank 1 in my heart! <3`;
    } else {
      message = `@${username} You already claimed a moonpie for today (${ago} ago)! You have ${newMoonpieCount} moonpie${
        newMoonpieCount > 1 ? "s" : ""
      } and are rank ${
        currentMoonpieLeaderboardEntry.rank
      } on the leaderboard!!!`;
    }
  }

  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "moonpieClaim" }
  );
};
