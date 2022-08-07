// Type imports
import type { ChatUserstate } from "tmi.js";

/**
 * Twitch badge levels.
 * The numbers are taken from the API.
 */
export enum TwitchBadgeLevels {
  // eslint-disable-next-line no-magic-numbers
  BROADCASTER = 3,
  // eslint-disable-next-line no-magic-numbers
  MODERATOR = 2,
  // eslint-disable-next-line no-magic-numbers
  VIP = 1,
  // eslint-disable-next-line no-magic-numbers
  NONE = 0,
}

/**
 * Parse twitch tags to a simple enum of the highest twitch badge level of the
 * user.
 *
 * @param tags Twitch message user state.
 * @returns Highest twitch badge level.
 */
export const parseTwitchBadgeLevel = (tags: ChatUserstate) => {
  if (tags?.badges?.broadcaster === "1") {
    return TwitchBadgeLevels.BROADCASTER;
  }
  if (tags?.badges?.moderator === "1") {
    return TwitchBadgeLevels.MODERATOR;
  }
  if (tags?.badges?.vip === "1") {
    return TwitchBadgeLevels.VIP;
  }
  return TwitchBadgeLevels.NONE;
};
