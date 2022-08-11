// Local imports
import {
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "../../error";
// Type imports
import type { MessageParserPluginGenerator } from "../plugins";

export enum PluginTwitchChat {
  USER_ID = "USER_ID",
  USER = "USER",
  CHANNEL = "CHANNEL",
}

export interface PluginTwitchChatData {
  /** The Twitch user ID of the user that wrote the current message. */
  userId?: string;
  /** The Twitch user name of the user that wrote the current message. */
  userName?: string;
  /** The Twitch channel name in which the current message was written. */
  channelName: string;
}

export const pluginsTwitchChatGenerator: MessageParserPluginGenerator<PluginTwitchChatData>[] =
  [
    {
      id: PluginTwitchChat.USER,
      description:
        "Available in all strings that are responses and will insert the name of the user that is responded to",
      generate: (data) => () => {
        if (data.userName === undefined) {
          throw errorMessageUserNameUndefined();
        }
        return data.userName;
      },
    },
    {
      id: PluginTwitchChat.USER_ID,
      description:
        "Available in all strings that are responses and will insert the Twitch ID of the user that is responded to",
      generate: (data) => () => {
        if (data.userId === undefined) {
          throw errorMessageUserIdUndefined();
        }
        return data.userId;
      },
    },
    {
      id: PluginTwitchChat.CHANNEL,
      description:
        "Available in all strings that are responses and will insert the Channel name of the channel where the original message is from",
      generate: (data) => () => {
        return data.channelName.slice(1);
      },
    },
  ];
