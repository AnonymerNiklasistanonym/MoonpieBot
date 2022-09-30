// Type imports
import type { ChatUserstate } from "tmi.js";

/**
 * Twitch badge levels.
 * The numbers are taken from the API.
 */
export const enum TwitchBadgeLevel {
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
export const parseTwitchBadgeLevel = (
  tags: ChatUserstate
): TwitchBadgeLevel => {
  if (tags?.badges?.broadcaster === "1") {
    return TwitchBadgeLevel.BROADCASTER;
  }
  if (tags?.badges?.moderator === "1") {
    return TwitchBadgeLevel.MODERATOR;
  }
  if (tags?.badges?.vip === "1") {
    return TwitchBadgeLevel.VIP;
  }
  return TwitchBadgeLevel.NONE;
};

export const convertTwitchBadgeLevelToString = (
  badgeLevel: TwitchBadgeLevel
): string => {
  switch (badgeLevel) {
    case TwitchBadgeLevel.BROADCASTER:
      return "broadcaster";
    case TwitchBadgeLevel.MODERATOR:
      return "mod";
    case TwitchBadgeLevel.NONE:
      return "none";
    case TwitchBadgeLevel.VIP:
      return "vip";
  }
};
