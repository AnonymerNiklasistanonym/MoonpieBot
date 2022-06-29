import { moonpieDb } from "../../database/moonpieDb";
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { MoonpieCommands, LOG_ID_COMMAND_MOONPIE } from "../moonpie";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { Macros, messageParser, Plugins } from "../../messageParser";
import type { Strings } from "../../strings";
import {
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyAlreadyClaimedStar,
  moonpieCommandReplyClaim,
} from "../../strings/moonpie/commandReply";

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
    logger.debug(
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

  const macros = new Map(globalMacros);
  macros.set(
    "MOONPIE",
    new Map([
      ["COUNT", `${newMoonpieCount}`],
      ["TIME_SINCE_CLAIM_IN_S", `${millisecondsSinceLastClaim / 1000}`],
      ["LEADERBOARD_RANK", `${currentMoonpieLeaderboardEntry.rank}`],
    ])
  );

  let message = await messageParser(
    globalStrings.get(moonpieCommandReplyClaim.id),
    globalPlugins,
    macros,
    logger
  );

  if (alreadyClaimedAMoonpie) {
    if (userId === "93818178") {
      // Easter egg for the most cute star there is <3
      message = await messageParser(
        globalStrings.get(moonpieCommandReplyAlreadyClaimedStar.id),
        globalPlugins,
        macros,
        logger
      );
    } else {
      message = await messageParser(
        globalStrings.get(moonpieCommandReplyAlreadyClaimed.id),
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
