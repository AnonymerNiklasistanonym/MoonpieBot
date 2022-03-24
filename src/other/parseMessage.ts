/* eslint-disable no-case-declarations */
import type { ApiClient } from "@twurple/api";
import { asyncReplace } from "./asyncReplace";
import { secondsToString } from "./timePeriodToString";

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export interface MacroArgument {
  name: string;
  value: string | undefined;
}

/**
 * The first capture group is the name of the argument and the second capture
 * group is the value if there is one (so it can be undefined).
 */
export const regexMacroArg =
  // eslint-disable-next-line security/detect-unsafe-regex
  /-([^=\s$()-]+)(?:=([^=\s$()]+|\$\([^=\s$()]+\)))?/g;

export const getMacroArgs = (
  macroArgsString: string | undefined
): MacroArgument[] => {
  if (macroArgsString === undefined) {
    return [];
  }
  return [...macroArgsString.matchAll(regexMacroArg)].map((a) => ({
    name: a[1],
    value: a[2],
  }));
};

/**.
 * A regex to match macros in messages.
 * The first capture group is the macro name and the second capture group is the
 * string with the macro arguments and their values if there are any arguments
 * (so it can be undefined).
 *
 * @example
 * ```text
 * Go check out $(macro1Name-macro1Arg1)
 * ```
 * @example
 * ```text
 * $(macro1Name-macro1Arg1=macro1Arg1Value)
 * ```
 * @example
 * ```text
 * $(macro1Name-macro1Arg1=$(macro2Name-macro2Arg2))
 * ```
 * @example
 * ```text
 * Go check out $(group-1) at https://www.twitch.tv/$(group-1) <3 They were last playing $(twitch-channel_game=$(group-1))
 * ```
 */
export const regexMacroSingle =
  // eslint-disable-next-line security/detect-unsafe-regex
  /\$\(([^-\s]+)((?:-(?:[^=\s$()-]+)(?:=(?:\$\([^=\s$()]+\)|[^=\s$()]+))?)+?)?\)/;
// eslint-disable-next-line security/detect-non-literal-regexp
export const regexMacro = new RegExp(regexMacroSingle, "g");

class MacroError extends Error {
  constructor(macro: string, message: string) {
    super(`<${macro}> ${message}`);
  }
}

export const parseMessageTwitchApi = async (
  macroArgs: MacroArgument[],
  regexGroups: RegExpMatchArray,
  count: number,
  userName: string,
  twitchApiClient: ApiClient | undefined,
  twitchUserId: string | undefined,
  twitchChannelName: string,
  depth = 0
): Promise<string> => {
  if (twitchApiClient === undefined) {
    throw Error("twitchApiClient undefined");
  }
  if (macroArgs.length < 1) {
    throw Error("no macro argument was found");
  }
  switch (macroArgs[0].name) {
    case "channel_game":
      if (macroArgs[0].value === undefined) {
        throw Error("macro argument value was undefined");
      }
      const channelName = await parseMessage(
        macroArgs[0].value,
        regexGroups,
        count,
        userName,
        twitchApiClient,
        twitchUserId,
        twitchChannelName,
        depth + 1
      );
      const user = await twitchApiClient.users.getUserByName(channelName);
      if (user == null) {
        throw Error("twitchApiClient getUserByName request failed");
      }
      const channel = await twitchApiClient.channels.getChannelInfo(user.id);
      if (channel == null) {
        throw Error("twitchApiClient getChannelInfo request failed");
      }
      return channel.gameName;
    case "set_title":
      if (twitchUserId === undefined) {
        throw Error("twitchUserId is undefined");
      }
      if (macroArgs[0].value === undefined) {
        throw Error("macro argument value was undefined");
      }
      const title = await parseMessage(
        macroArgs[0].value,
        regexGroups,
        count,
        userName,
        twitchApiClient,
        twitchUserId,
        twitchChannelName,
        depth + 1
      );
      try {
        await twitchApiClient.channels.updateChannelInfo(twitchUserId, {
          title,
        });
        return title;
      } catch (err) {
        throw Error(`Title could not be updated '${(err as Error).message}'`);
      }
    case "set_game":
      if (twitchUserId === undefined) {
        throw Error("twitchUserId is undefined");
      }
      if (macroArgs[0].value === undefined) {
        throw Error("macro argument value was undefined");
      }
      const newGame = await parseMessage(
        macroArgs[0].value,
        regexGroups,
        count,
        userName,
        twitchApiClient,
        twitchUserId,
        twitchChannelName,
        depth + 1
      );
      const gameName = await twitchApiClient.games.getGameByName(newGame);
      if (gameName?.id === undefined) {
        throw Error("twitchApiClient request getGameByName failed");
      }
      try {
        await twitchApiClient.channels.updateChannelInfo(twitchUserId, {
          gameId: gameName.id,
        });
        return gameName.name;
      } catch (err) {
        throw Error(`Game could not be updated '${(err as Error).message}'`);
      }
    case "follow_age":
      if (twitchUserId === undefined) {
        throw Error("twitchUserId is undefined");
      }
      const broadcaster = await twitchApiClient.users.getUserByName(
        twitchChannelName.slice(1, twitchChannelName.length)
      );
      if (broadcaster?.id === undefined) {
        throw Error("twitchApiClient request getUserByName failed");
      }
      if (twitchUserId === broadcaster.id) {
        const currentTimestamp = Date.now();
        const followStartTimestamp = broadcaster.creationDate.getTime();
        return secondsToString(
          (currentTimestamp - followStartTimestamp) / 1000
        );
      }
      const follow = await twitchApiClient.users.getFollowFromUserToBroadcaster(
        twitchUserId,
        broadcaster.id
      );
      if (follow?.followDate === undefined) {
        throw Error("User is not following the channel");
      }
      const currentTimestamp = Date.now();
      const followStartTimestamp = follow.followDate.getTime();
      return secondsToString((currentTimestamp - followStartTimestamp) / 1000);
    default:
      throw Error(`Unsupported macro argument '${macroArgs[0].name}'`);
  }
};

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
    return `[ERROR: Depth limit (${depth}) was reached]`;
  }
  return await asyncReplace(
    message,
    regexMacro,
    async (_macroContent, ...groups) => {
      const macroName = groups[0] as string | undefined;
      const macroArgsString = groups[1] as string | undefined;
      try {
        if (macroName === undefined) {
          throw Error("macroString was undefined");
        }
        const macroArgs = getMacroArgs(macroArgsString);
        switch (macroName) {
          case "count":
            return `${count}`;
          case "group":
            if (macroArgs.length === 0) {
              throw new MacroError(macroName, "No arguments detected");
            }
            if (macroArgs.length === 1) {
              return `${regexGroups[parseInt(macroArgs[0].name)]}`;
            }
            throw new MacroError(macroName, "Unsupported number of arguments");
          case "random":
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
            throw new MacroError(macroName, "Unsupported number of arguments");
          case "twitch":
            return await parseMessageTwitchApi(
              macroArgs,
              regexGroups,
              count,
              userName,
              twitchApiClient,
              twitchUserId,
              twitchChannelName
            );
          case "user":
            return userName;
          default:
            throw new MacroError(macroName, "Unsupported macro");
        }
      } catch (err) {
        return `[ERROR: ${(err as Error).message}]`;
      }
    }
  );
};
