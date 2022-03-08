import type { ApiClient } from "@twurple/api";

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getMacroArgs = (macroContent: string) => {
  return [...macroContent.matchAll(/-([^-]+)/g)].map((a) => a[1]);
};

export const parseMessage = async (
  message: string,
  regexGroups: RegExpMatchArray,
  count: number,
  userName: string,
  twitchApiClient: ApiClient | undefined
): Promise<string> => {
  // First calculate all the replace data
  const replaceData: Promise<string>[] = [];
  message.replace(/\$\((.*?)\)/g, (macroContent, ...groups) => {
    if (groups[0] !== undefined && typeof groups[0] === "string") {
      const macroArgs = getMacroArgs(groups[0]);
      if (groups[0] === "count") {
        replaceData.push(Promise.resolve(`${count}`));
        return "<bad>";
      }
      if (groups[0].startsWith("random")) {
        if (macroArgs.length === 0) {
          replaceData.push(Promise.resolve(`${randomIntFromInterval(0, 100)}`));
          return "<bad>";
        }
        if (macroArgs.length === 1) {
          replaceData.push(
            Promise.resolve(
              `${randomIntFromInterval(0, parseInt(macroArgs[0]))}`
            )
          );
          return "<bad>";
        }
        if (macroArgs.length === 2) {
          replaceData.push(
            Promise.resolve(
              `${randomIntFromInterval(
                parseInt(macroArgs[0]),
                parseInt(macroArgs[1])
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
      if (groups[0].startsWith("group")) {
        if (macroArgs.length === 0) {
          replaceData.push(
            Promise.resolve("[ERROR: <group> No arguments detected]")
          );
          return "<bad>";
        }
        if (macroArgs.length === 1) {
          replaceData.push(
            Promise.resolve(`${regexGroups[parseInt(macroArgs[0])]}`)
          );
          return "<bad>";
        }
        replaceData.push(
          Promise.resolve("[ERROR: <group> More than 1 argument detected]")
        );
        return "<bad>";
      }
      if (groups[0] === "user") {
        return userName;
      }
      if (groups[0] === "twitch") {
        if (twitchApiClient === undefined) {
          replaceData.push(
            Promise.resolve(
              `[ERROR: <${groups[0]}> twitch api client undefined]`
            )
          );
          return "<bad>";
        }
        replaceData.push(
          twitchApiClient.users
            .getUserByName(userName)
            .then((user) => {
              if (user !== null) {
                return twitchApiClient.channels.getChannelInfo(user.id);
              } else {
                throw Error(`twitch request for user information failed`);
              }
            })
            .then((channel) => {
              if (!channel) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return `[ERROR: <${groups[0]}> twitch request failed]`;
              }
              return `They were last playing ${channel.gameName}`;
            })
            .catch((err) => {
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              return `[ERROR: <${groups[0]}> twitch request failed: ${
                (err as Error).message
              }]`;
            })
        );
        return "<bad>";
      }

      replaceData.push(
        Promise.resolve(`[ERROR: <${groups[0]}> detected but not supported]`)
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
  return message.replace(/\$\((.*?)\)/g, () => {
    return strings[index++];
  });
};
