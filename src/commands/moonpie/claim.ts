// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "../../error";
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
import {
  macroMoonpieClaim,
  macroMoonpieLeaderboardEntry,
} from "../../messageParser/macros/moonpie";
import {
  moonpieCommandReplyAlreadyClaimed,
  moonpieCommandReplyClaim,
} from "../../strings/moonpie/commandReply";
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
} from "../../info/regex";
import { messageParserById } from "../../messageParser";
import moonpieDb from "../../database/moonpieDb";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { CommandGenericDataMoonpieDbPath } from "../moonpie";

export interface CommandClaimCreateReplyInput
  extends CommandGenericDataMoonpieDbPath {
  /**
   * The number of hours between moonpie claims.
   */
  moonpieClaimCooldownHours: number;
}
export type CommandClaimDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
/**
 * Claim command: Claim a moonpie if no moonpie was claimed in the last 24
 * hours.
 */
export const commandClaim: TwitchChatCommandHandler<
  CommandClaimCreateReplyInput,
  CommandClaimDetectorInput
> = {
  createReply: async (
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
    if (
      await moonpieDb.requests.moonpie.existsEntry(
        data.moonpieDbPath,
        tags["user-id"],
        logger
      )
    ) {
      const moonpieEntry = await moonpieDb.requests.moonpie.getEntry(
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
      await moonpieDb.requests.moonpie.createEntry(
        data.moonpieDbPath,
        { id: tags["user-id"], name: tags.username },
        logger
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
      logger
    );

    const currentMoonpieLeaderboardEntry =
      await moonpieDb.requests.moonpieLeaderboard.getEntry(
        data.moonpieDbPath,
        tags["user-id"],
        logger
      );

    const macros = new Map(globalMacros);
    macros.set(
      macroMoonpieClaim.id,
      new Map(
        macroMoonpieClaim.generate({
          cooldownHours: data.moonpieClaimCooldownHours,
          timeSinceLastClaimInS: msSinceLastClaim / 1000,
          timeTillNextClaimInS: msTillNextClaim / 1000,
        })
      )
    );
    macros.set(
      macroMoonpieLeaderboardEntry.id,
      new Map(
        macroMoonpieLeaderboardEntry.generate({
          count: newMoonpieCount,
          name: tags.username,
          rank: currentMoonpieLeaderboardEntry.rank,
        })
      )
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
