// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { LOG_ID_COMMAND_MOONPIE, MoonpieCommands } from "../moonpie";
import {
  MacroMoonpieLeaderboardEntry,
  macroMoonpieLeaderboardEntryId,
  MacroMoonpieUserDelete,
  macroMoonpieUserDeleteId,
  MacroMoonpieUserNeverClaimed,
  macroMoonpieUserNeverClaimedId,
  MacroMoonpieUserSet,
  macroMoonpieUserSetId,
} from "../../messageParser/macros/moonpie";
import {
  moonpieUserDelete,
  moonpieUserGet,
  moonpieUserNeverClaimedError,
  moonpieUserPermissionError,
  moonpieUserSet,
  moonpieUserSetNaNError,
} from "../../strings/moonpie/user";
import { messageParserById } from "../../messageParser";
import { moonpieDb } from "../../database/moonpieDb";
import { TwitchBadgeLevels } from "../../other/twitchBadgeParser";
// Type imports
import type { Macros, Plugins } from "../../messageParser";
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Strings } from "../../strings";

export const commandUserGet = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
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

  let message = "";

  if (await moonpieDb.existsName(moonpieDbPath, usernameMoonpieEntry, logger)) {
    const moonpieEntry = await moonpieDb.getMoonpieName(
      moonpieDbPath,
      usernameMoonpieEntry,
      logger
    );

    const currentMoonpieLeaderboardEntry =
      await moonpieDb.getMoonpieLeaderboardEntry(
        moonpieDbPath,
        moonpieEntry.id,
        logger
      );

    const macros = new Map(globalMacros);
    macros.set(
      macroMoonpieLeaderboardEntryId,
      new Map([
        [MacroMoonpieLeaderboardEntry.NAME, `${usernameMoonpieEntry}`],
        [
          MacroMoonpieLeaderboardEntry.COUNT,
          `${currentMoonpieLeaderboardEntry.count}`,
        ],
        [
          MacroMoonpieLeaderboardEntry.RANK,
          `${currentMoonpieLeaderboardEntry.rank}`,
        ],
      ])
    );
    message = await messageParserById(
      moonpieUserGet.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
  } else {
    const macros = new Map(globalMacros);
    macros.set(
      macroMoonpieUserNeverClaimedId,
      new Map([[MacroMoonpieUserNeverClaimed.NAME, `${usernameMoonpieEntry}`]])
    );
    message = await messageParserById(
      moonpieUserNeverClaimedError.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
  }

  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_MOONPIE,
    MoonpieCommands.GET
  );
};

export const commandUserSetCount = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
  countMoonpies: number,
  operation: "+" | "-" | "=" = "=",
  twitchBadgeLevel: TwitchBadgeLevels,
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

  if (twitchBadgeLevel !== TwitchBadgeLevels.BROADCASTER) {
    const errorMessage = await messageParserById(
      moonpieUserPermissionError.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    throw Error(errorMessage);
  }
  const macros = new Map(globalMacros);
  macros.set(
    macroMoonpieUserSetId,
    new Map([
      [MacroMoonpieUserSet.NAME, `${usernameMoonpieEntry}`],
      [MacroMoonpieUserSet.SET_COUNT, `${countMoonpies}`],
      [MacroMoonpieUserSet.SET_OPERATION, `${operation}`],
    ])
  );
  if (!Number.isInteger(countMoonpies)) {
    const errorMessage = await messageParserById(
      moonpieUserSetNaNError.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
    throw Error(errorMessage);
  }

  // Check if a moonpie entry already exists
  if (
    !(await moonpieDb.existsName(moonpieDbPath, usernameMoonpieEntry, logger))
  ) {
    macros.set(
      macroMoonpieUserNeverClaimedId,
      new Map([[MacroMoonpieUserNeverClaimed.NAME, `${usernameMoonpieEntry}`]])
    );
    const errorMessage = await messageParserById(
      moonpieUserNeverClaimedError.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
    throw Error(errorMessage);
  }

  const moonpieEntry = await moonpieDb.getMoonpieName(
    moonpieDbPath,
    usernameMoonpieEntry,
    logger
  );
  let newCount = moonpieEntry.count;
  let moonpieCommandId;
  switch (operation) {
    case "+":
      newCount += countMoonpies;
      moonpieCommandId = MoonpieCommands.ADD;
      break;
    case "-":
      newCount -= countMoonpies;
      moonpieCommandId = MoonpieCommands.REMOVE;
      break;
    case "=":
      newCount = countMoonpies;
      moonpieCommandId = MoonpieCommands.SET;
      break;
  }
  if (newCount < 0) {
    newCount = 0;
  }
  await moonpieDb.update(
    moonpieDbPath,
    {
      id: moonpieEntry.id,
      name: moonpieEntry.name,
      count: newCount,
      timestamp: moonpieEntry.timestamp,
    },
    logger
  );

  const currentMoonpieLeaderboardEntry =
    await moonpieDb.getMoonpieLeaderboardEntry(
      moonpieDbPath,
      moonpieEntry.id,
      logger
    );

  macros.set(
    macroMoonpieLeaderboardEntryId,
    new Map([
      [MacroMoonpieLeaderboardEntry.NAME, `${usernameMoonpieEntry}`],
      [MacroMoonpieLeaderboardEntry.COUNT, `${newCount}`],
      [
        MacroMoonpieLeaderboardEntry.RANK,
        `${currentMoonpieLeaderboardEntry.rank}`,
      ],
    ])
  );
  const message = await messageParserById(
    moonpieUserSet.id,
    globalStrings,
    globalPlugins,
    macros,
    logger
  );
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_MOONPIE,
    moonpieCommandId
  );
};

export const commandUserDelete = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  userId: string | undefined,
  usernameMoonpieEntry: string,
  twitchBadgeLevel: TwitchBadgeLevels,
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

  if (twitchBadgeLevel !== TwitchBadgeLevels.BROADCASTER) {
    const errorMessage = await messageParserById(
      moonpieUserPermissionError.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    throw Error(errorMessage);
  }

  // Check if a moonpie entry already exists
  if (
    !(await moonpieDb.existsName(moonpieDbPath, usernameMoonpieEntry, logger))
  ) {
    const macros = new Map(globalMacros);
    macros.set(
      macroMoonpieUserNeverClaimedId,
      new Map([[MacroMoonpieUserNeverClaimed.NAME, `${usernameMoonpieEntry}`]])
    );
    const errorMessage = await messageParserById(
      moonpieUserNeverClaimedError.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
    throw Error(errorMessage);
  }

  await moonpieDb.removeName(moonpieDbPath, usernameMoonpieEntry, logger);

  const macros = new Map(globalMacros);
  macros.set(
    macroMoonpieUserDeleteId,
    new Map([[MacroMoonpieUserDelete.NAME, `${usernameMoonpieEntry}`]])
  );
  const message = await messageParserById(
    moonpieUserDelete.id,
    globalStrings,
    globalPlugins,
    macros,
    logger
  );
  const sentMessage = await client.say(channel, message);

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_MOONPIE,
    MoonpieCommands.DELETE
  );
};
