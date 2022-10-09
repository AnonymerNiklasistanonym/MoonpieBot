// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
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
} from "../../info/strings/osu/commands";
import { generateMacroMapFromMacroGenerator } from "../../messageParser";
import { macroCommandEnabled } from "../../info/macros/commands";
import { regexOsuChatHandlerCommandCommands } from "../../info/regex";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler";
import type { CommandOsuGenericDataStreamCompanionFunc } from "../osu";

/**
 * Commands command: Send all available commands of the bot in chat.
 */
export const commandCommands: ChatMessageHandlerReplyCreator<
  CommandOsuGenericDataStreamCompanionFunc &
    ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands
> = {
  createReply: async (_channel, _tags, data) => {
    const streamCompanionInfo =
      data.osuStreamCompanionCurrentMapData !== undefined
        ? await data?.osuStreamCompanionCurrentMapData()
        : undefined;

    return {
      additionalMacros: generateMacroMapFromMacroGenerator(
        macroCommandEnabled,
        {
          convertEnumValueToInfo: (enumValue) => {
            const enabled = data.enabledCommands.includes(enumValue);
            switch (enumValue as OsuCommands) {
              case OsuCommands.COMMANDS:
                break;
              case OsuCommands.LAST_REQUEST:
                return [osuCommandsLastRequest.id, enabled];
              case OsuCommands.PERMIT_REQUEST:
                return [osuCommandsPermitRequest.id, enabled];
              case OsuCommands.NP:
                if (
                  data.osuStreamCompanionCurrentMapData !== undefined &&
                  streamCompanionInfo !== undefined &&
                  streamCompanionInfo.type === "file"
                ) {
                  return [osuCommandsNpStreamCompanionFile.id, enabled];
                } else if (
                  data.osuStreamCompanionCurrentMapData !== undefined &&
                  streamCompanionInfo !== undefined &&
                  streamCompanionInfo.type === "websocket"
                ) {
                  return [osuCommandsNpStreamCompanionWebsocket.id, enabled];
                } else {
                  return [osuCommandsNp.id, enabled];
                }
              case OsuCommands.PP:
                return [osuCommandsPp.id, enabled];
              case OsuCommands.REQUESTS:
                return [osuCommandsRequests.id, enabled];
              case OsuCommands.RP:
                return [osuCommandsRp.id, enabled];
              case OsuCommands.SCORE:
                return [osuCommandsScore.id, enabled];
            }
            return ["undefined", false];
          },
          enumValues: Object.values(OsuCommands),
        }
      ),
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
