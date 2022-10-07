/*
 * Generic helper functions to log Twitch chat messages.
 */

// Local imports
import { LoggerInformation } from "../logging";
// Type imports
import type { ChatMessageHandlerInfo } from "./runChatMessageHandler";
import type { Logger } from "winston";

/**
 * Log a sent Twitch broadcast message.
 *
 * @param logger The global logger.
 * @param sentMessage The sent message information.
 * @param broadcastSourceId The ID of the broadcast source.
 */
export const logBroadcastedMessage = (
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
export const logDetectedCommandInChatMessage = (
  logger: Logger,
  messageId: string,
  message: Readonly<string[]>,
  detectedCommand: ChatMessageHandlerInfo
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
export const logChatMessageReply = (
  logger: Logger,
  detectedCommand: ChatMessageHandlerInfo,
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
