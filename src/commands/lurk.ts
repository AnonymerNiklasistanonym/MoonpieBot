// Local imports
import {
  ChatMessageHandlerReplyCreator,
  runChatMessageHandlerReplyCreator,
} from "../chatMessageHandler";
// Type imports
import type {
  ChatMessageHandler,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../chatMessageHandler";
import { LOG_ID_CHAT_HANDLER_LURK, LurkCommands } from "../info/commands";
import {
  lurkCommandReplyLurk,
  lurkCommandReplyWelcomeBack,
} from "../info/strings/lurk/commandReply";
import { generateMacroMapFromMacroGenerator } from "../messageParser";
import { macroWelcomeBack } from "../info/macros/lurk";
import { regexLurkChatHandlerCommandLurk } from "../info/regex";

/**
 * Dynamic lurker information that can be shared across commands.
 */
export interface LurkInfo {
  /** A map/list of all current lurkers. */
  lurkers: Map<string, Lurker>;
}

/**
 * All information that is temporarily stored for all lurkers.
 */
export interface Lurker {
  /** The time when the user started lurking. */
  dateLurkStart: Date;
}

export interface CommandLurkGenericDataExtraLurkInfo {
  /**
   * Dynamic lurker information that can be shared across commands.
   * Is only available to the lurk chat handler.
   */
  lurkInfo: LurkInfo;
}

/**
 * Session object to share dynamic lurk information across commands.
 */
const lurkInfo: LurkInfo = {
  lurkers: new Map(),
};

export const lurkChatHandler: ChatMessageHandler<
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands
> = async (
  client,
  channel,
  tags,
  message,
  data,
  globalStrings,
  globalPlugins,
  globalMacros,
  logger
) => {
  // Handle commands
  await Promise.all(
    [commandLurk].map((command) =>
      runChatMessageHandlerReplyCreator(
        client,
        channel,
        tags,
        message,
        { ...data, lurkInfo },
        globalStrings,
        globalPlugins,
        globalMacros,
        logger,
        command
      )
    )
  );
};

export interface CommandLurkDetectorOutput {
  dateLurkStart: Date;
  welcomeBack?: boolean;
}

/**
 * Lurk command: Go lurking and get a welcome back message when coming back.
 */
export const commandLurk: ChatMessageHandlerReplyCreator<
  CommandLurkGenericDataExtraLurkInfo,
  CommandLurkGenericDataExtraLurkInfo &
    ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
  CommandLurkDetectorOutput
> = {
  createReply: (_channel, tags, data) => {
    // eslint-disable-next-line no-console
    console.log(data.dateLurkStart, data.welcomeBack);
    if (data.welcomeBack === true) {
      data.lurkInfo.lurkers.delete(tags["user-id"]);
      return {
        additionalMacros: generateMacroMapFromMacroGenerator(macroWelcomeBack, {
          dateLurkStart: data.dateLurkStart,
        }),
        messageId: lurkCommandReplyWelcomeBack.id,
      };
    }
    data.lurkInfo.lurkers.set(tags["user-id"], {
      dateLurkStart: data.dateLurkStart,
    });
    return {
      messageId: lurkCommandReplyLurk.id,
    };
  },
  detect: (tags, message, data) => {
    if (!data.enabledCommands.includes(LurkCommands.LURK)) {
      return false;
    }
    if (tags["user-id"] === undefined) {
      return false;
    }
    const match = message.match(regexLurkChatHandlerCommandLurk);
    // If user wants to lurk detect command
    const dateLurkStart = new Date();
    if (match) {
      return { data: { dateLurkStart } };
    }
    // If user doesn't want to lurk but was previously lurking detect command
    const lurkerInfo = data.lurkInfo.lurkers.get(tags["user-id"]);
    if (lurkerInfo === undefined) {
      return false;
    }
    // Check if the user was lurking for the last 3 minutes to not be annoying
    if (
      dateLurkStart.getTime() - lurkerInfo.dateLurkStart.getTime() <
      3 * 60 * 1000
    ) {
      // Update the lurk time but don't detect
      data.lurkInfo.lurkers.set(tags["user-id"], {
        ...lurkerInfo,
        dateLurkStart,
      });
      return false;
    }
    return {
      data: { dateLurkStart: lurkerInfo.dateLurkStart, welcomeBack: true },
    };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_LURK,
    id: LurkCommands.LURK,
  },
};
