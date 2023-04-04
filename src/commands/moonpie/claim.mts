// Relative imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/chatCommands.mjs";
import {
  macroMoonpieClaim,
  macroMoonpieLeaderboardEntry,
} from "../../info/macros/moonpie.mjs";
import {
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyClaim,
} from "../../info/strings/moonpie/commandReply.mjs";
import {
  regexMoonpieChatHandlerCommandAbout,
  regexMoonpieChatHandlerCommandClaim,
  regexMoonpieChatHandlerCommandCommands,
  regexMoonpieChatHandlerCommandLeaderboard,
  regexMoonpieChatHandlerCommandUserAdd,
  regexMoonpieChatHandlerCommandUserDelete,
  regexMoonpieChatHandlerCommandUserGet,
  regexMoonpieChatHandlerCommandUserRemove,
  regexMoonpieChatHandlerCommandUserSet,
} from "../../info/regex.mjs";
import { generateMacroMapFromMacroGenerator } from "../../messageParser.mjs";
import moonpieDb from "../../database/moonpieDb.mjs";
import { normalizeMacroMap } from "../../messageParser/macrosHelper.mjs";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type { CommandMoonpieGenericDataMoonpieDbPath } from "../moonpie.mjs";

export interface CommandClaimCreateReplyInput
  extends CommandMoonpieGenericDataMoonpieDbPath {
  /**
   * The number of hours between moonpie claims.
   */
  moonpieClaimCooldownHours: number;
}

/**
 * Claim command: Claim a moonpie if no moonpie was claimed in the last 24
 * hours.
 */
export const commandClaim: ChatMessageHandlerReplyCreator<
  CommandClaimCreateReplyInput,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands
> = {
  createReply: async (_channel, tags, data, logger) => {
    // Check if a moonpie entry already exists
    let newMoonpieCount = 1;
    let msSinceLastClaim = 0;
    let msTillNextClaim = 0;
    const claimCooldownMs = data.moonpieClaimCooldownHours * 60 * 60 * 1000;
    let alreadyClaimedAMoonpie = false;
    let newTimestamp = new Date().getTime();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (
      await moonpieDb.requests.moonpie.existsEntry(
        data.moonpieDbPath,
        tags["user-id"],
        logger,
      )
    ) {
      const moonpieEntry = await moonpieDb.requests.moonpie.getEntry(
        data.moonpieDbPath,
        tags["user-id"],
        logger,
      );

      // If a moonpie entry already exists check if a moonpie was redeemed in the last 24 hours
      const currentTimestamp = new Date().getTime();
      msSinceLastClaim = Math.max(currentTimestamp - moonpieEntry.timestamp, 0);
      msTillNextClaim = Math.max(
        claimCooldownMs + moonpieEntry.timestamp - currentTimestamp,
        0,
      );

      if (msSinceLastClaim > claimCooldownMs) {
        newMoonpieCount = moonpieEntry.count + 1;
      } else {
        newMoonpieCount = moonpieEntry.count;
        alreadyClaimedAMoonpie = true;
        newTimestamp = moonpieEntry.timestamp;
      }
    } else {
      await moonpieDb.requests.moonpie.createEntry(
        data.moonpieDbPath,
        { id: tags["user-id"], name: tags.username },
        logger,
      );
    }
    await moonpieDb.requests.moonpie.updateEntry(
      data.moonpieDbPath,
      {
        count: newMoonpieCount,
        id: tags["user-id"],
        name: tags.username,
        timestamp: newTimestamp,
      },
      logger,
    );

    const currentMoonpieLeaderboardEntry =
      await moonpieDb.requests.moonpieLeaderboard.getEntry(
        data.moonpieDbPath,
        tags["user-id"],
        logger,
      );

    return {
      additionalMacros: new Map([
        ...normalizeMacroMap(
          generateMacroMapFromMacroGenerator(
            macroMoonpieClaim,
            {
              cooldownHours: data.moonpieClaimCooldownHours,
              timeSinceLastClaimInS: msSinceLastClaim / 1000,
              timeTillNextClaimInS: msTillNextClaim / 1000,
            },
            logger,
          ),
        ),
        ...normalizeMacroMap(
          generateMacroMapFromMacroGenerator(
            macroMoonpieLeaderboardEntry,
            {
              count: newMoonpieCount,
              name: tags.username,
              rank: currentMoonpieLeaderboardEntry.rank,
            },
            logger,
          ),
        ),
      ]),
      messageId: alreadyClaimedAMoonpie
        ? moonpieCommandReplyAlreadyClaimed.id
        : moonpieCommandReplyClaim.id,
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(MoonpieCommands.CLAIM)) {
      return false;
    }
    if (!message.match(regexMoonpieChatHandlerCommandClaim)) {
      return false;
    }
    // If regex also matches moonpie about/add/delete/get/remove/set ignore
    if (
      message.match(regexMoonpieChatHandlerCommandAbout) ||
      message.match(regexMoonpieChatHandlerCommandCommands) ||
      message.match(regexMoonpieChatHandlerCommandLeaderboard) ||
      message.match(regexMoonpieChatHandlerCommandUserAdd) ||
      message.match(regexMoonpieChatHandlerCommandUserDelete) ||
      message.match(regexMoonpieChatHandlerCommandUserGet) ||
      message.match(regexMoonpieChatHandlerCommandUserRemove) ||
      message.match(regexMoonpieChatHandlerCommandUserSet)
    ) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.CLAIM,
  },
};
