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
 * Regex to recognize the !osuRequests enable command.
 *
 * @example
 * ```text
 * !osuRequests on
 * ```
 */
export const regexMoonpieChatHandlerCommandRequestsOn =
  /^\s*!osuRequests\s+on(?:\s|$)/i;

/**
 * Regex to recognize the !osuRequests disable command.
 *
 * @example
 * ```text
 * !osuRequests off $OPTIONAL_TEXT
 * ```
 */
export const regexMoonpieChatHandlerCommandRequestsOff =
  /^\s*!osuRequests\s+off(?:\s+(.*?)\s*$|\s|$)/i;

/**
 * Regex to recognize the !osuRequests command.
 *
 * @example
 * ```text
 * !osuRequests $OPTIONAL_TEXT
 * ```
 */
export const regexMoonpieChatHandlerCommandRequests =
  /^\s*!osuRequests(?:\s|$)/i;

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
 * - The first group is the optional rank.
 *
 * @example
 * ```text
 * !moonpie leaderboard
 * ```
 * @example
 * ```text
 * !moonpie leaderboard 20
 * ```
 */
export const regexMoonpieChatHandlerCommandLeaderboard =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!moonpie\s+leaderboard(?:\s+([0-9]+))?(?:\s|$)/i;

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
 * Regex to recognize the `!score osuName $OPTIONAL_TEXT_WITH_SPACES` command.
 *
 * - The first group is the custom osu user name string.
 *
 * @example
 * ```text
 * !score osuName $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexOsuChatHandlerCommandScore = /^\s*!score\s+(\S+)(?:\s|$)/i;

/**
 * Regex that matches osu beatmap URLs in any message.
 *
 * - The first group is the osu beatmap ID number in the format `https://osu.ppy.sh/beatmaps/$ID`.
 * - The second group is the osu beatmap ID number in the format `https://osu.ppy.sh/beatmapsets/MAPSETID#osu/$ID`.
 * - The third group is the optional comment string.
 *
 * @example
 * ```text
 * $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 * @example
 * ```text
 * $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmaps/2587891 $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexOsuBeatmapUrlMatcher =
  // eslint-disable-next-line security/detect-unsafe-regex
  /https:\/\/osu\.ppy\.sh\/(?:beatmaps\/(\d+)|beatmapsets\/\d+\/?#\S+\/(\d+))(?:\s+(.+?)\s*$)?/i;

export const regexOsuBeatmapDownloadUrlMatcher =
  /https?:\/\/osu\.ppy\.sh\/b\/(\d+)/;

/**
 * Regex to parse the now playing window title on Windows.
 *
 * - The first capture group is the artist.
 * - The second group is the title.
 * - The third group is the name of the difficulty.
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

/**
 * Regex to recognize the `!song` command.
 *
 * @example
 * ```text
 * !song $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexSpotifyChatHandlerCommandSong = /^\s*!song(?:\s|$)/i;
