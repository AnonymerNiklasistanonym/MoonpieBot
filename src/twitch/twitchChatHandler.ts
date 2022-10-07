/*
 * Generic helper functions to handle Twitch chat messages.
 */

// Type imports
import type { ChatUserstate, Client } from "tmi.js";
import type { MacroMap, PluginMap } from "../messageParser";
import type { EMPTY_OBJECT } from "../other/types";
import type { Logger } from "winston";
import type { StringMap } from "../strings";

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
