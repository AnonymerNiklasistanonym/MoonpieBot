/*
 * Generic helper functions to handle chat messages.
 */

// Type imports
import type { DeepReadonly, EMPTY_OBJECT } from "../other/types";
import type { MacroMap, PluginMap } from "../messageParser";
import type {
  ChatUserstate as TwitchChatState,
  Client as TwitchClient,
} from "tmi.js";
import type { Logger } from "winston";
import type { StringMap } from "../messageParser";

/**
 * A type for all chat message handler functions.
 *
 * @typeParam DATA The additional data the chat message handler needs for run.
 */
export type ChatMessageHandler<DATA extends object = EMPTY_OBJECT> = (
  /** The Twitch client. */
  client: DeepReadonly<TwitchClient>,
  /** The Twitch channel where the current message was written. */
  channel: string,
  /**
   * The Twitch (user) chat state (the user name/id/badges of the user that
   * wrote the current message).
   */
  tags: DeepReadonly<TwitchChatState>,
  /** The current Twitch message. */
  message: string,
  /** The additional data necessary for execution. */
  data: DATA,
  /** The global strings object to get strings for parsing. */
  globalStrings: DeepReadonly<StringMap>,
  /** The global plugin object to generate text from strings. */
  globalPlugins: DeepReadonly<PluginMap>,
  /** The global macro object to generate text from strings. */
  globalMacros: DeepReadonly<MacroMap>,
  /** The global logger. */
  logger: Readonly<Logger>
) => Promise<void>;
