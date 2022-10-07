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
} from "./twitch/twitchClient";
export {
  TwitchBadgeLevel,
  parseTwitchBadgeLevel,
  convertTwitchBadgeLevelToString,
  convertTwitchBadgeStringToLevel,
} from "./twitch/twitchBadgeParser";

/**
 * The maximum amount of characters of a Twitch message.
 */
export const MAX_LENGTH_OF_A_TWITCH_MESSAGE = 499;
