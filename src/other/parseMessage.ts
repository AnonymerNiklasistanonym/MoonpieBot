import type { ApiClient } from "@twurple/api";

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

export const parseMessage = async (
  message: string,
  regexGroups: RegExpMatchArray,
  count: number,
  userName: string,
  twitchApiClient: ApiClient | undefined,
  depth = 0
): Promise<string> => {
  if (depth > 1) {
    return "Stop parsing message because a recursion was detected";
  }
  // First calculate all the replace data
  const regexMacro = /\$\(((\S*?)=(?:\$\(\S*?\)).*?|(?:\S*?))\)/g;
  const replaceData: Promise<string>[] = [];
  message.replace(regexMacro, (macroContent, ...groups) => {
    const macroString =
      groups[0] !== undefined && typeof groups[0] === "string"
        ? groups[0]
        : undefined;
    if (macroString !== undefined) {
      const macroArgs = getMacroArgs(macroString);
      if (macroString === "count") {
        replaceData.push(Promise.resolve(`${count}`));
        return "<bad>";
      }
      if (macroString.startsWith("random")) {
        if (macroArgs.length === 0) {
          replaceData.push(Promise.resolve(`${randomIntFromInterval(0, 100)}`));
          return "<bad>";
        }
        if (macroArgs.length === 1) {
          replaceData.push(
            Promise.resolve(
              `${randomIntFromInterval(0, parseInt(macroArgs[0].name))}`
            )
          );
          return "<bad>";
        }
        if (macroArgs.length === 2) {
          replaceData.push(
            Promise.resolve(
              `${randomIntFromInterval(
                parseInt(macroArgs[0].name),
                parseInt(macroArgs[1].name)
              )}`
            )
          );
          return "<bad>";
        }
        replaceData.push(
          Promise.resolve("[ERROR: <random> More then 2 arguments detected]")
        );
        return "<bad>";
      }
      if (macroString.startsWith("group")) {
        if (macroArgs.length === 0) {
          replaceData.push(
            Promise.resolve("[ERROR: <group> No arguments detected]")
          );
          return "<bad>";
        }
        if (macroArgs.length === 1) {
          replaceData.push(
            Promise.resolve(`${regexGroups[parseInt(macroArgs[0].name)]}`)
          );
          return "<bad>";
        }
        replaceData.push(
          Promise.resolve("[ERROR: <group> More than 1 argument detected]")
        );
        return "<bad>";
      }
      if (macroString === "user") {
        replaceData.push(Promise.resolve(userName));
        return "<bad>";
      }
      if (macroString.startsWith("twitch")) {
        if (twitchApiClient === undefined) {
          replaceData.push(
            Promise.resolve(
              `[ERROR: <${macroString}> twitch api client undefined]`
            )
          );
          return "<bad>";
        }
        if (macroArgs[0].name === "channel_game") {
          replaceData.push(
            parseMessage(
              macroArgs[0].value,
              regexGroups,
              count,
              userName,
              twitchApiClient,
              depth + 1
            )
              .then((parsedMessage) =>
                twitchApiClient.users.getUserByName(parsedMessage)
              )
              .then((user) => {
                if (user !== null) {
                  return twitchApiClient.channels.getChannelInfo(user.id);
                } else {
                  throw Error(`twitch request for user information failed`);
                }
              })
              .then((channel) => {
                if (!channel) {
                  return `[ERROR: <${macroString}> twitch request failed]`;
                }
                return `${channel.gameName} `;
              })
              .catch((err) => {
                return `[ERROR: <${macroString}> twitch request failed: ${
                  (err as Error).message
                }]`;
              })
          );
          return "<bad>";
        }
        replaceData.push(
          Promise.resolve(
            `[ERROR: <${macroString}> but unsupported argument ${macroArgs[0].name}]`
          )
        );
        return "<bad>";
      }

      replaceData.push(
        Promise.resolve(`[ERROR: <${macroString}> detected but not supported]`)
      );
      return "<bad>";
    }

    replaceData.push(
      Promise.resolve(
        `[ERROR: Recognized macro <${macroContent}> but not group]`
      )
    );
    return "<bad>";
  });

  const strings = await Promise.all(replaceData);
  let index = 0;
  return message.replace(regexMacro, () => {
    return strings[index++];
  });
};
