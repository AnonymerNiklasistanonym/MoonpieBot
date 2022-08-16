/**
 * Regex to recognize the `!moonpie about` command.
 *
 * @example
 * ```text
 * !moonpie about
 * ```
 */
export const regexMoonpieChatHandlerCommandAbout =
  /^\s*!moonpie\s+about(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie` command.
 *
 * @example
 * ```text
 * !moonpie
 * ```
 * @example
 * ```text
 * !moonpie Give me moonpie pls
 * ```
 */
export const regexMoonpieChatHandlerCommandClaim = /^\s*!moonpie(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie commands` command.
 *
 * @example
 * ```text
 * !moonpie commands
 * ```
 */
export const regexMoonpieChatHandlerCommandCommands =
  /^\s*!moonpie\s+commands(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie leaderboard` command.
 *
 * @example
 * ```text
 * !moonpie leaderboard
 * ```
 */
export const regexMoonpieChatHandlerCommandLeaderboard =
  /^\s*!moonpie\s+leaderboard(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie get $USER` command.
 *
 * - The first group is the user name string.
 *
 * @example
 * ```text
 * !moonpie get alexa123
 * ```
 */
export const regexMoonpieChatHandlerCommandUserGet =
  /^\s*!moonpie\s+get\s+(\S+)(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie set $USER $COUNT` command.
 *
 * - The first group is the user name string.
 * - The second group is the moonpie count that should be set.
 *
 * @example
 * ```text
 * !moonpie set alexa123 727
 * ```
 */
export const regexMoonpieChatHandlerCommandUserSet =
  /^\s*!moonpie\s+set\s+(\S+)\s+([0-9]+)(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie add $USER $COUNT` command.
 *
 * - The first group is the user name string.
 * - The second group is the moonpie count that should be added.
 *
 * @example
 * ```text
 * !moonpie add alexa123 3
 * ```
 */
export const regexMoonpieChatHandlerCommandUserAdd =
  /^\s*!moonpie\s+add\s+(\S+)\s+([0-9]+)(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie remove $USER $COUNT` command.
 *
 * - The first group is the user name string.
 * - The second group is the moonpie count that should be removed.
 *
 * @example
 * ```text
 * !moonpie remove alexa123 4
 * ```
 */
export const regexMoonpieChatHandlerCommandUserRemove =
  /^\s*!moonpie\s+remove\s+(.*?)\s+([0-9]+)(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie delete $USER` command.
 *
 * - The first group is the user name string.
 *
 * @example
 * ```text
 * !moonpie delete alexa123
 * ```
 */
export const regexMoonpieChatHandlerCommandUserDelete =
  /^\s*!moonpie\s+delete\s+(\S+)(?:\s|$)/i;

/**
 * Regex to recognize the `!np` command.
 *
 * @example
 * ```text
 * !np $OPTIONAL_TEXT
 * ```
 */
export const regexOsuChatHandlerCommandNp = /^\s*!np(?:\s|$)/i;

/**
 * Regex to recognize the `!pp` command.
 *
 * - The first group is the custom osu ID number.
 * - The second group is the custom osu user name string.
 *
 * @example
 * ```text
 * !pp
 * ```
 * @example
 * ```text
 * !pp $CUSTOM_USER_ID $OPTIONAL_TEXT
 * ```
 * @example
 * ```text
 * !pp $CUSTOM_USER_NAME $OPTIONAL_TEXT
 * ```
 */
export const regexOsuChatHandlerCommandPp =
  /^\s*!pp(?:\s+(?:([0-9]+)|(\S+))(?:\s|$)|\s|$)/i;

/**
 * Regex to recognize the `!rp` command.
 *
 * - The first group is the custom osu ID number.
 * - The second group is the custom osu user name string.
 *
 * @example
 * ```text
 * !rp
 * ```
 * @example
 * ```text
 * !rp $CUSTOM_USER_ID $OPTIONAL_TEXT
 * ```
 * @example
 * ```text
 * !rp $CUSTOM_USER_NAME $OPTIONAL_TEXT
 * ```
 */
export const regexOsuChatHandlerCommandRp =
  /^\s*!rp(?:\s+(?:([0-9]+)|(\S+))(?:\s|$)|\s|$)/i;

/**
 * Regex to parse the now playing window title on Windows.
 * The first capture group is the artist, the second the title and the third
 * the name of the difficulty.
 *
 * @example
 * ```text
 * osu! - Artist - Title [Difficulty]
 * ```
 * @example
 * ```text
 * osu! - Artist - Title [TV Size] [Difficulty]
 * ```
 */
export const regexOsuWindowTitleNowPlaying =
  /^\S+\s+-\s+(.+?)\s+-\s+(.+?)\s+\[\s*([^[\]]+?)\s*\]$/;
