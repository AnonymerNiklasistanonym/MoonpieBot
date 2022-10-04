/*
 * Generic helper functions surrounding Twitch badges.
 */

// Local imports
import {
  parseTwitchBadgeLevel,
  TwitchBadgeLevel,
} from "../other/twitchBadgeParser";
import { generalUserPermissionError } from "../strings/general";
import { macroPermissionError } from "../messageParser/macros/general";
// Type imports
import type { ChatUserstate } from "tmi.js";
import type { TwitchChatCommandHandlerReply } from "./twitchChatCommandHandler";

export const checkTwitchBadgeLevel = (
  tags: Readonly<ChatUserstate>,
  expectedBadgeLevel: TwitchBadgeLevel
): TwitchChatCommandHandlerReply | undefined => {
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
