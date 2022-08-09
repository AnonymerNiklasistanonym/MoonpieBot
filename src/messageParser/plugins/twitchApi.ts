// Local imports
import { errorMessageUserIdUndefined } from "../../error";
// Type imports
import type { ApiClient } from "@twurple/api/lib";
import type { MessageParserPluginGenerator } from "../plugins";

const TWITCH_API_PREFIX = "TWITCH_API_";

export const pluginTwitchApiSetGameId = `${TWITCH_API_PREFIX}SET_GAME`;
export const pluginTwitchApiGetGameId = `${TWITCH_API_PREFIX}GET_GAME`;
export const pluginTwitchApiSetTitleId = `${TWITCH_API_PREFIX}SET_TITLE`;
export const pluginTwitchApiGetTitleId = `${TWITCH_API_PREFIX}GET_TITLE`;
export const pluginTwitchApiGetFollowAgeId = `${TWITCH_API_PREFIX}GET_FOLLOW_AGE`;

export interface PluginsTwitchApiData {
  twitchApiClient: ApiClient;
  channelName: string;
  twitchUserId?: string;
}

export const pluginsTwitchApiGenerator: MessageParserPluginGenerator<PluginsTwitchApiData>[] =
  [
    {
      id: pluginTwitchApiSetGameId,
      signature: {
        type: "signature",
        argument: "gameName",
      },
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
    },
    {
      id: pluginTwitchApiGetGameId,
      signature: {
        type: "signature",
        argument: ["", "channelName"],
      },
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
    },
    {
      id: pluginTwitchApiGetTitleId,
      signature: {
        type: "signature",
        argument: ["", "channelName"],
      },
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
    },
    {
      id: pluginTwitchApiSetTitleId,
      signature: {
        type: "signature",
        argument: "title",
      },
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
    },
    {
      id: pluginTwitchApiGetFollowAgeId,
      signature: {
        type: "signature",
        argument: "userName",
      },
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
    },
  ];
