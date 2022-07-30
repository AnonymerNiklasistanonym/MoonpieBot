// Local imports
import { moonpieDb } from "../../database/moonpieDb";
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { TwitchBadgeLevels } from "../../other/twitchBadgeParser";
import { LOG_ID_COMMAND_MOONPIE, MoonpieCommands } from "../moonpie";
import { messageParserById } from "../../messageParser";
import {
  moonpieUserDelete,
  moonpieUserGet,
  moonpieUserNeverClaimed,
  moonpieUserPermissionError,
  moonpieUserSet,
  moonpieUserSetNAN,
} from "../../strings/moonpie/user";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Strings } from "../../strings";
import type { Macros, Plugins } from "../../messageParser";

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
      "MOONPIE",
      new Map([
        ["USER", `${usernameMoonpieEntry}`],
        ["COUNT", `${currentMoonpieLeaderboardEntry.count}`],
        ["LEADERBOARD_RANK", `${currentMoonpieLeaderboardEntry.rank}`],
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
    macros.set("MOONPIE", new Map([["USER", `${usernameMoonpieEntry}`]]));
    message = await messageParserById(
      moonpieUserNeverClaimed.id,
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

  if (twitchBadgeLevel != TwitchBadgeLevels.BROADCASTER) {
    const errorMessage = await messageParserById(
      moonpieUserPermissionError.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    throw Error(errorMessage);
  }
  if (!Number.isInteger(countMoonpies)) {
    const macros = new Map(globalMacros);
    macros.set(
      "MOONPIE",
      new Map([
        ["USER", `${usernameMoonpieEntry}`],
        ["SET_COUNT", `${countMoonpies}`],
        ["SET_OPERATION", `${operation}`],
      ])
    );
    const errorMessage = await messageParserById(
      moonpieUserSetNAN.id,
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
    const macros = new Map(globalMacros);
    macros.set("MOONPIE", new Map([["USER", `${usernameMoonpieEntry}`]]));
    const errorMessage = await messageParserById(
      moonpieUserNeverClaimed.id,
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

  const macros = new Map(globalMacros);
  macros.set(
    "MOONPIE",
    new Map([
      ["USER", `${usernameMoonpieEntry}`],
      ["COUNT", `${newCount}`],
      ["LEADERBOARD_RANK", `${currentMoonpieLeaderboardEntry.rank}`],
      ["SET_OPERATION", `${operation}`],
      ["SET_COUNT", `${countMoonpies}`],
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

  if (twitchBadgeLevel != TwitchBadgeLevels.BROADCASTER) {
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
    macros.set("MOONPIE", new Map([["USER", `${usernameMoonpieEntry}`]]));
    const errorMessage = await messageParserById(
      moonpieUserNeverClaimed.id,
      globalStrings,
      globalPlugins,
      macros,
      logger
    );
    throw Error(errorMessage);
  }

  await moonpieDb.removeName(moonpieDbPath, usernameMoonpieEntry, logger);

  const macros = new Map(globalMacros);
  macros.set("MOONPIE", new Map([["USER", `${usernameMoonpieEntry}`]]));
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
