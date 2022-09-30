/*
 * Twitch Client/Connection setup and general functions surrounding chat message
 * handling.
 */

// Package imports
import { client as tmiClient } from "tmi.js";
// Local imports
import { createLogFunc, LoggerInformation } from "./logging";
import {
  errorMessageIdUndefined,
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "./error";
import { generalUserPermissionError } from "./strings/general";
import { macroPermissionError } from "./messageParser/macros/general";
import { parseTwitchBadgeLevel } from "./other/twitchBadgeParser";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import { MacroMap, messageParserById, PluginMap } from "./messageParser";
import type { EMPTY_OBJECT } from "./info/other";
import type { Logger } from "winston";
import type { StringMap } from "./strings";
import type { TwitchBadgeLevel } from "./other/twitchBadgeParser";

/**
 * The logging ID of this module.
 */
const LOG_ID = "twitch";

/**
 * Errorcodes that can be attached to @CreateTwitchClientError.
 */
export enum CreateTwitchClientErrorCode {
  TWITCH_CHANNELS_EMPTY = "TWITCH_CHANNELS_EMPTY",
  TWITCH_CHANNELS_UNDEFINED = "TWITCH_CHANNELS_UNDEFINED",
  TWITCH_NAME_UNDEFINED = "TWITCH_NAME_UNDEFINED",
  TWITCH_OAUTH_TOKEN_UNDEFINED = "TWITCH_OAUTH_TOKEN_UNDEFINED",
}

/**
 * Error that is thrown if something goes wrong with creating the Twitch client.
 */
export interface CreateTwitchClientError extends Error {
  code?: CreateTwitchClientErrorCode;
}

/**
 * A list of all available channels that can be listened to by the Twitch client.
 */
export enum TwitchClientListener {
  /**
   * Triggers when the Twitch client was disconnected from Twitch.
   */
  CLIENT_CONNECTED_TO_TWITCH = "connected",
  /**
   * Triggers when the Twitch client was disconnected from Twitch.
   */
  CLIENT_CONNECTING_TO_TWITCH = "connecting",
  /**
   * Triggers when the Twitch client was disconnected from Twitch.
   */
  CLIENT_DISCONNECTED_FROM_TWITCH = "disconnected",
  /**
   * Triggers when a new message is being sent in a Twitch channel that is being listened to.
   */
  NEW_MESSAGE = "message",
  /**
   * Triggers when a Twitch user joins a Twitch channel that is being listened to.
   */
  NEW_REDEEM = "redeem",
  /**
   * Triggers when a Twitch user joins a Twitch channel that is being listened to.
   */
  USER_JOINED_CHANNEL = "join",
}

/**.
 * Create a Twitch client/connection.
 *
 * The twitch client can then listen to multiple events.
 *
 * ```mermaid
 * graph LR
 *   twitchClient -- on --> connecting & connected & disconnected & join & message;
 *   connecting --> a["client is connecting to Twitch<br>(address, port) => {}"];
 *   connected --> b["client is connecting to Twitch<br>(address, port) => {}"];
 *   disconnected --> c["client was disconnected from Twitch<br>(reason) => {}"];
 *   join --> d["client joined a channel on Twitch<br>(channel, username, self) => {}"];
 *   message --> e["a new message is being sent in a joined Twitch channel<br>(channel, tags, message, self) => {}"];
 * ```
 *
 * @param twitchName Name of the Twitch account that should be connected.
 * @param twitchOAuthToken The authorization token to the Twitch account.
 * @param twitchChannels The Twitch channels that should be connected to.
 * @param logger Logger (used for logging).
 * @param debug Print Twitch client debug output to the console.
 * @returns Twitch client.
 */
export const createTwitchClient = (
  twitchName: string | undefined,
  twitchOAuthToken: string | undefined,
  twitchChannels: string[] | undefined,
  debug = false,
  logger: Logger
): Client => {
  const logTwitchClient = createLogFunc(logger, LOG_ID, "client");

  // Throw an error if Twitch name,token or channels were not defined or empty
  if (twitchName === undefined) {
    const error = Error(
      "Could not create Twitch client: twitchName was undefined"
    ) as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_NAME_UNDEFINED;
    throw error;
  }
  if (twitchOAuthToken === undefined) {
    const error = Error(
      "Could not create Twitch client: twitchOAuthToken was undefined"
    ) as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_OAUTH_TOKEN_UNDEFINED;
    throw error;
  }
  if (twitchChannels === undefined) {
    const error = Error(
      "Could not create Twitch client: twitchChannels was undefined"
    ) as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_CHANNELS_UNDEFINED;
    throw error;
  }
  if (twitchChannels.length === 0) {
    const error = Error(
      "Could not create Twitch client: twitchChannels list was empty"
    ) as CreateTwitchClientError;
    error.code = CreateTwitchClientErrorCode.TWITCH_CHANNELS_EMPTY;
    throw error;
  }

  const twitchChannelString = twitchChannels.map((a) => `"${a}"`).join(", ");
  logTwitchClient.info(
    `Create Twitch client for the account "${twitchName}" in the channels: ${twitchChannelString}`
  );

  // Create Twitch client that can listen to all specified channels
  return new tmiClient({
    channels: twitchChannels,
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      password: twitchOAuthToken,
      username: twitchName,
    },
    logger: {
      error: (message) => logTwitchClient.error(Error(message)),
      // Only log Twitch messages if enabled for privacy reasons
      info: debug ? logTwitchClient.debug : () => undefined,
      warn: logTwitchClient.warn,
    },
    options: { debug },
  });
};

// TYPES FOR CHAT HANDLER/COMMAND MANAGER

/**
 * A global type for all Twitch chat (message) handler functions.
 * This makes it really easy to manage changes across the whole bot.
 *
 * @typeParam DATA The additional data the chat handler needs for execution.
 */
export type TwitchChatHandler<DATA extends object = EMPTY_OBJECT> = (
  /** The Twitch client. */
  client: Readonly<Client>,
  /** The Twitch channel where the current message was written. */
  channel: Readonly<string>,
  /**
   * The Twitch (user) chat state (the user name/id/badges of the user that
   * wrote the current message).
   */
  tags: Readonly<ChatUserstate>,
  /** The current Twitch message. */
  message: Readonly<string>,
  /** The additional data necessary for execution. */
  data: DATA,
  /** The global strings object to get strings for parsing. */
  globalStrings: Readonly<StringMap>,
  /** The global plugin object to generate text from strings. */
  globalPlugins: Readonly<PluginMap>,
  /** The global macro object to generate text from strings. */
  globalMacros: Readonly<MacroMap>,
  /** The global logger. */
  logger: Readonly<Logger>
) => Promise<void>;

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

// LOG TWITCH RELATED ACTIONS

/**
 * Log a sent Twitch broadcast message.
 *
 * @param logger The global logger.
 * @param sentMessage The sent message information.
 * @param broadcastSourceId The ID of the broadcast source.
 */
export const logTwitchMessageBroadcast = (
  logger: Logger,
  sentMessage: string[],
  broadcastSourceId: string
): void => {
  logger.log({
    level: "debug",
    message: `Successfully broadcasted: '${JSON.stringify(sentMessage)}'`,
    section: "twitch_message:broadcast",
    subsection: broadcastSourceId,
  } as LoggerInformation);
};

/**
 * Log a detected command from a Twitch message.
 *
 * @param logger The global logger.
 * @param messageId The ID of the message that is checked.
 * @param message The message that something was detected in.
 * @param detectedCommand The command that was detected.
 */
const logTwitchMessageCommandDetected = (
  logger: Logger,
  messageId: string,
  message: Readonly<string[]>,
  detectedCommand: TwitchChatCommandHandlerInfo
): void => {
  logger.log({
    level: "debug",
    message: `Detected command "${detectedCommand.chatHandlerId}:${
      detectedCommand.id
    }" in message ${messageId}: '${JSON.stringify(message)}'`,
    section: "twitch_message:detected",
  } as LoggerInformation);
};

/**
 * Log a reply to a Twitch message from a Twitch command.
 *
 * @param logger The global logger.
 * @param detectedCommand The detected command.
 * @param commandReplySentMessage The command reply.
 * @param replyToMessageId The ID of the message that is replied to.
 */
const logTwitchMessageCommandReply = (
  logger: Logger,
  detectedCommand: TwitchChatCommandHandlerInfo,
  commandReplySentMessage: string[],
  replyToMessageId: string
): void => {
  logger.log({
    level: "debug",
    message: `Successfully replied to message ${replyToMessageId} using the command "${
      detectedCommand.chatHandlerId
    }:${detectedCommand.id}": '${JSON.stringify(commandReplySentMessage)}'`,
    section: "twitch_message:reply",
  } as LoggerInformation);
};

// Twitch command handle method

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

export const checkTwitchBadgeLevel = (
  tags: Readonly<ChatUserstate>,
  expectedBadgeLevel: TwitchBadgeLevel
): TwitchChatCommandHandlerReply | undefined => {
  const twitchBadgeLevel = parseTwitchBadgeLevel(tags);
  if (twitchBadgeLevel < expectedBadgeLevel) {
    return {
      additionalMacros: new Map([
        [
          macroPermissionError.id,
          new Map(
            macroPermissionError.generate({
              expected: expectedBadgeLevel,
              found: twitchBadgeLevel,
            })
          ),
        ],
      ]),
      messageId: generalUserPermissionError.id,
    };
  }
};
