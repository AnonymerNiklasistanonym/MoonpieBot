// Local imports
import {
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "../../error";
// Type imports
import type { MessageParserPluginGenerator } from "../../messageParser";

export enum PluginTwitchChat {
  /** Insert the Twitch channel name where the current message was written. */
  CHANNEL = "CHANNEL",
  /** Insert the Twitch user name of the user that wrote the current message. */
  USER = "USER",
  /** Insert the Twitch user id of the user that wrote the current message. */
  USER_ID = "USER_ID",
}

export interface PluginTwitchChatData {
  /** The Twitch channel name in which the current message was written. */
  channelName: string;
  /** The Twitch user ID of the user that wrote the current message. */
  userId?: string;
  /** The Twitch user name of the user that wrote the current message. */
  userName?: string;
}

export const pluginsTwitchChatGenerator: MessageParserPluginGenerator<PluginTwitchChatData>[] =
  [
    {
      description:
        "Available in all strings that are responses and will insert the name of the user that is responded to",
      generate: (data) => () => {
        if (data.userName === undefined) {
          throw errorMessageUserNameUndefined();
        }
        return data.userName;
      },
      id: PluginTwitchChat.USER,
    },
    {
      description:
        "Available in all strings that are responses and will insert the Twitch ID of the user that is responded to",
      generate: (data) => () => {
        if (data.userId === undefined) {
          throw errorMessageUserIdUndefined();
        }
        return data.userId;
      },
      id: PluginTwitchChat.USER_ID,
    },
    {
      description:
        "Available in all strings that are responses and will insert the Channel name of the channel where the original message is from",
      generate: (data) => () => {
        return data.channelName.slice(1);
      },
      id: PluginTwitchChat.CHANNEL,
    },
  ];
