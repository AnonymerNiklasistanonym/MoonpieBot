// Local imports
import {
  errorMessageUserIdUndefined,
  errorMessageUserNameUndefined,
} from "../../commands";
// Type imports
import type { MessageParserPluginGenerator } from "../plugins";

export enum PluginsTwitchChat {
  USER_ID = "USER_ID",
  USER = "USER",
  CHANNEL = "CHANNEL",
}

export interface PluginsTwitchChatData {
  userId: string | undefined;
  userName: string | undefined;
  channel: string;
}

export const pluginsTwitchChatGenerator: MessageParserPluginGenerator<PluginsTwitchChatData>[] =
  [
    {
      id: PluginsTwitchChat.USER,
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
      id: PluginsTwitchChat.USER_ID,
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
      id: PluginsTwitchChat.CHANNEL,
      description:
        "Available in all strings that are responses and will insert the Channel name of the channel where the original message is from",
      generate: (data) => () => {
        return data.channel.slice(1);
      },
    },
  ];
