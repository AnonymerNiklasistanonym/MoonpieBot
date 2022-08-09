// Local imports
import {
  LOG_ID_CHAT_HANDLER_MOONPIE,
  MoonpieCommands,
} from "../../info/commands";
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
import { errorMessageEnabledCommandsUndefined } from "../../error";
import { messageParserById } from "../../messageParser";
// Type imports
import type { TwitchChatCommandHandler } from "../../twitch";

/**
 * Regex to recognize the `!moonpie commands` command.
 *
 * @example
 * ```text
 * !moonpie commands
 * ```
 */
export const regexMoonpieCommands = /^\s*!moonpie\s+commands\s*$/i;

export interface CommandCommandsData {
  enabledCommands: Readonly<string[]>;
}

/**
 * Commands command: Send all available commands of the bot in chat.
 */
export const commandCommands: TwitchChatCommandHandler<CommandCommandsData> = {
  info: {
    id: MoonpieCommands.COMMANDS,
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
  },
  detect: (_tags, message, enabledCommands) => {
    if (enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    if (!message.match(regexMoonpieCommands)) {
      return false;
    }
    if (!enabledCommands.includes(MoonpieCommands.COMMANDS)) {
      return false;
    }
    return { data: {} };
  },
  createReply: async (
    client,
    channel,
    _tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    if (data.enabledCommands === undefined) {
      throw errorMessageEnabledCommandsUndefined();
    }
    const commandsStringIds = [];

    if (data.enabledCommands.includes(MoonpieCommands.CLAIM)) {
      commandsStringIds.push(moonpieCommandsClaim.id);
    }
    if (data.enabledCommands.includes(MoonpieCommands.LEADERBOARD)) {
      commandsStringIds.push(moonpieCommandsLeaderboard.id);
    }
    if (data.enabledCommands.includes(MoonpieCommands.GET)) {
      commandsStringIds.push(moonpieCommandsGet.id);
    }
    if (data.enabledCommands.includes(MoonpieCommands.SET)) {
      commandsStringIds.push(moonpieCommandsSet.id);
    }
    if (data.enabledCommands.includes(MoonpieCommands.ADD)) {
      commandsStringIds.push(moonpieCommandsAdd.id);
    }
    if (data.enabledCommands.includes(MoonpieCommands.REMOVE)) {
      commandsStringIds.push(moonpieCommandsRemove.id);
    }
    if (data.enabledCommands.includes(MoonpieCommands.DELETE)) {
      commandsStringIds.push(moonpieCommandsDelete.id);
    }
    if (data.enabledCommands.includes(MoonpieCommands.ABOUT)) {
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
    const message = `${messagePrefix} ${commands.join(", ")}`;
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
};
