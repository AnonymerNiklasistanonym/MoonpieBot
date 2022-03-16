// Type imports
import type { ChatUserstate } from "tmi.js";

/**
 * Twitch badge levels.
 */
export enum TwitchBadgeLevels {
  BROADCASTER = 3,
  MODERATOR = 2,
  VIP = 1,
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
