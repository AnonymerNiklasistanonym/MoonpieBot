/*
 * Twitch Client/Connection setup and general functions surrounding chat message
 * handling.
 */

// Package imports
import { client as tmiClient } from "tmi.js";
// Local imports
import { createLogFunc } from "./logging";
// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { Macros, Plugins } from "./messageParser";
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
  const logTwitch = createLogFunc(logger, LOG_ID_MODULE_TWITCH, {
    subsection: "create_client",
  });

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

  logTwitch.info(
    `Create Twitch client for the account "${twitchName}" in the channels: ${twitchChannels
      .map((a) => `"${a}"`)
      .join(", ")}`
  );

  // Create Twitch client that can listen to all specified channels
  const client: Client = new tmiClient({
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
  });

  return client;
};

export interface TwitchChatHandlerSuccessfulReply {
  sentMessage: [string];
}

export interface TwitchChatHandlerCommandDetect<DATA> {
  detectorId?: string;
  data: DATA;
}

type EMPTY_OBJECT = Record<never, never>;

/**
 * A global type for all Twitch chat (message) handler functions.
 *
 * @tparam DATA A custom data object for the command.
 * @tparam RETURN_VALUE A custom return value type for the command.
 */
export type TwitchChatHandler<DATA = undefined, RETURN_VALUE = void> = (
  client: Readonly<Client>,
  channel: Readonly<string>,
  /**
   * The Twitch chat state of a user which contains for example their user name,
   * id, badges, ...
   */
  tags: Readonly<ChatUserstate>,
  message: Readonly<string>,
  /**
   * The custom data of this Twitch chat message handler.
   */
  data: DATA,
  enabledCommands: Readonly<string[]>,
  globalStrings: Readonly<Strings>,
  globalPlugins: Readonly<Plugins>,
  globalMacros: Readonly<Macros>,
  logger: Readonly<Logger>
) => Promise<RETURN_VALUE>;

export type TwitchChatCommandDetector<DATA = EMPTY_OBJECT> = (
  tags: Readonly<ChatUserstate>,
  message: Readonly<string>,
  enabledCommands?: Readonly<string[]>
) => false | TwitchChatHandlerCommandDetect<DATA>;

/**
 * A global type for all Twitch chat (message) command handler functions.
 *
 * @tparam DATA A custom data object for the command.
 */
export type TwitchChatCommandHandler<DATA = EMPTY_OBJECT> = (
  client: Readonly<Client>,
  channel: Readonly<string>,
  /**
   * The Twitch chat state of a user which contains for example their user name,
   * id, badges, ...
   */
  tags: Readonly<ChatUserstate>,
  /**
   * The custom data of this Twitch chat message handler.
   */
  data: DATA,
  globalStrings: Readonly<Strings>,
  globalPlugins: Readonly<Plugins>,
  globalMacros: Readonly<Macros>,
  logger: Readonly<Logger>
) => Promise<
  TwitchChatHandlerSuccessfulReply | TwitchChatHandlerSuccessfulReply[]
>;

/**
 * Additional information for Twitch logs.
 */
export interface LogTwitchMessageOptions {
  subsection?: string;
}

export interface TwitchChatCommandInfo {
  groupId: string;
  id: string;
}

export interface TwitchMessageCommandHandler<
  DATA_HANDLE = EMPTY_OBJECT,
  DATA_DETECTOR = EMPTY_OBJECT
> {
  info: TwitchChatCommandInfo;
  detect: TwitchChatCommandDetector<DATA_DETECTOR>;
  handle: TwitchChatCommandHandler<DATA_HANDLE & DATA_DETECTOR>;
}

// eslint-disable-next-line jsdoc/require-returns
/**
 * Log a Twitch message.
 *
 * @param logger The global logger.
 * @param message The message to log.
 * @param options Additional information like a subsection.
 */
export const logTwitchMessage = (
  logger: Logger,
  message: string,
  options?: LogTwitchMessageOptions
): void =>
  createLogFunc(logger, "twitch_message", {
    subsection: options?.subsection,
  }).debug(message);

// eslint-disable-next-line jsdoc/require-returns
/**
 * Log a Twitch message reply.
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
) =>
  logTwitchMessage(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { subsection: replySourceId }
  );

// eslint-disable-next-line jsdoc/require-returns
/**
 * Log a Twitch broadcast message.
 *
 * @param logger The global logger.
 * @param sentMessage The sent message information.
 * @param broadcastSourceId The ID of the broadcast source.
 */
export const logTwitchMessageBroadcast = (
  logger: Logger,
  sentMessage: string[],
  broadcastSourceId: string
) =>
  logTwitchMessage(
    logger,
    `Successfully broadcasted: '${JSON.stringify(sentMessage)}'`,
    {
      subsection: broadcastSourceId,
    }
  );

// eslint-disable-next-line jsdoc/require-returns
/**
 * Log a detected command in a  Twitch message.
 *
 * @param logger The global logger.
 * @param messageId The ID of the message that is replied to.
 * @param message The message that something was detected in.
 * @param detectionReason What was detected.
 * @param detectorSourceId The ID of the detection source.
 */
export const logTwitchMessageDetected = (
  logger: Logger,
  messageId: string,
  message: string[],
  detectionReason: string,
  detectorSourceId: string
) =>
  logTwitchMessage(
    logger,
    `Detected ${detectionReason} in message ${messageId}: ${JSON.stringify(
      message
    )}`,
    { subsection: detectorSourceId }
  );

export const twitchChatCommandDetected = <DATA>(
  logger: Logger,
  commandInfo: TwitchChatCommandInfo,
  commandDetected: TwitchChatHandlerCommandDetect<DATA>,
  messageId: string | undefined,
  userName: string | undefined,
  message: string
) => {
  logTwitchMessageDetected(
    logger,
    messageId ? messageId : "UNDEFINED",
    [userName ? `#${userName}` : "UNDEFINED", message],
    commandDetected.detectorId ? commandDetected.detectorId : commandInfo.id,
    `${commandInfo.groupId}:${commandInfo.id}`
  );
};

export const twitchChatCommandReply = (
  logger: Logger,
  commandInfo: TwitchChatCommandInfo,
  commandReply: TwitchChatHandlerSuccessfulReply,
  replyToMessageId: string | undefined
) => {
  logTwitchMessageReply(
    logger,
    replyToMessageId ? replyToMessageId : "UNDEFINED",
    commandReply.sentMessage,
    `${commandInfo.groupId}:${commandInfo.id}`
  );
};

export const handleTwitchCommand = async <
  DATA extends DATA_HANDLE,
  DATA_HANDLE,
  DATA_DETECT
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
  command: TwitchMessageCommandHandler<DATA_HANDLE, DATA_DETECT>,
  enabledCommands?: Readonly<string[]>
): Promise<boolean> => {
  const commandDetected = command.detect(tags, message, enabledCommands);
  if (commandDetected) {
    twitchChatCommandDetected(
      logger,
      command.info,
      commandDetected,
      tags.id,
      tags.username,
      message
    );
    const commandReply = await command.handle(
      client,
      channel,
      tags,
      { ...data, ...commandDetected.data },
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );
    if (Array.isArray(commandReply)) {
      for (const a of commandReply) {
        twitchChatCommandReply(logger, command.info, a, tags.id);
      }
    } else {
      twitchChatCommandReply(logger, command.info, commandReply, tags.id);
    }
    return true;
  }
  return false;
};
