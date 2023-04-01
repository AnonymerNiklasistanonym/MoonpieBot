// Relative imports
import { errorMessageUserIdUndefined } from "../../error.mjs";
// Type imports
import type { ApiClient } from "@twurple/api";
import type { MessageParserPluginGenerator } from "../../messageParser.mjs";

export enum PluginTwitchApi {
  GET_FOLLOW_AGE = "TWITCH_API_GET_FOLLOW_AGE",
  GET_GAME = "TWITCH_API_GET_GAME",
  GET_TITLE = "TWITCH_API_GET_TITLE",
  RANDOM_USER = "TWITCH_API_RANDOM_USER",
  SET_GAME = "TWITCH_API_SET_GAME",
  SET_TITLE = "TWITCH_API_SET_TITLE",
}

export interface PluginTwitchApiData {
  channelName: string;
  twitchApiClient: ApiClient;
  twitchUserId?: string;
}

export const pluginsTwitchApiGenerator: MessageParserPluginGenerator<PluginTwitchApiData>[] =
  [
    {
      description: "Set the streamed game in the current channel",
      generate: (data) => async (_, gameName) => {
        if (gameName === undefined || gameName.length === 0) {
          throw Error("Game name was undefined or empty");
        }

        try {
          const gameNameApi = await data.twitchApiClient.games.getGameByName(
            gameName
          );
          if (gameNameApi?.id === undefined) {
            throw Error("Twitch API client request getGameByName failed");
          }
          const channelUserInfo =
            await data.twitchApiClient.users.getUserByName(data.channelName);
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          await data.twitchApiClient.channels.updateChannelInfo(
            channelUserInfo.id,
            {
              gameId: gameNameApi.id,
            }
          );
          return gameNameApi.name;
        } catch (err) {
          throw Error(`Game could not be updated '${(err as Error).message}'`);
        }
      },
      id: PluginTwitchApi.SET_GAME,
      signature: {
        argument: "gameName",
        type: "signature",
      },
    },
    {
      description: "Get the streamed game in the current or a custom channel",
      generate: (data) => async (_, channelName) => {
        if (channelName === undefined || channelName.length === 0) {
          channelName = data.channelName;
        }
        try {
          const channelUserInfo =
            await data.twitchApiClient.users.getUserByName(channelName);
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          const channelInfo =
            await data.twitchApiClient.channels.getChannelInfoById(
              channelUserInfo.id
            );
          if (channelInfo?.gameName === undefined) {
            throw Error("Twitch API client request getChannelInfoById failed");
          }
          return channelInfo.gameName;
        } catch (err) {
          throw Error(`Game could not be fetched '${(err as Error).message}'`);
        }
      },
      id: PluginTwitchApi.GET_GAME,
      signature: {
        argument: ["", "channelName"],
        type: "signature",
      },
    },
    {
      description: "Get the stream title in the current or a custom channel",
      generate: (data) => async (_, channelName) => {
        if (channelName === undefined || channelName.length === 0) {
          channelName = data.channelName;
        }
        try {
          const channelUserInfo =
            await data.twitchApiClient.users.getUserByName(channelName);
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          const channelInfo =
            await data.twitchApiClient.channels.getChannelInfoById(
              channelUserInfo.id
            );
          if (channelInfo?.title === undefined) {
            throw Error("Twitch API client request getChannelInfoById failed");
          }
          return channelInfo.title;
        } catch (err) {
          throw Error(`Title could not be fetched '${(err as Error).message}'`);
        }
      },
      id: PluginTwitchApi.GET_TITLE,
      signature: {
        argument: ["", "channelName"],
        type: "signature",
      },
    },
    {
      description: "Set the stream title in the current channel",
      generate: (data) => async (_, title) => {
        if (title === undefined || title.length === 0) {
          throw Error("Game name was undefined or empty");
        }

        try {
          const channelUserInfo =
            await data.twitchApiClient.users.getUserByName(data.channelName);
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          await data.twitchApiClient.channels.updateChannelInfo(
            channelUserInfo.id,
            {
              title,
            }
          );
          return title;
        } catch (err) {
          throw Error(`Title could not be updated '${(err as Error).message}'`);
        }
      },
      id: PluginTwitchApi.SET_TITLE,
      signature: {
        argument: "title",
        type: "signature",
      },
    },
    {
      description: "Get the follow age of a chatter in the current channel",
      generate: (data) => async (_, userName) => {
        try {
          const channelUserInfo =
            await data.twitchApiClient.users.getUserByName(data.channelName);
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          let userId;
          if (userName !== undefined && userName.length > 0) {
            const twitchUserInfo =
              await data.twitchApiClient.users.getUserByName(userName);
            if (twitchUserInfo?.id === undefined) {
              throw Error("Twitch API client request getUserByName failed");
            }
            userId = twitchUserInfo.id;
          } else {
            if (data.twitchUserId === undefined) {
              throw errorMessageUserIdUndefined();
            }
            userId = data.twitchUserId;
          }
          // Check if the user is the broadcaster
          if (channelUserInfo.id === userId) {
            const currentTimestamp = Date.now();
            const followStartTimestamp = channelUserInfo.creationDate.getTime();
            return `${(currentTimestamp - followStartTimestamp) / 1000}`;
          }
          const follow =
            await data.twitchApiClient.users.getFollowFromUserToBroadcaster(
              channelUserInfo.id,
              userId
            );
          if (follow?.followDate === undefined) {
            throw Error("User is not following the channel");
          }
          const currentTimestamp = Date.now();
          const followStartTimestamp = follow.followDate.getTime();
          return `${(currentTimestamp - followStartTimestamp) / 1000}`;
        } catch (err) {
          throw Error(
            `Follow age could not be fetched '${(err as Error).message}'`
          );
        }
      },
      id: PluginTwitchApi.GET_FOLLOW_AGE,
      signature: {
        argument: "userName",
        type: "signature",
      },
    },
    {
      description: "Get a random chatter in the current channel",
      generate: (data) => async () => {
        // TODO Currently broken
        try {
          const tokenInfo = await data.twitchApiClient.getTokenInfo();
          if (tokenInfo.userId === null) {
            throw Error("Twitch API client request getTokenInfo failed");
          }
          const channelChatters = await data.twitchApiClient.chat.getChatters(
            `#${data.channelName}`,
            tokenInfo.userId
          );
          if (channelChatters === undefined) {
            throw Error("Twitch API client request getChatters failed");
          }
          return channelChatters.data[
            Math.floor(Math.random() * channelChatters.data.length)
          ].userName;
        } catch (err) {
          throw Error(
            `Chatters could not be fetched '${(err as Error).message}'`
          );
        }
      },
      id: PluginTwitchApi.RANDOM_USER,
      signature: {
        type: "signature",
      },
    },
  ];
