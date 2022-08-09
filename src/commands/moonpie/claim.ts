// Local imports
import {
  errorMessageEnabledCommandsUndefined,
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "../../commands";
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  MacroMoonpieClaim,
  macroMoonpieClaim,
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntry,
} from "../../messageParser/macros/moonpie";
import {
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyClaim,
} from "../../strings/moonpie/commandReply";
import {
  regexMoonpieAdd,
  regexMoonpieDelete,
  regexMoonpieGet,
  regexMoonpieRemove,
  regexMoonpieSet,
} from "./user";
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
import { regexMoonpieAbout } from "./about";
// Type imports
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";
import type { TwitchMessageCommandHandler } from "../../twitch";

/**
 * Regex to recognize the `!moonpie` command.
 *
 * @example
 * ```text
 * !moonpie
 * !moonpie Give me moonpie pls
 * ```
 */
export const regexMoonpieClaim = /^\s*!moonpie(\s*|\s.*)$/i;

export interface CommandClaimData extends CommandGenericDataMoonpieDbPath {
  /**
   * The number of hours between moonpie claims.
   */
  moonpieClaimCooldownHours: number;
}

/**
 * Claim command: Claim a moonpie if no moonpie was claimed in the last 24
 * hours.
 */
export const commandClaim: TwitchMessageCommandHandler<CommandClaimData> = {
  info: {
    id: MoonpieCommands.CLAIM,
    groupId: LOG_ID_CHAT_HANDLER_MOONPIE,
  },
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!enabledCommands.includes(MoonpieCommands.CLAIM)) {
      return false;
    }
    if (!message.match(regexMoonpieClaim)) {
      return false;
    }
    // If regex also matches moonpie about/add/delete/get/remove/set ignore
    if (
      message.match(regexMoonpieAbout) ||
      message.match(regexMoonpieAdd) ||
      message.match(regexMoonpieDelete) ||
      message.match(regexMoonpieGet) ||
      message.match(regexMoonpieRemove) ||
      message.match(regexMoonpieSet)
    ) {
      return false;
    }
    return { data: {} };
  },
  handle: async (
    client,
    channel,
    tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
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
      macroMoonpieClaim.id,
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
      macroMoonpieLeaderboardEntry.id,
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
    return { sentMessage };
  },
};
