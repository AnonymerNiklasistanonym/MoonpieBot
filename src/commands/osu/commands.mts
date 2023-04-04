// Relative imports
import {
  LOG_ID_CHAT_HANDLER_OSU,
  OsuCommands,
} from "../../info/chatCommands.mjs";
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
} from "../../info/strings/osu/commands.mjs";
import { generateMacroMapFromMacroGenerator } from "../../messageParser.mjs";
import { macroCommandEnabled } from "../../info/macros/commands.mjs";
import { regexOsuChatHandlerCommandCommands } from "../../info/regex.mjs";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler.mjs";
import type { CommandOsuGenericDataStreamCompanionFunc } from "../osu.mjs";

/**
 * Commands command: Send all available commands of the bot in chat.
 */
export const commandCommands: ChatMessageHandlerReplyCreator<
  CommandOsuGenericDataStreamCompanionFunc &
    ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands
> = {
  createReply: async (_channel, _tags, data, logger) => {
    const streamCompanionInfo =
      data.osuStreamCompanionCurrentMapData !== undefined
        ? await data.osuStreamCompanionCurrentMapData()
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
                if (data.osuStreamCompanionCurrentMapData !== undefined) {
                  return [osuCommandsNp.id, false];
                } else {
                  return [osuCommandsNp.id, enabled];
                }
              case `${OsuCommands.NP}_STREAM_COMPANION_FILES`:
                if (
                  data.osuStreamCompanionCurrentMapData !== undefined &&
                  streamCompanionInfo !== undefined &&
                  streamCompanionInfo.type === "file"
                ) {
                  return [
                    osuCommandsNpStreamCompanionFile.id,
                    data.enabledCommands.includes(OsuCommands.NP),
                  ];
                } else {
                  return [osuCommandsNpStreamCompanionFile.id, false];
                }
              case `${OsuCommands.NP}_STREAM_COMPANION_WEBSOCKET`:
                if (
                  data.osuStreamCompanionCurrentMapData !== undefined &&
                  streamCompanionInfo !== undefined &&
                  streamCompanionInfo.type === "websocket"
                ) {
                  return [
                    osuCommandsNpStreamCompanionWebsocket.id,
                    data.enabledCommands.includes(OsuCommands.NP),
                  ];
                } else {
                  return [osuCommandsNpStreamCompanionWebsocket.id, false];
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
          enumValues: [
            ...Object.values(OsuCommands),
            `${OsuCommands.NP}_STREAM_COMPANION_FILES`,
            `${OsuCommands.NP}_STREAM_COMPANION_WEBSOCKET`,
          ],
        },
        logger,
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
