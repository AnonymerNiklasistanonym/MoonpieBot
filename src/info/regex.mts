/* eslint-disable security/detect-unsafe-regex */

// Type imports
import type { EMPTY_OBJECT } from "../other/types.mjs";

/**
 * Regex to recognize the `!moonpie about` command.
 *
 * @example
 * ```text
 * !moonpie about
 * ```
 */
export const regexMoonpieChatHandlerCommandAbout: Readonly<RegExp> =
  /^\s*!moonpie\s+about(?:\s|$)/i;

export interface RegexOsuChatHandlerCommandRequests {
  message?: string;
  off?: "off";
  on?: "on";
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
export const regexOsuChatHandlerCommandRequests: Readonly<RegExp> =
  /^\s*!osuRequests(?:(?:\s+(?<on>on)|\s+(?<off>off))(?:\s+(?<message>'[^']+'|\S+)\s*$|\s|$)?)?(?:\s|$)/i;

export interface RegexOsuChatHandlerCommandRequestsSet {
  option: string;
  optionValue: string;
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
export const regexOsuChatHandlerCommandRequestsSet: Readonly<RegExp> =
  /^\s*!osuRequests\s+set\s+(?<option>\S+)\s+(?<optionValue>'[^']+'|\S+)(?:\s*$)/i;

export interface RegexOsuChatHandlerCommandRequestsUnset {
  option: string;
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
export const regexOsuChatHandlerCommandRequestsUnset: Readonly<RegExp> =
  /^\s*!osuRequests\s+unset\s+(?<option>\S+)(?:\s|$)/i;

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
export const regexOsuChatHandlerCommandLastRequest: Readonly<RegExp> =
  /^\s*!osuLastRequest(?:\s+(?<lastRequestCount>[0-9]+)(?:\s|$)|\s|$)/i;

/**
 * Regex to recognize the !osuPermitRequest command.
 *
 * @example
 * ```text
 * !osuPermitRequest
 * ```
 */
export const regexOsuChatHandlerCommandPermitRequest: Readonly<RegExp> =
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
export const regexMoonpieChatHandlerCommandClaim: Readonly<RegExp> =
  /^\s*!moonpie(?:\s|$)/i;

/**
 * Regex to recognize the `!moonpie commands` command.
 *
 * @example
 * ```text
 * !moonpie commands
 * ```
 */
export const regexMoonpieChatHandlerCommandCommands: Readonly<RegExp> =
  /^\s*!moonpie\s+commands(?:\s|$)/i;

/**
 * Regex to recognize the `!spotify commands` command.
 *
 * @example
 * ```text
 * !spotify commands
 * ```
 */
export const regexSpotifyChatHandlerCommandCommands: Readonly<RegExp> =
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
export const regexMoonpieChatHandlerCommandLeaderboard: Readonly<RegExp> =
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
export const regexMoonpieChatHandlerCommandUserGet: Readonly<RegExp> =
  /^\s*!moonpie\s+get\s+(?<userName>(?:'[^']+'|\S+))(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandUserSet {
  countSet: string;
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
export const regexMoonpieChatHandlerCommandUserSet: Readonly<RegExp> =
  /^\s*!moonpie\s+set\s+(?<userName>(?:'[^']+'|\S+))\s+(?<countSet>[0-9]+)(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandUserAdd {
  countAdd: string;
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
export const regexMoonpieChatHandlerCommandUserAdd: Readonly<RegExp> =
  /^\s*!moonpie\s+add\s+(?<userName>(?:'[^']+'|\S+))\s+(?<countAdd>[0-9]+)(?:\s|$)/i;

export interface RegexMoonpieChatHandlerCommandUserRemove {
  countRemove: string;
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
export const regexMoonpieChatHandlerCommandUserRemove: Readonly<RegExp> =
  /^\s*!moonpie\s+remove\s+(?<userName>(?:'[^']+'|\S+))\s+(?<countRemove>[0-9]+)(?:\s|$)/i;

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
export const regexMoonpieChatHandlerCommandUserDelete: Readonly<RegExp> =
  /^\s*!moonpie\s+delete\s+(?<userName>(?:'[^']+'|\S+))(?:\s|$)/i;

/**
 * Regex to recognize the `!osu commands` command.
 *
 * @example
 * ```text
 * !osu commands
 * ```
 */
export const regexOsuChatHandlerCommandCommands: Readonly<RegExp> =
  /^\s*!osu\s+commands(?:\s|$)/i;

/**
 * Regex to recognize the `!np` command.
 *
 * @example
 * ```text
 * !np $OPTIONAL_TEXT
 * ```
 */
export const regexOsuChatHandlerCommandNp: Readonly<RegExp> =
  /^\s*!np(?:\s|$)/i;

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
export const regexOsuChatHandlerCommandPp: Readonly<RegExp> =
  /^\s*!pp(?:\s+(?:(?<osuUserId>[0-9]+)|(?<osuUserName>(?:'[^']+'|\S+)))(?:\s|$)|\s|$)/i;

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
export const regexOsuChatHandlerCommandRp: Readonly<RegExp> =
  /^\s*!rp(?:\s+(?:(?<osuUserId>[0-9]+)|(?<osuUserName>(?:'[^']+'|\S+)))(?:\s|$)|\s|$)/i;

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
export const regexOsuChatHandlerCommandScore: Readonly<RegExp> =
  /^\s*!score\s+(?<osuUserName>(?:'[^']+'|\S+))(?:\s|$)/i;

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
export interface RegexOsuBeatmapIdFromUrlBeatmapSetsDownload
  extends RegexOsuBeatmapIdFromUrlBase {
  beatmapIdBeatmapsetsDownload: string;
}
export type RegexOsuBeatmapIdFromUrl =
  | RegexOsuBeatmapIdFromUrlB
  | RegexOsuBeatmapIdFromUrlBeatmaps
  | RegexOsuBeatmapIdFromUrlBeatmapSets
  | RegexOsuBeatmapIdFromUrlBeatmapSetsDownload;
/**
 * Regex that matches osu beatmap URLs in any message.
 *
 * It returns different named groups for the following number of links using
 * the following type {@link RegexOsuBeatmapIdFromUrl} if there is a match.
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
 * https://osu.ppy.sh/beatmapsets/908336/download $COMMENT
 * ```
 * @example
 * ```text
 * https://osu.ppy.sh/beatmaps/2587891 $COMMENT
 * ```
 */
export const regexOsuBeatmapIdFromUrl: Readonly<RegExp> =
  /https:\/\/osu\.ppy\.sh\/(?:b\/(?<beatmapIdB>\d+)|beatmaps\/(?<beatmapIdBeatmaps>\d+)|beatmapsets\/\d+\/?#\S+\/(?<beatmapIdBeatmapsets>\d+)|beatmapsets\/(?<beatmapIdBeatmapsetsDownload>\d+)(?:\/download)?)\/?(?:\s+(?<comment>\S.*?)\s*$)?/i;

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
export const regexOsuWindowTitleNowPlaying: Readonly<RegExp> =
  /^\S+\s+-\s+(?<artist>.+?)\s+-\s+(?<title>.+?)\s+\[\s*(?<version>[^[\]]+?)\s*\]$/;

/**
 * Regex to recognize the `!song` command.
 *
 * @example
 * ```text
 * !song $OPTIONAL_TEXT_WITH_SPACES
 * ```
 */
export const regexSpotifyChatHandlerCommandSong: Readonly<RegExp> =
  /^\s*!song(?:\s|$)/i;

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
export const regexCustomCommandsBroadcastsCommands: Readonly<RegExp> =
  /^\s*!(?:ccs?|cbs?|ccs?cbs?)\s+commands(?:\s*$)/i;

export interface RegexCustomCommandAdd {
  cooldownInS?: string;
  id: string;
  message: string;
  regex: string;
  userLevel?: "mod" | "vip" | "none" | "broadcaster";
}
/**
 * Regex to recognize the !addcc command.
 *
 * @example
 * ```text
 * !addcc ID REGEX MESSAGE -ul=mod -cd=12
 * ```
 */
export const regexCustomCommandAdd: Readonly<RegExp> =
  /^\s*!addcc\s+(?<id>'[^']+'|\S+)\s+(?<regex>'[^']+'|\S+)\s+(?<message>'[^']+'|\S+)(?:\s+-ul=(?<userLevel>mod|vip|none|broadcaster))?(?:\s+-cd=(?<cooldownInS>[0-9]+))?(?:\s|$)/i;
export interface RegexCustomCommandDelete {
  id: string;
}
/**
 * Regex to recognize the !delcc command.
 *
 * @example
 * ```text
 * !delcc ID
 * ```
 */
export const regexCustomCommandDelete: Readonly<RegExp> =
  /^\s*!delcc\s+(?<id>'[^']+'|\S+)(?:\s|$)/i;
export interface RegexCustomCommandList {
  id?: string;
}
export interface RegexCustomCommandListOffset {
  listOffset?: string;
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
export const regexCustomCommandList: Readonly<RegExp> =
  /^\s*!listccs?(?:\s+(?<listOffset>[0-9]+?)|\s+(?<id>'[^']+'|\S+))?(?:\s|$)/i;
export interface RegexCustomCommandEdit {
  id: string;
  option: string;
  optionValue: string;
}
/**
 * Regex to recognize the !editcc command.
 *
 * @example
 * ```text
 * !editcc ID OPTION OPTION_VALUE
 * ```
 */
export const regexCustomCommandEdit: Readonly<RegExp> =
  /^\s*!editcc\s+(?<id>'[^']+'|\S+)\s+(?<option>\S+)\s+(?<optionValue>'[^']+'|\S+)(?:\s|$)/i;

export interface RegexCustomBroadcastAdd {
  cronString: string;
  id: string;
  message: string;
}
/**
 * Regex to recognize the !addcc command.
 *
 * @example
 * ```text
 * !addcb ID CRON_STRING MESSAGE
 * ```
 */
export const regexCustomBroadcastAdd: Readonly<RegExp> =
  /^\s*!addcb\s+(?<id>'[^']+'|\S+)\s+(?<cronString>'[^']+'|\S+)\s+(?<message>'[^']+'|\S+)(?:\s|$)/i;
export interface RegexCustomBroadcastDelete {
  id: string;
}
/**
 * Regex to recognize the !delcb command.
 *
 * @example
 * ```text
 * !delcb ID
 * ```
 */
export const regexCustomBroadcastDelete: Readonly<RegExp> =
  /^\s*!delcb\s+(?<id>'[^']+'|\S+)(?:\s|$)/i;

export interface RegexCustomBroadcastList {
  id?: string;
}
export interface RegexCustomBroadcastListOffset {
  listOffset?: string;
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
export const regexCustomBroadcastList: Readonly<RegExp> =
  /^\s*!listcbs?(?:\s+(?<listOffset>[0-9]+?)|\s+(?<id>'[^']+'|\S+))?(?:\s|$)/i;
export interface RegexCustomBroadcastEdit {
  id: string;
  option: string;
  optionValue: string;
}
/**
 * Regex to recognize the !editcb command.
 *
 * @example
 * ```text
 * !editcb ID OPTION OPTION_VALUE
 * ```
 */
export const regexCustomBroadcastEdit: Readonly<RegExp> =
  /^\s*!editcb\s+(?<id>'[^']+'|\S+)\s+(?<option>\S+)\s+(?<optionValue>'[^']+'|\S+)(?:\s|$)/i;

export const regexLurkChatHandlerCommandLurk: Readonly<RegExp> =
  /^\s*!lurk(?:\s|$)/i;
