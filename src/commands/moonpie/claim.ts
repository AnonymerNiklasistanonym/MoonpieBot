import { moonpieDb } from "../../database/moonpieDb";
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { MoonpieCommands, LOG_ID_COMMAND_MOONPIE } from "../moonpie";
import { messageParserById } from "../../messageParser";
import {
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyAlreadyClaimedStar,
  moonpieCommandReplyClaim,
} from "../../strings/moonpie/commandReply";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Macros, Plugins } from "../../messageParser";
import type { Strings } from "../../strings";

/**
 * Claim command: Claim a moonpie if no moonpie was claimed in the last 24
 * hours.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param userId Twitch user ID (used for checking the database).
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param moonpieDbPath Database file path of the moonpie database.
 * @param moonpieClaimCooldownHours The number of hours between moonpie claims.
 * @param logger Logger (used for global logs).
 */
export const commandClaim = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  userId: string | undefined,
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  moonpieDbPath: string,
  moonpieClaimCooldownHours: number,
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
  let msSinceLastClaim = 0;
  let msTillNextClaim = 0;
  const claimCooldownMs = moonpieClaimCooldownHours * 60 * 60 * 1000;
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
    msSinceLastClaim = Math.max(currentTimestamp - moonpieEntry.timestamp, 0);
    msTillNextClaim = Math.max(
      claimCooldownMs + moonpieEntry.timestamp - currentTimestamp,
      0
    );
    logger.debug(
      `millisecondsSinceLastClaim=${currentTimestamp}-${moonpieEntry.timestamp}=${msSinceLastClaim}`
    );

    if (msSinceLastClaim > claimCooldownMs) {
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

  const macros = new Map(globalMacros);
  macros.set(
    "MOONPIE",
    new Map([
      ["COUNT", `${newMoonpieCount}`],
      ["TIME_SINCE_CLAIM_IN_S", `${msSinceLastClaim / 1000}`],
      ["TIME_TILL_NEXT_CLAIM_IN_S", `${msTillNextClaim / 1000}`],
      ["COOLDOWN_HOURS", `${moonpieClaimCooldownHours}`],
      ["LEADERBOARD_RANK", `${currentMoonpieLeaderboardEntry.rank}`],
    ])
  );

  let message = await messageParserById(
    moonpieCommandReplyClaim.id,
    globalStrings,
    globalPlugins,
    macros,
    logger
  );

  if (alreadyClaimedAMoonpie) {
    if (userId === "93818178") {
      // Easter egg for the most cute star there is <3
      message = await messageParserById(
        moonpieCommandReplyAlreadyClaimedStar.id,
        globalStrings,
        globalPlugins,
        macros,
        logger
      );
    } else {
      message = await messageParserById(
        moonpieCommandReplyAlreadyClaimed.id,
        globalStrings,
        globalPlugins,
        macros,
        logger
      );
    }
  }

  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_MOONPIE,
    MoonpieCommands.CLAIM
  );
};
