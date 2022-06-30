import {
  errorMessageIdUndefined,
  logTwitchMessageCommandReply,
} from "../../commands";
import { MoonpieCommands, LOG_ID_COMMAND_MOONPIE } from "../moonpie";
import {
  moonpieCommandAbout,
  moonpieCommandAdd,
  moonpieCommandClaim,
  moonpieCommandDelete,
  moonpieCommandGet,
  moonpieCommandLeaderboard,
  moonpieCommandNone,
  moonpieCommandPrefix,
  moonpieCommandRemove,
  moonpieCommandSet,
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
    commandsStringIds.push(moonpieCommandClaim.id);
  }
  if (enabled.includes(MoonpieCommands.LEADERBOARD)) {
    commandsStringIds.push(moonpieCommandLeaderboard.id);
  }
  if (enabled.includes(MoonpieCommands.GET)) {
    commandsStringIds.push(moonpieCommandGet.id);
  }
  if (enabled.includes(MoonpieCommands.SET)) {
    commandsStringIds.push(moonpieCommandSet.id);
  }
  if (enabled.includes(MoonpieCommands.ADD)) {
    commandsStringIds.push(moonpieCommandAdd.id);
  }
  if (enabled.includes(MoonpieCommands.REMOVE)) {
    commandsStringIds.push(moonpieCommandRemove.id);
  }
  if (enabled.includes(MoonpieCommands.DELETE)) {
    commandsStringIds.push(moonpieCommandDelete.id);
  }
  if (enabled.includes(MoonpieCommands.ABOUT)) {
    commandsStringIds.push(moonpieCommandAbout.id);
  }

  if (commandsStringIds.length === 0) {
    commandsStringIds.push(moonpieCommandNone.id);
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
    moonpieCommandPrefix.id,
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
