// Local imports
import {
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "../../commands";
// Type imports
import type { MessageParserPlugin } from "../plugins";

export const pluginTwitchChatUserIdId = "USER_ID";
export const pluginTwitchChatUserId = "USER";
export const pluginTwitchChatChannelId = "CHANNEL";

export const pluginsTwitchChat = (
  userId: string | undefined,
  userName: string | undefined,
  channel: string
): MessageParserPlugin[] => [
  {
    id: pluginTwitchChatUserId,
    func: (_, __, signature) => {
      if (signature) {
        return { type: "signature" };
      }
      if (userName === undefined) {
        throw errorMessageUserNameUndefined();
      }
      return userName;
    },
  },
  {
    id: pluginTwitchChatUserIdId,
    func: (_, __, signature) => {
      if (signature) {
        return { type: "signature" };
      }
      if (userId === undefined) {
        throw errorMessageUserIdUndefined();
      }
      return userId;
    },
  },
  {
    id: pluginTwitchChatChannelId,
    func: (_, __, signature) => {
      if (signature) {
        return { type: "signature" };
      }
      return channel.slice(1);
    },
  },
];
