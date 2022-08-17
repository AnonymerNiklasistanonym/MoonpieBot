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
import { genericStringSorter } from "../../other/genericStringSorter";
import { messageParserById } from "../../messageParser";
import { regexMoonpieChatHandlerCommandCommands } from "../../info/regex";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";

export type CommandCommandsCreateReplyInput =
  CommandGenericDetectorInputEnabledCommands;
export type CommandCommandsDetectorInput =
  CommandGenericDetectorInputEnabledCommands;
/**
 * Commands command: Send all available commands of the bot in chat.
 */
export const commandCommands: TwitchChatCommandHandler<
  CommandCommandsCreateReplyInput,
  CommandCommandsDetectorInput
> = {
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
    const message = `${messagePrefix} ${commands
      .sort(genericStringSorter)
      .join(", ")}`;
    const sentMessage = await client.say(channel, message);
    return { sentMessage };
  },
  detect: (_tags, message, data) => {
    if (!message.match(regexMoonpieChatHandlerCommandCommands)) {
      return false;
    }
    if (!data.enabledCommands.includes(MoonpieCommands.COMMANDS)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_MOONPIE,
    id: MoonpieCommands.COMMANDS,
  },
};
