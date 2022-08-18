// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  osuCommandsCommands,
  osuCommandsNp,
  osuCommandsNpStreamCompanionFile,
  osuCommandsNpStreamCompanionWebsocket,
  osuCommandsPp,
  osuCommandsPrefix,
  osuCommandsRequests,
  osuCommandsRp,
  osuCommandsScore,
} from "../../strings/osu/commands";
import { genericStringSorter } from "../../other/genericStringSorter";
import { messageParserById } from "../../messageParser";
import { osuCommandsNone } from "../../strings/osu/commands";
import { regexOsuChatHandlerCommandCommands } from "../../info/regex";
// Type imports
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type {
  StreamCompanionConnection,
  StreamCompanionFileData,
  StreamCompanionWebSocketData,
} from "../../osuStreamCompanion";

export interface CommandCommandsCreateReplyInput
  extends CommandGenericDetectorInputEnabledCommands {
  /**
   * If available get the current map data using StreamCompanion.
   */
  osuStreamCompanionCurrentMapData?: StreamCompanionConnection;
}
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
    let streamCompanionInfo:
      | StreamCompanionFileData
      | StreamCompanionWebSocketData
      | undefined;
    if (data.osuStreamCompanionCurrentMapData !== undefined) {
      streamCompanionInfo = await data.osuStreamCompanionCurrentMapData();
    }

    Object.values(OsuCommands).forEach((command) => {
      if (!data.enabledCommands.includes(command)) {
        return;
      }
      switch (command) {
        case OsuCommands.COMMANDS:
          commandsStringIds.push(osuCommandsCommands.id);
          break;
        case OsuCommands.NP:
          if (
            data.osuStreamCompanionCurrentMapData !== undefined &&
            streamCompanionInfo !== undefined &&
            streamCompanionInfo.type === "file"
          ) {
            commandsStringIds.push(osuCommandsNpStreamCompanionFile.id);
          } else if (
            data.osuStreamCompanionCurrentMapData !== undefined &&
            streamCompanionInfo !== undefined &&
            streamCompanionInfo.type === "websocket"
          ) {
            commandsStringIds.push(osuCommandsNpStreamCompanionWebsocket.id);
          } else {
            commandsStringIds.push(osuCommandsNp.id);
          }
          break;
        case OsuCommands.PP:
          commandsStringIds.push(osuCommandsPp.id);
          break;
        case OsuCommands.REQUESTS:
          commandsStringIds.push(osuCommandsRequests.id);
          break;
        case OsuCommands.RP:
          commandsStringIds.push(osuCommandsRp.id);
          break;
        case OsuCommands.SCORE:
          commandsStringIds.push(osuCommandsScore.id);
          break;
      }
    });

    if (commandsStringIds.length === 0) {
      commandsStringIds.push(osuCommandsNone.id);
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
      osuCommandsPrefix.id,
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
    if (!message.match(regexOsuChatHandlerCommandCommands)) {
      return false;
    }
    if (!data.enabledCommands.includes(OsuCommands.COMMANDS)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.COMMANDS,
  },
};
