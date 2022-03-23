import type { ApiClient } from "@twurple/api";
import { asyncReplace } from "./asyncReplace";
import { secondsToString } from "./timePeriodToString";

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getMacroArgs = (macroContent: string) => {
  // eslint-disable-next-line security/detect-unsafe-regex
  return [...macroContent.matchAll(/-([^-=]+)(?:=([^=]+))?/g)].map((a) => ({
    name: a[1],
    value: a[2],
  }));
};

/**.
 * A regex to match macros in messages:
 *
 * @example
 * ```
 * Go check out $(macro1Name-macro1Arg1)
 * ```
 * @example
 * ```
 * $(macro1Name-macro1Arg1=macro1Arg1Value)
 * ```
 * @example
 * ```
 * $(macro1Name-macro1Arg1=$(macro2Name-macro2Arg2))
 * ```
 * @example
 * ```
 * Go check out $(group-1) at https://www.twitch.tv/$(group-1) <3 They were last playing $(twitch-channel_game=$(group-1))
 * ```
 */
export const regexMacro = /\$\(((\S*?)=(?:\$\(\S*?\)).*?|(?:\S*?))\)/g;

/**
 * Parse a message string which can contain async macro request and macros can
 * contain messages that need to be passed again which is why there is a depth
 * limit.
 * If there is a macro or depth limit error the string will contain the error
 * message as `[ERROR: $MESSAGE]`.
 *
 * @param message The message string.
 * @param regexGroups The regex groups of the message.
 * @param count The number of times the command was called.
 * @param userName The name of the user that called the command.
 * @param twitchApiClient The Twitch API connection for macro requests.
 * @param twitchUserId The Twitch user name of the requester.
 * @param twitchChannelName The Twitch channel in which the request was made.
 * @param depth The parse depth of the message to stop circular references.
 * @returns The parsed message string.
 */
export const parseMessage = async (
  message: string,
  regexGroups: RegExpMatchArray,
  count: number,
  userName: string,
  twitchApiClient: ApiClient | undefined,
  twitchUserId: string | undefined,
  twitchChannelName: string,
  depth = 0
): Promise<string> => {
  if (depth > 1) {
    return `[ERROR: Stop parsing message because depth limit (${depth}) was reached]`;
  }

  return await asyncReplace(
    message,
    regexMacro,
    async (_macroContent, ...groups) => {
      const macroString =
        groups[0] !== undefined && typeof groups[0] === "string"
          ? groups[0]
          : undefined;
      if (macroString !== undefined) {
        const macroArgs = getMacroArgs(macroString);
        if (macroString === "count") {
          return `${count}`;
        }
        if (macroString.startsWith("random")) {
          if (macroArgs.length === 0) {
            return `${randomIntFromInterval(0, 100)}`;
          }
          if (macroArgs.length === 1) {
            return `${randomIntFromInterval(0, parseInt(macroArgs[0].name))}`;
          }
          if (macroArgs.length === 2) {
            return `${randomIntFromInterval(
              parseInt(macroArgs[0].name),
              parseInt(macroArgs[1].name)
            )}`;
          }
          return "[ERROR: <random> More then 2 arguments detected]";
        }
        if (macroString.startsWith("group")) {
          if (macroArgs.length === 0) {
            return "[ERROR: <group> No arguments detected]";
          }
          if (macroArgs.length === 1) {
            return `${regexGroups[parseInt(macroArgs[0].name)]}`;
          }
          return "[ERROR: <group> More than 1 argument detected]";
        }
        if (macroString === "user") {
          return userName;
        }
        if (macroString.startsWith("twitch")) {
          if (twitchApiClient === undefined) {
            return `[ERROR: <${macroString}> twitch api client undefined]`;
          }
          if (macroArgs[0].name === "channel_game") {
            const parsedMessage = await parseMessage(
              macroArgs[0].value,
              regexGroups,
              count,
              userName,
              twitchApiClient,
              twitchUserId,
              twitchChannelName,
              depth + 1
            );
            const user = await twitchApiClient.users.getUserByName(
              parsedMessage
            );
            if (user !== null) {
              const channel = await twitchApiClient.channels.getChannelInfo(
                user.id
              );
              if (!channel) {
                return `[ERROR: <${macroString}> twitch api request for channel information failed]`;
              }
              return `${channel.gameName}`;
            } else {
              return `[ERROR: <${macroString}> twitch api request for user information failed]`;
            }
          } else if (macroArgs[0].name === "set_title") {
            if (twitchUserId === undefined) {
              return `[ERROR: <${macroString}> twitch api user ID was undefined]`;
            }
            try {
              await twitchApiClient.channels.updateChannelInfo(twitchUserId, {
                title: macroArgs[0].value,
              });
              return `Title was updated to ${macroArgs[0].value}`;
            } catch (err) {
              return `[ERROR: Title could not be updated ${
                (err as Error).message
              }]`;
            }
          } else if (macroArgs[0].name === "set_game") {
            if (twitchUserId === undefined) {
              return `[ERROR: <${macroString}> twitch api user ID was undefined]`;
            }
            try {
              const gameName = await twitchApiClient.games.getGameByName(
                macroArgs[0].value
              );
              if (gameName == null || gameName?.id === undefined) {
                return `[ERROR: <${macroString}> twitch api game ID was undefined]`;
              }
              await twitchApiClient.channels.updateChannelInfo(twitchUserId, {
                gameId: gameName.id,
              });
              return `Game was updated to ${gameName.name}`;
            } catch (err) {
              return `[ERROR: Title could not be updated ${
                (err as Error).message
              }]`;
            }
          } else if (macroArgs[0].name === "follow_age") {
            //// TODO
            if (twitchUserId === undefined) {
              return `[ERROR: <${macroString}> twitch api user ID was undefined]`;
            }
            const broadcaster = await twitchApiClient.users.getUserByName(
              twitchChannelName.slice(1, twitchChannelName.length)
            );
            if (broadcaster?.id === undefined) {
              return `[ERROR: <${macroString}> twitch api broadcaster ID was undefined]`;
            }
            if (twitchUserId === broadcaster.id) {
              const currentTimestamp = Date.now();
              const followStartTimestamp = broadcaster.creationDate.getTime();
              return secondsToString(
                (currentTimestamp - followStartTimestamp) / 1000
              );
            }
            const follow =
              await twitchApiClient.users.getFollowFromUserToBroadcaster(
                twitchUserId,
                broadcaster.id
              );
            if (follow) {
              const currentTimestamp = Date.now();
              const followStartTimestamp = follow.followDate.getTime();
              return secondsToString(
                (currentTimestamp - followStartTimestamp) / 1000
              );
            } else {
              return `[ERROR: User is not following the channel]`;
            }
          }
        }
        return `[ERROR: <${macroString}> but unsupported argument ${macroArgs[0].name}]`;
      }
      return `[ERROR: macroString was undefined]`;
    }
  );
};
