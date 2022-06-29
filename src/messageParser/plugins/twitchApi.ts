import { ApiClient } from "@twurple/api/lib";
import { errorMessageUserIdUndefined } from "../../commands";
import { MessageParserPlugin } from "../plugins";

const TWITCH_API_PREFIX = "TWITCH_API_";

export const pluginTwitchApi: (
  twitchApiClient: ApiClient,
  channelName: string,
  twitchUserId?: string
) => MessageParserPlugin[] = (twitchApiClient, channelName, twitchUserId) => {
  return [
    {
      id: `${TWITCH_API_PREFIX}SET_GAME`,
      func: async (_logger, gameName?: string) => {
        if (gameName === undefined || gameName.length === 0) {
          throw Error("Game name was undefined or empty!");
        }

        try {
          const gameNameApi = await twitchApiClient.games.getGameByName(
            gameName
          );
          if (gameNameApi?.id === undefined) {
            throw Error("Twitch API client request getGameByName failed");
          }
          const channelUserInfo = await twitchApiClient.users.getUserByName(
            channelName.slice(1)
          );
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          await twitchApiClient.channels.updateChannelInfo(channelUserInfo.id, {
            gameId: gameNameApi.id,
          });
          return gameNameApi.name;
        } catch (err) {
          throw Error(`Game could not be updated '${(err as Error).message}'`);
        }
      },
    },
    {
      id: `${TWITCH_API_PREFIX}GET_GAME`,
      func: async () => {
        try {
          const channelUserInfo = await twitchApiClient.users.getUserByName(
            channelName.slice(1)
          );
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          const channelInfo = await twitchApiClient.channels.getChannelInfoById(
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
      id: `${TWITCH_API_PREFIX}GET_TITLE`,
      func: async () => {
        try {
          const channelUserInfo = await twitchApiClient.users.getUserByName(
            channelName.slice(1)
          );
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          const channelInfo = await twitchApiClient.channels.getChannelInfoById(
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
      id: `${TWITCH_API_PREFIX}SET_TITLE`,
      func: async (_logger, title?: string) => {
        if (title === undefined || title.length === 0) {
          throw Error("Game name was undefined or empty!");
        }

        try {
          const channelUserInfo = await twitchApiClient.users.getUserByName(
            channelName.slice(1)
          );
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          await twitchApiClient.channels.updateChannelInfo(channelUserInfo.id, {
            title,
          });
          return title;
        } catch (err) {
          throw Error(`Title could not be updated '${(err as Error).message}'`);
        }
      },
    },
    {
      id: `${TWITCH_API_PREFIX}GET_FOLLOW_AGE`,
      func: async (_logger, userName) => {
        try {
          const channelUserInfo = await twitchApiClient.users.getUserByName(
            channelName.slice(1)
          );
          if (channelUserInfo?.id === undefined) {
            throw Error("Twitch API client request getUserByName failed");
          }
          let userId;
          if (userName !== undefined && userName.length > 0) {
            const twitchUserInfo = await twitchApiClient.users.getUserByName(
              userName
            );
            if (twitchUserInfo?.id === undefined) {
              throw Error("Twitch API client request getUserByName failed");
            }
            userId = twitchUserInfo.id;
          } else {
            if (twitchUserId === undefined) {
              throw errorMessageUserIdUndefined();
            }
            userId = twitchUserId;
          }
          // Check if the user is the broadcaster
          if (channelUserInfo.id === userId) {
            const currentTimestamp = Date.now();
            const followStartTimestamp = channelUserInfo.creationDate.getTime();
            return `${(currentTimestamp - followStartTimestamp) / 1000}`;
          }
          const follow =
            await twitchApiClient.users.getFollowFromUserToBroadcaster(
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
};
