/*
 * Twitch Client/Connection setup and general functions surrounding chat message
 * handling.
 */

// Local exports
export {
  createTwitchClient,
  CreateTwitchClientError,
  CreateTwitchClientErrorCode,
  TwitchClientListener,
} from "./twitch/twitchClient.mjs";
export {
  TwitchBadgeLevel,
  parseTwitchBadgeLevel,
  convertTwitchBadgeLevelToString,
  convertTwitchBadgeStringToLevel,
} from "./twitch/twitchBadgeParser.mjs";

/**
 * The maximum amount of characters in a Twitch message before it is split into
 * more than one.
 */
export const MAX_LENGTH_OF_A_TWITCH_MESSAGE = 499;
