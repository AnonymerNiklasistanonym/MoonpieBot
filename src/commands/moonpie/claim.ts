import { LOG_ID_COMMAND_MOONPIE, MoonpieCommands } from "../moonpie";
import {
  MacroMoonpieClaim,
  MacroMoonpieLeaderboardEntry,
  macroMoonpieClaimId,
  macroMoonpieLeaderboardEntryId,
} from "../../messageParser/macros/moonpie";
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import {
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyClaim,
} from "../../strings/moonpie/commandReply";
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
// Type imports
import type { TwitchChatHandler } from "../../twitch";

export interface CommandClaimData {
  /**
   * Database file path of the moonpie database.
   */
  moonpieDbPath: string;
  /**
   * The number of hours between moonpie claims.
   */
  moonpieClaimCooldownHours: number;
}

/**
 * Claim command: Claim a moonpie if no moonpie was claimed in the last 24
 * hours.
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param tags Twitch user state information.
 * @param _message The current Twitch message.
 * @param data The command specific data.
 * @param globalStrings Global message strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Logger (used for global logs).
 */
export const commandClaim: TwitchChatHandler<CommandClaimData> = async (
  client,
  channel,
  tags,
  _message,
  data,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
): Promise<void> => {
  if (tags.id === undefined) {
    throw errorMessageIdUndefined();
  }
  if (tags.username === undefined) {
    throw errorMessageUserNameUndefined();
  }
  if (tags["user-id"] === undefined) {
    throw errorMessageUserIdUndefined();
  }

  // Check if a moonpie entry already exists
  let newMoonpieCount = 1;
  let msSinceLastClaim = 0;
  let msTillNextClaim = 0;
  const claimCooldownMs = data.moonpieClaimCooldownHours * 60 * 60 * 1000;
  let alreadyClaimedAMoonpie = false;
  let newTimestamp = new Date().getTime();
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (await moonpieDb.exists(data.moonpieDbPath, tags["user-id"], logger)) {
    const moonpieEntry = await moonpieDb.getMoonpie(
      data.moonpieDbPath,
      tags["user-id"],
      logger
    );

    // If a moonpie entry already exists check if a moonpie was redeemed in the last 24 hours
    const currentTimestamp = new Date().getTime();
    msSinceLastClaim = Math.max(currentTimestamp - moonpieEntry.timestamp, 0);
    msTillNextClaim = Math.max(
      claimCooldownMs + moonpieEntry.timestamp - currentTimestamp,
      0
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
      data.moonpieDbPath,
      { id: tags["user-id"], name: tags.username },
      logger
    );
  }
  await moonpieDb.update(
    data.moonpieDbPath,
    {
      id: tags["user-id"],
      name: tags.username,
      count: newMoonpieCount,
      timestamp: newTimestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry =
    await moonpieDb.getMoonpieLeaderboardEntry(
      data.moonpieDbPath,
      tags["user-id"],
      logger
    );

  const macros = new Map(globalMacros);
  macros.set(
    macroMoonpieClaimId,
    new Map([
      [MacroMoonpieClaim.TIME_SINCE_CLAIM_IN_S, `${msSinceLastClaim / 1000}`],
      [
        MacroMoonpieClaim.TIME_TILL_NEXT_CLAIM_IN_S,
        `${msTillNextClaim / 1000}`,
      ],
      [MacroMoonpieClaim.COOLDOWN_HOURS, `${data.moonpieClaimCooldownHours}`],
    ])
  );
  macros.set(
    macroMoonpieLeaderboardEntryId,
    new Map([
      [MacroMoonpieLeaderboardEntry.COUNT, `${newMoonpieCount}`],
      [
        MacroMoonpieLeaderboardEntry.RANK,
        `${currentMoonpieLeaderboardEntry.rank}`,
      ],
      [MacroMoonpieLeaderboardEntry.NAME, `${tags.username}`],
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
    message = await messageParserById(
      moonpieCommandReplyAlreadyClaimed.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
  }

  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    tags.id,
    sentMessage,
    LOG_ID_COMMAND_MOONPIE,
    MoonpieCommands.CLAIM
  );
};
