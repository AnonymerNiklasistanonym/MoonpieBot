/*
 * Generic helper functions to handle Twitch chat message commands.
 */

// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "../error";
import {
  logTwitchMessageCommandDetected,
  logTwitchMessageCommandReply,
} from "./twitchLog";
import { messageParserById } from "../messageParser";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { MacroMap, PluginMap } from "../messageParser";
import type { EMPTY_OBJECT } from "../info/other";
import type { Logger } from "winston";
import type { StringMap } from "../strings";

/**
 * The same as ChatUserstate but it was already checked that some properties
 * exist.
 */
export interface ChatUserstateIdUserNameId extends ChatUserstate {
  id: string;
  "user-id": string;
  username: string;
}

/**
 * A global type for a method that creates a reply for a command.
 *
 * @typeParam DATAThe additional data the command needs for execution.
 * @returns One or more sent replies.
 */
export type TwitchChatCommandHandlerCreateReply<DATA = EMPTY_OBJECT> = (
  /** The Twitch channel where the current message was written. */
  channel: Readonly<string>,
  /**
   * The Twitch (user) chat state (the user name/id/badges of the user that
   * wrote the current message).
   */
  tags: Readonly<ChatUserstateIdUserNameId>,
  /** The additional data necessary for execution. */
  data: DATA,
  /** The global logger. */
  logger: Readonly<Logger>
) =>
  | Promise<TwitchChatCommandHandlerReply | TwitchChatCommandHandlerReply[]>
  | TwitchChatCommandHandlerReply
  | TwitchChatCommandHandlerReply[];

/**
 * Object that represents a successful reply done by a command handler.
 */
export interface TwitchChatCommandHandlerReply {
  /** Additional macro map to generate text from strings. */
  additionalMacros?: Readonly<MacroMap>;
  /** Additional plugin map to generate text from strings. */
  additionalPlugins?: Readonly<PluginMap>;
  /** A custom send function. */
  customSendFunc?: (
    message: string,
    logger: Readonly<Logger>
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
        logger: Readonly<Logger>
      ) => Promise<string>);
}
/**
 * Default generic interface for enabled commands as detector input.
 */
export interface CommandGenericDetectorInputEnabledCommands {
  enabledCommands: string[];
}

/**
 * A global type for a method that detects a command and return data about what
 * was detected or return false if nothing was detected.
 *
 * @typeParam INPUT_DATA The additional data the command detector needs for
 * execution.
 * @typeParam OUTPUT_DATA Data that the command detector should return when it
 * successfully detects a command (like regular expression group matches).
 * @returns Either false or an object with information from the detection.
 */
export type TwitchChatCommandHandlerDetect<
  INPUT_DATA extends object = EMPTY_OBJECT,
  OUTPUT_DATA extends object = EMPTY_OBJECT
> = (
  tags: Readonly<ChatUserstate>,
  message: Readonly<string>,
  data: Readonly<INPUT_DATA>
) => false | TwitchChatCommandHandlerDetectorDataOutput<OUTPUT_DATA>;

/**
 * The data that was parsed from a successful detected command by a message.
 *
 * @typeParam DETECTED_DATA Data that the command detector should return when it
 * successfully detects a command (like regular expression group matches).
 */
export interface TwitchChatCommandHandlerDetectorDataOutput<
  DETECTED_DATA extends object = EMPTY_OBJECT
> {
  /**
   * The information found by the detector that should be forwarded to the
   * command handler.
   */
  data: DETECTED_DATA;
}

/**
 * The structure of a Twitch message command manager object.
 *
 * @typeParam CREATE_REPLY_INPUT_DATA The data that is necessary to create a reply.
 * @typeParam DETECTOR_INPUT_DATA The data that is necessary to detect if a reply
 * should be created.
 * @typeParam DETECTOR_OUTPUT_DATA The data that is created by the reply detector
 * for further use when creating the reply.
 */
export interface TwitchChatCommandHandler<
  CREATE_REPLY_INPUT_DATA extends object = EMPTY_OBJECT,
  DETECTOR_INPUT_DATA extends object = EMPTY_OBJECT,
  DETECTOR_OUTPUT_DATA extends object = EMPTY_OBJECT
> {
  /**
   * The method that handles the detected command with additional and forwarded
   * data from the detector.
   */
  createReply: TwitchChatCommandHandlerCreateReply<
    CREATE_REPLY_INPUT_DATA & DETECTOR_OUTPUT_DATA
  >;
  /** The method that detects if something should be handled. */
  detect: TwitchChatCommandHandlerDetect<
    DETECTOR_INPUT_DATA,
    DETECTOR_OUTPUT_DATA
  >;
  /** Information about the command handler. */
  info: TwitchChatCommandHandlerInfo;
  zTypeHelperDetectorInput?: DETECTOR_INPUT_DATA;
  zTypeHelperDetectorOutput?: DETECTOR_OUTPUT_DATA;
}

/**
 * Information about the Twitch chat command manager.
 */
export interface TwitchChatCommandHandlerInfo {
  /** The ID of the chat handler that this command belongs to. */
  chatHandlerId: string;
  /** The ID of the command manager. */
  id: string;
}

/**
 * Generic method to handle a Twitch command.
 *
 * @param client Twitch client.
 * @param channel Twitch channel.
 * @param tags Twitch user state.
 * @param message Twitch message.
 * @param data Data for Twitch command handler.
 * @param globalStrings Global strings.
 * @param globalPlugins Global plugins.
 * @param globalMacros Global macros.
 * @param logger Global logger.
 * @param twitchCommandHandler The Twitch command handler.
 * @typeParam CREATE_REPLY_INPUT_DATA The data that is necessary to create a reply.
 * @typeParam DETECTOR_INPUT_DATA The data that is necessary to detect if a reply
 * should be created.
 * @typeParam DETECTOR_OUTPUT_DATA The data that is created by the reply detector
 * for further use when creating the reply.
 * @returns True if the command was detected and a reply was sent.
 */
export const runTwitchCommandHandler = async <
  DATA extends CREATE_REPLY_INPUT_DATA & DETECTOR_INPUT_DATA,
  CREATE_REPLY_INPUT_DATA extends object = EMPTY_OBJECT,
  DETECTOR_INPUT_DATA extends object = EMPTY_OBJECT,
  DETECTOR_OUTPUT_DATA extends object = EMPTY_OBJECT
>(
  client: Readonly<Client>,
  channel: Readonly<string>,
  tags: Readonly<ChatUserstate>,
  message: Readonly<string>,
  data: DATA,
  globalStrings: Readonly<StringMap>,
  globalPlugins: Readonly<PluginMap>,
  globalMacros: Readonly<MacroMap>,
  logger: Readonly<Logger>,
  twitchCommandHandler: TwitchChatCommandHandler<
    CREATE_REPLY_INPUT_DATA,
    DETECTOR_INPUT_DATA,
    DETECTOR_OUTPUT_DATA
  >
): Promise<boolean> => {
  const twitchCommandDetected = twitchCommandHandler.detect(
    tags,
    message,
    data
  );
  if (twitchCommandDetected) {
    if (tags.id === undefined) {
      throw errorMessageIdUndefined();
    }
    if (tags.username === undefined) {
      throw errorMessageUserNameUndefined();
    }
    if (tags["user-id"] === undefined) {
      throw errorMessageUserIdUndefined();
    }
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username, message],
      twitchCommandHandler.info
    );
    const twitchCommandReply = await twitchCommandHandler.createReply(
      channel,
      tags as ChatUserstateIdUserNameId,
      { ...data, ...twitchCommandDetected.data },
      logger
    );
    const twitchCommandReplies = Array.isArray(twitchCommandReply)
      ? twitchCommandReply
      : [twitchCommandReply];
    for (const a of twitchCommandReplies) {
      const replyMacros = a.additionalMacros
        ? new Map([...globalMacros, ...a.additionalMacros])
        : globalMacros;
      const replyPlugins = a.additionalPlugins
        ? new Map([...globalPlugins, ...a.additionalPlugins])
        : globalPlugins;
      const messageToSend =
        typeof a.messageId === "string"
          ? await messageParserById(
              a.messageId,
              globalStrings,
              replyPlugins,
              replyMacros,
              logger
            )
          : await a.messageId(globalStrings, replyPlugins, replyMacros, logger);
      if (a.isError) {
        throw Error(messageToSend);
      }
      const sentMessage = a.customSendFunc
        ? await a.customSendFunc(messageToSend, logger)
        : await client.say(channel, messageToSend);
      logTwitchMessageCommandReply(
        logger,
        twitchCommandHandler.info,
        sentMessage,
        tags.id
      );
    }
    return true;
  }
  return false;
};
