// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  osuCommandsCommands,
  osuCommandsLastRequest,
  osuCommandsNp,
  osuCommandsNpStreamCompanionFile,
  osuCommandsNpStreamCompanionWebsocket,
  osuCommandsPermitRequest,
  osuCommandsPp,
  osuCommandsRequests,
  osuCommandsRp,
  osuCommandsScore,
  osuCommandsString,
} from "../../strings/osu/commands";
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
  createReply: async (_channel, _tags, data) => {
    const commandsStringIds: [string, boolean][] = [];
    let streamCompanionInfo:
      | StreamCompanionFileData
      | StreamCompanionWebSocketData
      | undefined;
    if (data.osuStreamCompanionCurrentMapData !== undefined) {
      streamCompanionInfo = await data.osuStreamCompanionCurrentMapData();
    }

    Object.values(OsuCommands).forEach((command) => {
      const enabled = data.enabledCommands.includes(command);
      switch (command) {
        case OsuCommands.COMMANDS:
          commandsStringIds.push([osuCommandsCommands.id, enabled]);
          break;
        case OsuCommands.LAST_REQUEST:
          commandsStringIds.push([osuCommandsLastRequest.id, enabled]);
          break;
        case OsuCommands.PERMIT_REQUEST:
          commandsStringIds.push([osuCommandsPermitRequest.id, enabled]);
          break;
        case OsuCommands.NP:
          if (
            data.osuStreamCompanionCurrentMapData !== undefined &&
            streamCompanionInfo !== undefined &&
            streamCompanionInfo.type === "file"
          ) {
            commandsStringIds.push([
              osuCommandsNpStreamCompanionFile.id,
              enabled,
            ]);
          } else if (
            data.osuStreamCompanionCurrentMapData !== undefined &&
            streamCompanionInfo !== undefined &&
            streamCompanionInfo.type === "websocket"
          ) {
            commandsStringIds.push([
              osuCommandsNpStreamCompanionWebsocket.id,
              enabled,
            ]);
          } else {
            commandsStringIds.push([osuCommandsNp.id, enabled]);
          }
          break;
        case OsuCommands.PP:
          commandsStringIds.push([osuCommandsPp.id, enabled]);
          break;
        case OsuCommands.REQUESTS:
          commandsStringIds.push([osuCommandsRequests.id, enabled]);
          break;
        case OsuCommands.RP:
          commandsStringIds.push([osuCommandsRp.id, enabled]);
          break;
        case OsuCommands.SCORE:
          commandsStringIds.push([osuCommandsScore.id, enabled]);
          break;
      }
    });
    return {
      additionalMacros: new Map([
        [
          "COMMAND_ENABLED",
          new Map(
            commandsStringIds.map((a) => [a[0], a[1] ? "true" : "false"])
          ),
        ],
      ]),
      messageId: osuCommandsString.id,
    };
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.COMMANDS)) {
      return false;
    }
    if (!message.match(regexOsuChatHandlerCommandCommands)) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.COMMANDS,
  },
};
