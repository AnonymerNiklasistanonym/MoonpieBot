/*
 * Generic helper functions surrounding Twitch badges.
 */

// Local imports
import { parseTwitchBadgeLevel, TwitchBadgeLevel } from "../twitch";
import { generalUserPermissionError } from "../info/strings/general";
import { macroPermissionError } from "../info/macros/general";
// Type imports
import type { ChatMessageHandlerReply } from "../chatMessageHandler";
import type { ChatUserstate as TwitchChatUserState } from "tmi.js";

export const checkTwitchBadgeLevel = (
  tags: Readonly<TwitchChatUserState>,
  expectedBadgeLevel: TwitchBadgeLevel
): ChatMessageHandlerReply | undefined => {
  const twitchBadgeLevel = parseTwitchBadgeLevel(tags);
  if (twitchBadgeLevel < expectedBadgeLevel) {
    return {
      additionalMacros: new Map([
        [
          macroPermissionError.id,
          new Map(
            macroPermissionError.generate({
              expected: expectedBadgeLevel,
              found: twitchBadgeLevel,
            })
          ),
        ],
      ]),
      messageId: generalUserPermissionError.id,
    };
  }
};
