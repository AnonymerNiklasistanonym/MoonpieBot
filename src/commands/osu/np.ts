// Local imports
import {
  errorMessageIdUndefined,
  errorMessageUserNameUndefined,
  loggerCommand,
} from "../commandHelper";
import { OsuApiV2Credentials } from "../osu";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { getProcessWindowTitle } from "../../other/processInformation";
import osuApiV2 from "osu-api-v2";

export const regexNowPlaying =
  /^(?:.*?)\s-\s\s*(.*?)\s*\s-\s\s*(.*?)\s*\[\s*(.*)\s*\]$/;

/**
 * NP (now playing) command: Send the map that is currently being played in osu!
 * (via the window title because the web api is not supporting it).
 *
 * @param client Twitch client (used to send messages).
 * @param channel Twitch channel (where the response should be sent to).
 * @param messageId Twitch message ID of the request (used for logging).
 * @param userName Twitch user name of the requester.
 * @param osuApiV2Credentials The osu! API (v2) credentials.
 * @param defaultOsuId Default osu! Account ID (used for checking for existing
 * scores).
 * @param logger Logger (used for logging).
 */
export const commandNp = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  userName: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials,
  defaultOsuId: number,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }
  if (userName === undefined) {
    throw errorMessageUserNameUndefined();
  }

  console.log(osuApiV2Credentials !== undefined && defaultOsuId !== undefined);

  const windowTitle = await getProcessWindowTitle("osu");
  let message =
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `${userName} No map is currently being played, try !rp to get the most recent play`;
  if (windowTitle !== undefined && windowTitle !== "osu!") {
    const match = windowTitle.match(regexNowPlaying);
    if (match != null) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      message = `${userName} Currently playing '${match[2]}' from '${match[1]}' [${match[3]}]`;
      try {
        const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
          osuApiV2Credentials.clientId,
          osuApiV2Credentials.clientSecret
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const searchResult = await osuApiV2.beatmapsets.search(
          oauthAccessToken,
          `title='${match[2]}' artist='${match[1]}'`,
          false
        );
        if (
          searchResult.beatmapsets !== undefined &&
          Array.isArray(searchResult.beatmapsets) &&
          searchResult.beatmapsets.length >= 1
        ) {
          const exactMatch = searchResult.beatmapsets.find((a) => {
            const titleIsTheSame =
              a.title.trim().toLocaleLowerCase() ===
              match[2].trim().toLocaleLowerCase();
            const diffNameCanBeFound = a.beatmaps?.find(
              (b) =>
                b.version.trim().toLocaleLowerCase() ===
                match[3].trim().toLocaleLowerCase()
            );
            return titleIsTheSame && diffNameCanBeFound;
          });
          console.log(searchResult.beatmapsets);
          if (exactMatch) {
            const exactBeatmapDiff = exactMatch.beatmaps?.find(
              (a) =>
                a.version.trim().toLocaleLowerCase() ===
                match[3].trim().toLocaleLowerCase()
            );
            if (exactBeatmapDiff) {
              message += ` (should be: https://osu.ppy.sh/beatmaps/${exactBeatmapDiff.id})`;
            } else {
              message += ` (most likely: https://osu.ppy.sh/beatmapsets/${exactMatch.id})`;
            }
          } else {
            message += ` (probably: https://osu.ppy.sh/beatmapsets/${searchResult.beatmapsets[0].id})`;
          }
        }
      } catch (err) {
        logger.warn(err);
      }
    }
  }
  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuNp" }
  );
};
