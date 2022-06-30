import {
  errorMessageIdUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { MoonpieCommands, LOG_ID_COMMAND_MOONPIE } from "../moonpie";
import {
  moonpieCommandsAbout,
  moonpieCommandsAdd,
  moonpieCommandsClaim,
  moonpieCommandsDelete,
  moonpieCommandsGet,
  moonpieCommandsLeaderboard,
  moonpieCommandsNone,
  moonpieCommandsPrefix,
  moonpieCommandsRemove,
  moonpieCommandsSet,
} from "../../strings/moonpie/commands";
import { messageParserById } from "../../messageParser";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import type { Strings } from "../../strings";
import type { Macros, Plugins } from "../../messageParser";

export const commandCommands = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  enabled: string[],
  globalStrings: Strings,
  globalPlugins: Plugins,
  globalMacros: Macros,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const commandsStringIds = [];

  if (enabled.includes(MoonpieCommands.CLAIM)) {
    commandsStringIds.push(moonpieCommandsClaim.id);
  }
  if (enabled.includes(MoonpieCommands.LEADERBOARD)) {
    commandsStringIds.push(moonpieCommandsLeaderboard.id);
  }
  if (enabled.includes(MoonpieCommands.GET)) {
    commandsStringIds.push(moonpieCommandsGet.id);
  }
  if (enabled.includes(MoonpieCommands.SET)) {
    commandsStringIds.push(moonpieCommandsSet.id);
  }
  if (enabled.includes(MoonpieCommands.ADD)) {
    commandsStringIds.push(moonpieCommandsAdd.id);
  }
  if (enabled.includes(MoonpieCommands.REMOVE)) {
    commandsStringIds.push(moonpieCommandsRemove.id);
  }
  if (enabled.includes(MoonpieCommands.DELETE)) {
    commandsStringIds.push(moonpieCommandsDelete.id);
  }
  if (enabled.includes(MoonpieCommands.ABOUT)) {
    commandsStringIds.push(moonpieCommandsAbout.id);
  }

  if (commandsStringIds.length === 0) {
    commandsStringIds.push(moonpieCommandsNone.id);
  }

  const commands = [];
  for (const commandsStringId of commandsStringIds) {
    commands.push(
      await messageParserById(
        commandsStringId,
        globalStrings,
        globalPlugins,
        globalMacros,
        logger
      )
    );
  }

  const messagePrefix = await messageParserById(
    moonpieCommandsPrefix.id,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  );
  const sentMessage = await client.say(
    channel,
    `${messagePrefix} ${commands.join(", ")}`
  );

  logTwitchMessageCommandReply(
    logger,
    messageId,
    sentMessage,
    LOG_ID_COMMAND_MOONPIE,
    MoonpieCommands.COMMANDS
  );
};
