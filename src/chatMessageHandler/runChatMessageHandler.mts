/*
 * Generic helper functions to handle Twitch chat message commands.
 */

// Relative imports
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "../error.mjs";
import {
  logChatMessageReply,
  logDetectedCommandInChatMessage,
} from "./logChatMessage.mjs";
import { messageParserById } from "../messageParser.mjs";
// Type imports
import type { Client, ChatUserstate as TwitchChatUserState } from "tmi.js";
import type { MacroMap, PluginMap, StringMap } from "../messageParser.mjs";
import type { EMPTY_OBJECT } from "../other/types.mjs";
import type { Logger } from "winston";

/**
 * Information about the current chat message and user.
 */
export interface ChatMessageHandlerReplyCreatorChatUserState
  extends TwitchChatUserState {
  id: string;
  "user-id": string;
  username: string;
}

/**
 * A global type for a method that creates a reply for a command.
 * @typeParam DATAThe additional data the command needs for execution.
 * @returns One or more sent replies.
 */
export type ChatMessageHandlerCreateReply<DATA = EMPTY_OBJECT> = (
  /** The Twitch channel where the current message was written. */
  channel: string,
  /**
   * The Twitch (user) chat state (the user name/id/badges of the user that
   * wrote the current message).
   */
  tags: Readonly<ChatMessageHandlerReplyCreatorChatUserState>,
  /** The additional data necessary for execution. */
  data: DATA,
  /** The global logger. */
  logger: Readonly<Logger>,
) =>
  | Promise<ChatMessageHandlerReply | ChatMessageHandlerReply[]>
  | ChatMessageHandlerReply
  | ChatMessageHandlerReply[];

/**
 * Object that represents a successful reply done by a command handler.
 */
export interface ChatMessageHandlerReply {
  /** Additional macro map to generate text from strings. */
  additionalMacros?: Readonly<MacroMap>;
  /** Additional plugin map to generate text from strings. */
  additionalPlugins?: Readonly<PluginMap>;
  /** A custom send function. */
  customSendFunc?: (
    message: string,
    logger: Readonly<Logger>,
  ) => Promise<string[]> | string[];
  /** This message should throw an error. */
  isError?: boolean;
  /** The message ID or as fallback a custom string generator. */
  messageId:
    | string
    | ((
        globalStrings: Readonly<StringMap>,
        globalPlugins: Readonly<PluginMap>,
        globalMacros: Readonly<MacroMap>,
        logger: Readonly<Logger>,
      ) => Promise<string>);
}

/**
 * Default generic interface for enabled commands as detector input.
 */
export interface ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands {
  /**
   * The enabled commands for the current Twitch chat handler.
   */
  enabledCommands: readonly string[];
}

/**
 * A global type for a method that detects a command and return data about what
 * was detected or return false if nothing was detected.
 * @typeParam INPUT_DATA The additional data the command detector needs for
 * execution.
 * @typeParam OUTPUT_DATA Data that the command detector should return when it
 * successfully detects a command (like regular expression group matches).
 * @returns Either false or an object with information from the detection.
 */
export type ChatMessageHandlerDetect<
  INPUT_DATA extends object = EMPTY_OBJECT,
  OUTPUT_DATA extends object = EMPTY_OBJECT,
> = (
  tags: Readonly<TwitchChatUserState>,
  message: string,
  data: Readonly<INPUT_DATA>,
) => false | ChatMessageHandlerReplyCreatorDetectorDataOutput<OUTPUT_DATA>;

/**
 * The data that was parsed from a successful detected command by a message.
 * @typeParam DETECTED_DATA Data that the command detector should return when it
 * successfully detects a command (like regular expression group matches).
 */
export interface ChatMessageHandlerReplyCreatorDetectorDataOutput<
  DETECTED_DATA extends object = EMPTY_OBJECT,
> {
  /**
   * The information found by the detector that should be forwarded to the
   * command handler.
   */
  data: DETECTED_DATA;
}

/**
 * The structure of a chat message handler that has a method
 * to check a message if it should create a reply and
 * a method to create a reply.
 * @typeParam CREATE_REPLY_INPUT_DATA The data that is necessary to create a reply.
 * @typeParam DETECTOR_INPUT_DATA The data that is necessary to detect if a reply
 * should be created.
 * @typeParam DETECTOR_OUTPUT_DATA The data that is created by the reply detector
 * for further use when creating the reply.
 */
export interface ChatMessageHandlerReplyCreator<
  CREATE_REPLY_INPUT_DATA extends object = EMPTY_OBJECT,
  DETECTOR_INPUT_DATA extends object = EMPTY_OBJECT,
  DETECTOR_OUTPUT_DATA extends object = EMPTY_OBJECT,
> {
  /**
   * The method that handles the detected command with additional and forwarded
   * data from the detector.
   */
  createReply: ChatMessageHandlerCreateReply<
    CREATE_REPLY_INPUT_DATA & DETECTOR_OUTPUT_DATA
  >;
  /** The method that detects if something should be handled. */
  detect: ChatMessageHandlerDetect<DETECTOR_INPUT_DATA, DETECTOR_OUTPUT_DATA>;
  /** Information about the chat message handler. */
  info: Readonly<ChatMessageHandlerInfo>;
}

/**
 * Information about a chat message handler.
 */
export interface ChatMessageHandlerInfo {
  /** The ID of the chat handler that this command belongs to. */
  chatHandlerId: string;
  /** The ID of the command manager. */
  id: string;
}

/**
 * Generic method to handle a chat message.
 * @param client Twitch client.
 * @param channel Twitch channel.
 * @param tags Twitch user state.
 * @param message Twitch message.
 * @param data Data for Twitch command handler.
 * @param globalStrings Global strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Global logger.
 * @param chatMessageHandler The Twitch command handler.
 * @typeParam CREATE_REPLY_INPUT_DATA The data that is necessary to create a reply.
 * @typeParam DETECTOR_INPUT_DATA The data that is necessary to detect if a reply
 * should be created.
 * @typeParam DETECTOR_OUTPUT_DATA The data that is created by the reply detector
 * for further use when creating the reply.
 * @returns True if the command was detected and a reply was sent.
 */
export const runChatMessageHandlerReplyCreator = async <
  DATA extends CREATE_REPLY_INPUT_DATA & DETECTOR_INPUT_DATA,
  CREATE_REPLY_INPUT_DATA extends object = EMPTY_OBJECT,
  DETECTOR_INPUT_DATA extends object = EMPTY_OBJECT,
  DETECTOR_OUTPUT_DATA extends object = EMPTY_OBJECT,
>(
  client: Readonly<Client>,
  channel: string,
  tags: Readonly<TwitchChatUserState>,
  message: string,
  data: DATA,
  globalStrings: Readonly<StringMap>,
  globalPlugins: Readonly<PluginMap>,
  globalMacros: Readonly<MacroMap>,
  logger: Readonly<Logger>,
  chatMessageHandler: ChatMessageHandlerReplyCreator<
    CREATE_REPLY_INPUT_DATA,
    DETECTOR_INPUT_DATA,
    DETECTOR_OUTPUT_DATA
  >,
): Promise<boolean> => {
  const detectedCommand = chatMessageHandler.detect(tags, message, data);
  if (detectedCommand !== false) {
    if (tags.id === undefined) {
      throw errorMessageIdUndefined();
    }
    if (tags.username === undefined) {
      throw errorMessageUserNameUndefined();
    }
    if (tags["user-id"] === undefined) {
      throw errorMessageUserIdUndefined();
    }
    logDetectedCommandInChatMessage(
      logger,
      tags.id,
      [tags.username, message],
      chatMessageHandler.info,
    );
    const replyOrReplies = await chatMessageHandler.createReply(
      channel,
      tags as ChatMessageHandlerReplyCreatorChatUserState,
      { ...data, ...detectedCommand.data },
      logger,
    );
    const replies = Array.isArray(replyOrReplies)
      ? replyOrReplies
      : [replyOrReplies];
    for (const reply of replies) {
      const replyMacros = reply.additionalMacros
        ? new Map([...globalMacros, ...reply.additionalMacros])
        : globalMacros;
      const replyPlugins = reply.additionalPlugins
        ? new Map([...globalPlugins, ...reply.additionalPlugins])
        : globalPlugins;
      const messageToSend =
        typeof reply.messageId === "string"
          ? await messageParserById(
              reply.messageId,
              globalStrings,
              replyPlugins,
              replyMacros,
              logger,
            )
          : await reply.messageId(
              globalStrings,
              replyPlugins,
              replyMacros,
              logger,
            );
      if (reply.isError) {
        throw Error(messageToSend);
      }
      const sentMessage = reply.customSendFunc
        ? await reply.customSendFunc(messageToSend, logger)
        : await client.say(channel, messageToSend);
      logChatMessageReply(
        logger,
        chatMessageHandler.info,
        sentMessage,
        tags.id,
      );
    }
    return true;
  }
  return false;
};
