// Type imports
import type { EMPTY_OBJECT } from "../other/types";

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

export interface RegexOsuChatHandlerCommandRequests {
  requestsOff?: "off";
  requestsOn?: "on";
  requestsOnOffMessage?: string;
}
/**
 * Regex to recognize the !osuRequests (on|off $OPTIONAL_MESSAGE) command.
 *
 * @example
 * ```text
 * !osuRequests
 * ```
 * @example
 * ```text
 * !osuRequests off $OPTIONAL_TEXT
 * ```
 * @example
 * ```text
 * !osuRequests on
 * ```
 */
export const regexOsuChatHandlerCommandRequests =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!osuRequests(?:(?:\s+(?<requestsOn>on)|\s+(?<requestsOff>off))(?:\s+(?<requestsOnOffMessage>.*?)\s*$|\s|$)?)?(?:\s|$)/i;

export interface RegexOsuChatHandlerCommandRequestsSet {
  setOption: string;
  setOptionValue: string;
}
/**
 * Regex to recognize the !osuRequests set $OPTION $VALUE command.
 *
 * @example
 * ```text
 * !osuRequests set messageOn new message
 * ```
 * @example
 * ```text
 * !osuRequests set minAr 7
 * ```
 * @example
 * ```text
 * !osuRequests set maxStar 10
 * ```
 */
export const regexOsuChatHandlerCommandRequestsSet =
  /^\s*!osuRequests\s+set\s+(?<setOption>\S+)\s+(?<setOptionValue>.+?)(?:\s*$)/i;

export interface RegexOsuChatHandlerCommandRequestsUnset {
  unsetOption: string;
}
/**
 * Regex to recognize the !osuRequests set $OPTION $VALUE command.
 *
 * @example
 * ```text
 * !osuRequests unset messageOn
 * ```
 * @example
 * ```text
 * !osuRequests unset minAr
 * ```
 * @example
 * ```text
 * !osuRequests unset maxStar
 * ```
 */
export const regexOsuChatHandlerCommandRequestsUnset =
  /^\s*!osuRequests\s+unset\s+(?<unsetOption>\S+)(?:\s|$)/i;

export interface RegexOsuChatHandlerCommandLastRequest {
  lastRequestCount?: string;
}
/**
 * Regex to recognize the !osuLastRequests $OPTIONAL_COUNT command.
 *
 * @example
 * ```text
 * !osuLastRequests
 * ```
 * @example
 * ```text
 * !osuLastRequests 5
 * ```
 */
export const regexOsuChatHandlerCommandLastRequest =
  /^\s*!osuLastRequest(?:\s+(?<lastRequestCount>[0-9]+)(?:\s|$)|\s|$)/i;

/**
 * Regex to recognize the !osuPermitRequest command.
 *
 * @example
 * ```text
 * !osuPermitRequest
 * ```
 */
export const regexOsuChatHandlerCommandPermitRequest =
  /^\s*!osuPermitRequest(?:\s|$)/i;

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
 * Regex to recognize the `!spotify commands` command.
 *
 * @example
 * ```text
 * !spotify commands
 * ```
 */
export const regexSpotifyChatHandlerCommandCommands =
  /^\s*!spotify\s+commands(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandLeaderboard {
  startingRank?: string;
}
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
  /^\s*!moonpie\s+leaderboard(?:\s+(?<startingRank>[0-9]+))?(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandUserGet {
  userName: string;
}
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
  /^\s*!moonpie\s+get\s+(?<userName>\S+)(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandUserSet {
  moonpieCountSet: string;
  userName: string;
}
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
  /^\s*!moonpie\s+set\s+(?<userName>\S+)\s+(?<moonpieCountSet>[0-9]+)(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandUserAdd {
  moonpieCountAdd: string;
  userName: string;
}
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
  /^\s*!moonpie\s+add\s+(?<userName>\S+)\s+(?<moonpieCountAdd>[0-9]+)(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandUserRemove {
  moonpieCountRemove: string;
  userName: string;
}
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
  /^\s*!moonpie\s+remove\s+(?<userName>\S+)\s+(?<moonpieCountRemove>[0-9]+)(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandUserDelete {
  userName: string;
}
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
  /^\s*!moonpie\s+delete\s+(?<userName>\S+)(?:\s|$)/i;

/**
 * Regex to recognize the `!osu commands` command.
 *
 * @example
 * ```text
 * !osu commands
 * ```
 */
export const regexOsuChatHandlerCommandCommands =
  /^\s*!osu\s+commands(?:\s|$)/i;

/**
 * Regex to recognize the `!np` command.
 *
 * @example
 * ```text
 * !np $OPTIONAL_TEXT
 * ```
 */
export const regexOsuChatHandlerCommandNp = /^\s*!np(?:\s|$)/i;

export interface RegexOsuChatHandlerCommandPpUserId {
  osuUserId: string;
}
export interface RegexOsuChatHandlerCommandPpUserName {
  osuUserName: string;
}
export type RegexOsuChatHandlerCommandPp =
  | EMPTY_OBJECT
  | RegexOsuChatHandlerCommandPpUserId
  | RegexOsuChatHandlerCommandPpUserName;
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
  /^\s*!pp(?:\s+(?:(?<osuUserId>[0-9]+)|(?<osuUserName>\S+))(?:\s|$)|\s|$)/i;

export interface RegexOsuChatHandlerCommandRpUserId {
  osuUserId: string;
}
export interface RegexOsuChatHandlerCommandRpUserName {
  osuUserName: string;
}
export type RegexOsuChatHandlerCommandRp =
  | EMPTY_OBJECT
  | RegexOsuChatHandlerCommandRpUserId
  | RegexOsuChatHandlerCommandRpUserName;
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
  /^\s*!rp(?:\s+(?:(?<osuUserId>[0-9]+)|(?<osuUserName>\S+))(?:\s|$)|\s|$)/i;

export interface RegexOsuChatHandlerCommandScore {
  osuUserName: string;
}
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
export const regexOsuChatHandlerCommandScore =
  /^\s*!score\s+(?<osuUserName>(?:'[^'"]+'|\S+))(?:\s|$)/i;

export interface RegexOsuBeatmapIdFromUrlBase {
  comment?: string;
}
export interface RegexOsuBeatmapIdFromUrlB
  extends RegexOsuBeatmapIdFromUrlBase {
  beatmapIdB: string;
}
export interface RegexOsuBeatmapIdFromUrlBeatmaps
  extends RegexOsuBeatmapIdFromUrlBase {
  beatmapIdBeatmaps: string;
}
export interface RegexOsuBeatmapIdFromUrlBeatmapSets
  extends RegexOsuBeatmapIdFromUrlBase {
  beatmapIdBeatmapsets: string;
}
export type RegexOsuBeatmapIdFromUrl =
  | RegexOsuBeatmapIdFromUrlB
  | RegexOsuBeatmapIdFromUrlBeatmaps
  | RegexOsuBeatmapIdFromUrlBeatmapSets;
/**
 * Regex that matches osu beatmap URLs in any message.
 *
 * - The first group is the osu beatmap ID number in the format `https://osu.ppy.sh/b/$ID`.
 * - The second group is the osu beatmap ID number in the format `https://osu.ppy.sh/beatmaps/$ID`.
 * - The third group is the osu beatmap ID number in the format `https://osu.ppy.sh/beatmapsets/MAPSETID#osu/$ID`.
 * - The fourth group is the optional comment string.
 *
 * @example
 * ```text
 * https://osu.ppy.sh/b/2587891 $COMMENT
 * ```
 * @example
 * ```text
 * https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $COMMENT
 * ```
 * @example
 * ```text
 * https://osu.ppy.sh/beatmaps/2587891 $COMMENT
 * ```
 */
export const regexOsuBeatmapIdFromUrl =
  // eslint-disable-next-line security/detect-unsafe-regex
  /https:\/\/osu\.ppy\.sh\/(?:b\/(?<beatmapIdB>\d+)|beatmaps\/(?<beatmapIdBeatmaps>\d+)|beatmapsets\/\d+\/?#\S+\/(?<beatmapIdBeatmapsets>\d+))(?:\s+(?<comment>\S.*?)\s*$)?/i;

export const regexOsuBeatmapUrlSplitter = (message: string): string[] =>
  message.split(/(?=https?:\/\/osu\.ppy\.sh\/(?:b|beatmaps|beatmapsets)\/)/);

export interface RegexOsuWindowTitleNowPlaying {
  artist: string;
  title: string;
  version: string;
}
/**
 * Regex to parse the now playing window title on Windows.
 *
 * - The first capture group is the artist.
 * - The second group is the title.
 * - The third group is the name of the version.
 *
 * @example
 * ```text
 * osu! - Artist - Title [Version]
 * ```
 * @example
 * ```text
 * osu! - Artist - Title [TV Size] [Version]
 * ```
 */
export const regexOsuWindowTitleNowPlaying =
  /^\S+\s+-\s+(?<artist>.+?)\s+-\s+(?<title>.+?)\s+\[\s*(?<version>[^[\]]+?)\s*\]$/;

/**
 * Regex to recognize the `!song` command.
 *
 * @example
 * ```text
 * !song $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexSpotifyChatHandlerCommandSong = /^\s*!song(?:\s|$)/i;

/**
 * Regex to recognize the !cc/!cb commands command.
 *
 * @example
 * ```text
 * !cc commands
 * ```
 * @example
 * ```text
 * !cb commands
 * ```
 */
export const regexCustomCommandsBroadcastsCommands =
  /^\s*!(?:ccs?|cbs?|ccs?cbs?)\s+commands(?:\s*$)/i;

export interface RegexCustomCommandAdd {
  customCommandCooldownInS?: string;
  customCommandId: string;
  customCommandMessage: string;
  customCommandRegex: string;
  customCommandUserLevel?: "mod" | "vip" | "none" | "broadcaster";
}
/**
 * Regex to recognize the !addcc command.
 *
 * @example
 * ```text
 * !addcc ID REGEX MESSAGE -ul=mod -cd=12
 * ```
 */
export const regexCustomCommandAdd =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!addcc\s+(?<customCommandId>'.+?'|(?!')\S+(?!'))\s+(?<customCommandRegex>'.+?'|(?!')\S+(?!'))\s+(?<customCommandMessage>'.+?'|(?!')\S+(?!'))(?:\s+-ul=(?<customCommandUserLevel>mod|vip|none|broadcaster))?(?:\s+-cd=(?<customCommandCooldownInS>[0-9]+))?(?:\s|$)/i;
export interface RegexCustomCommandDelete {
  customCommandId: string;
}
/**
 * Regex to recognize the !delcc command.
 *
 * @example
 * ```text
 * !delcc ID
 * ```
 */
export const regexCustomCommandDelete =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!delcc\s+(?<customCommandId>'.+?'|(?!')\S+(?!'))(?:\s|$)/i;
export interface RegexCustomCommandList {
  customCommandId?: string;
}
export interface RegexCustomCommandListOffset {
  customCommandOffset?: string;
}
/**
 * Regex to recognize the !listccs command.
 *
 * @example
 * ```text
 * !listccs ID
 * ```
 * @example
 * ```text
 * !listccs 2
 * ```
 */
export const regexCustomCommandList =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!listccs?(?:\s+(?<customCommandOffset>[0-9]+?)|\s+(?<customCommandId>'.+?'|(?!')\S+(?!')))?(?:\s|$)/i;
export interface RegexCustomCommandEdit {
  customCommandId: string;
  customCommandOption: string;
  customCommandOptionValue: string;
}
/**
 * Regex to recognize the !editcc command.
 *
 * @example
 * ```text
 * !editcc ID OPTION OPTION_VALUE
 * ```
 */
export const regexCustomCommandEdit =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!editcc\s+(?<customCommandId>'.+?'|(?!')\S+(?!'))\s+(?<customCommandOption>\S+)\s+(?<customCommandOptionValue>'.+?'|(?!')\S+(?!'))(?:\s|$)/i;

export interface RegexCustomBroadcastAdd {
  customBroadcastCronString: string;
  customBroadcastId: string;
  customBroadcastMessage: string;
}
/**
 * Regex to recognize the !addcc command.
 *
 * @example
 * ```text
 * !addcb ID CRON_STRING MESSAGE
 * ```
 */
export const regexCustomBroadcastAdd =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!addcb\s+(?<customBroadcastId>'.+?'|(?!')\S+(?!'))\s+(?<customBroadcastCronString>'.+?'|(?!')\S+(?!'))\s+(?<customBroadcastMessage>'.+?'|(?!')\S+(?!'))(?:\s|$)/i;
export interface RegexCustomBroadcastDelete {
  customBroadcastId: string;
}
/**
 * Regex to recognize the !delcb command.
 *
 * @example
 * ```text
 * !delcb ID
 * ```
 */
export const regexCustomBroadcastDelete =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!delcb\s+(?<customBroadcastId>'.+?'|(?!')\S+(?!'))(?:\s|$)/i;

export interface RegexCustomBroadcastList {
  customBroadcastId?: string;
}
export interface RegexCustomBroadcastListOffset {
  customBroadcastOffset?: string;
}
/**
 * Regex to recognize the !listcbs command.
 *
 * @example
 * ```text
 * !listcbs ID
 * ```
 * @example
 * ```text
 * !listcbs 2
 * ```
 */
export const regexCustomBroadcastList =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!listcbs?(?:\s+(?<customBroadcastOffset>[0-9]+?)|\s+(?<customBroadcastId>'.+?'|(?!')\S+(?!')))?(?:\s|$)/i;
export interface RegexCustomBroadcastEdit {
  customBroadcastId: string;
  customBroadcastOption: string;
  customBroadcastOptionValue: string;
}
/**
 * Regex to recognize the !editcb command.
 *
 * @example
 * ```text
 * !editcb ID OPTION OPTION_VALUE
 * ```
 */
export const regexCustomBroadcastEdit =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^\s*!editcb\s+(?<customBroadcastId>'.+?'|(?!')\S+(?!'))\s+(?<customBroadcastOption>\S+)\s+(?<customBroadcastOptionValue>'.+?'|(?!')\S+(?!'))(?:\s|$)/i;

export const regexLurkChatHandlerCommandLurk = /^\s*!lurk(?:\s|$)/i;
