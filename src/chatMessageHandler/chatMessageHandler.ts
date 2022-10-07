/*
 * Generic helper functions to handle chat messages.
 */

// Type imports
import type { MacroMap, PluginMap } from "../messageParser";
import type {
  ChatUserstate as TwitchChatState,
  Client as TwitchClient,
} from "tmi.js";
import type { EMPTY_OBJECT } from "../other/types";
import type { Logger } from "winston";
import type { StringMap } from "../messageParser";

/**
 * A type for all chat message handler functions.
 *
 * @typeParam DATA The additional data the chat message handler needs for run.
 */
export type ChatMessageHandler<DATA extends object = EMPTY_OBJECT> = (
  /** The Twitch client. */
  client: Readonly<TwitchClient>,
  /** The Twitch channel where the current message was written. */
  channel: Readonly<string>,
  /**
   * The Twitch (user) chat state (the user name/id/badges of the user that
   * wrote the current message).
   */
  tags: Readonly<TwitchChatState>,
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
