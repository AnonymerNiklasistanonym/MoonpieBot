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
  errorMessageUserNameUndefined,
} from "./error";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { Macros, Plugins } from "./messageParser";
import type { EMPTY_OBJECT } from "./info/other";
import type { Logger } from "winston";
import type { Strings } from "./strings";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_TWITCH = "twitch";

/**
 * Errorcodes that can be attached to @CreateTwitchClientError.
 */
export enum CreateTwitchClientErrorCode {
  TWITCH_NAME_UNDEFINED = "TWITCH_NAME_UNDEFINED",
  TWITCH_OAUTH_TOKEN_UNDEFINED = "TWITCH_OAUTH_TOKEN_UNDEFINED",
  TWITCH_CHANNELS_UNDEFINED = "TWITCH_CHANNELS_UNDEFINED",
  TWITCH_CHANNELS_EMPTY = "TWITCH_CHANNELS_EMPTY",
}

/**
 * Error that is thrown if something goes wrong with creating the Twitch client.
 */
export interface CreateTwitchClientError extends Error {
  code?: CreateTwitchClientErrorCode;
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
  const logTwitchClient = createLogFunc(logger, LOG_ID_MODULE_TWITCH, "client");

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
    options: { debug },
    connection: {
      secure: true,
      reconnect: true,
    },
    identity: {
      username: twitchName,
      password: twitchOAuthToken,
    },
    channels: twitchChannels,
    logger: {
      error: (message) => logTwitchClient.error(Error(message)),
      // Only log Twitch messages if enabled for privacy reasons
      info: debug ? logTwitchClient.debug : () => undefined,
      warn: logTwitchClient.warn,
    },
  });
};

// TYPES FOR CHAT HANDLER/COMMAND MANAGER

/**
 * A global type for all Twitch chat (message) handler functions.
 * This makes it really easy to manage changes across the whole bot.
 *
 * @tparam DATA The additional data the command needs for execution.
 * @tparam RETURN_VALUE The return value of the Twitch handler (currently void).
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
  /** The enabled commands for this chat handler. */
  enabledCommands: Readonly<string[]>,
  /** The global strings object to get strings for parsing. */
  globalStrings: Readonly<Strings>,
  /** The global plugin object to generate text from strings. */
  globalPlugins: Readonly<Plugins>,
  /** The global macro object to generate text from strings. */
  globalMacros: Readonly<Macros>,
  /** The global logger. */
  logger: Readonly<Logger>
) => Promise<void>;

/**
 * A global type for a method that creates a reply for a command.
 *
 * @tparam DATA The additional data necessary for its execution.
 * @returns One or more sent replies.
 */
export type TwitchChatCommandHandlerCreateReply<DATA = EMPTY_OBJECT> = (
  /** The Twitch client. */
  client: Readonly<Client>,
  /** The Twitch channel where the current message was written. */
  channel: Readonly<string>,
  /**
   * The Twitch (user) chat state (the user name/id/badges of the user that
   * wrote the current message).
   */
  tags: Readonly<ChatUserstate>,
  /** The additional data necessary for execution. */
  data: DATA,
  /** The global strings object to get strings for parsing. */
  globalStrings: Readonly<Strings>,
  /** The global plugin object to generate text from strings. */
  globalPlugins: Readonly<Plugins>,
  /** The global macro object to generate text from strings. */
  globalMacros: Readonly<Macros>,
  /** The global logger. */
  logger: Readonly<Logger>
) => Promise<TwitchChatCommandHandlerReply | TwitchChatCommandHandlerReply[]>;

/**
 * Object that represents a successful reply done by a command handler.
 */
export interface TwitchChatCommandHandlerReply {
  /** The sent message by a command handler. */
  sentMessage: string[];
}

/**
 * A global type for a method that detects a command and return data about what
 * was detected or return false if nothing was detected.
 *
 * @tparam DATA The additional data the command detector needs for execution.
 * @returns Either false or an object with information from the detection.
 */
export type TwitchChatCommandHandlerDetect<DATA extends object = EMPTY_OBJECT> =
  (
    tags: Readonly<ChatUserstate>,
    message: Readonly<string>,
    enabledCommands?: Readonly<string[]>
  ) => false | TwitchChatCommandDetectorDataForHandler<DATA>;

/**
 * The data that was parsed from a successful detected command by a message.
 */
export interface TwitchChatCommandDetectorDataForHandler<
  DATA extends object = EMPTY_OBJECT
> {
  /**
   * The information found by the detector that should be forwarded to the
   * command handler.
   */
  data: DATA;
}

/**
 * The structure of a Twitch message command manager object.
 */
export interface TwitchChatCommandHandler<
  DATA_HANDLE extends object = EMPTY_OBJECT,
  DETECTED_DATA extends object = EMPTY_OBJECT
> {
  /** Information about the command handler. */
  info: TwitchChatCommandHandlerInfo;
  /** The method that detects if something should be handled. */
  detect: TwitchChatCommandHandlerDetect<DETECTED_DATA>;
  /**
   * The method that handles the detected command with additional and forwarded
   * data from the detector.
   */
  createReply: TwitchChatCommandHandlerCreateReply<DATA_HANDLE & DETECTED_DATA>;
}

/**
 * Information about the Twitch chat command manager.
 */
export interface TwitchChatCommandHandlerInfo {
  /** The ID of the command manager. */
  id: string;
  /** The ID of the chat handler that this command belongs to. */
  chatHandlerId: string;
}

// LOG TWITCH RELATED ACTIONS

/**
 * Log a sent Twitch message reply.
 *
 * @param logger The global logger.
 * @param messageId The ID of the message that is replied to.
 * @param sentMessage The sent message information.
 * @param replySourceId The ID of the reply source.
 */
export const logTwitchMessageReply = (
  logger: Logger,
  messageId: string,
  sentMessage: string[],
  replySourceId: string
) => {
  logger.log({
    level: "debug",
    message: `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    section: "twitch_message:reply",
    subsection: replySourceId,
  } as LoggerInformation);
};

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
) => {
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
export const logTwitchMessageCommandDetected = (
  logger: Logger,
  messageId: string,
  message: Readonly<string[]>,
  detectedCommand: TwitchChatCommandHandlerInfo
) => {
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
 * @param commandReply The command reply.
 * @param replyToMessageId The ID of the message that is replied to.
 */
export const logTwitchMessageCommandReply = (
  logger: Logger,
  detectedCommand: TwitchChatCommandHandlerInfo,
  commandReply: TwitchChatCommandHandlerReply,
  replyToMessageId: string
) => {
  logger.log({
    level: "debug",
    message: `Successfully replied to message ${replyToMessageId} using the command "${
      detectedCommand.chatHandlerId
    }:${detectedCommand.id}": '${JSON.stringify(commandReply.sentMessage)}'`,
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
 * @param enabledCommands The enabled commands.
 * @returns True if the command was detected and a reply was sent.
 */
export const runTwitchCommandHandler = async <
  DATA extends DATA_HANDLE,
  DATA_HANDLE extends object,
  DATA_DETECT extends object
>(
  client: Readonly<Client>,
  channel: Readonly<string>,
  tags: Readonly<ChatUserstate>,
  message: Readonly<string>,
  data: DATA,
  globalStrings: Readonly<Strings>,
  globalPlugins: Readonly<Plugins>,
  globalMacros: Readonly<Macros>,
  logger: Readonly<Logger>,
  twitchCommandHandler: TwitchChatCommandHandler<DATA_HANDLE, DATA_DETECT>,
  enabledCommands?: Readonly<string[]>
): Promise<boolean> => {
  const twitchCommandDetected = twitchCommandHandler.detect(
    tags,
    message,
    enabledCommands
  );
  if (twitchCommandDetected) {
    if (tags.id === undefined) {
      throw errorMessageIdUndefined();
    }
    if (tags.username === undefined) {
      throw errorMessageUserNameUndefined();
    }
    logTwitchMessageCommandDetected(
      logger,
      tags.id,
      [tags.username, message],
      twitchCommandHandler.info
    );
    const twitchCommandReply = await twitchCommandHandler.createReply(
      client,
      channel,
      tags,
      { ...data, ...twitchCommandDetected.data },
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    if (Array.isArray(twitchCommandReply)) {
      for (const a of twitchCommandReply) {
        logTwitchMessageCommandReply(
          logger,
          twitchCommandHandler.info,
          a,
          tags.id
        );
      }
    } else {
      logTwitchMessageCommandReply(
        logger,
        twitchCommandHandler.info,
        twitchCommandReply,
        tags.id
      );
    }
    return true;
  }
  return false;
};
