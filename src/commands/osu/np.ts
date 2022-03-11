// Local imports
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
import { OsuApiV2Credentials } from "../osu";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { getProcessWindowTitle } from "../../other/processInformation";

/**
 * NP (now playing) command: Send the map that is currently being played in osu
 * (via the window title because the web api is not supporting it)
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param osuApiV2Credentials Osu API (v2) credentials
 * @param logger Logger (used for logging)
 */
export const commandNp = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials,
  defaultOsuId: number,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  console.log(osuApiV2Credentials !== undefined && defaultOsuId !== undefined);

  const windowTitle = await getProcessWindowTitle("osu");
  const message =
    windowTitle === undefined || windowTitle === "osu!"
      ? "No map is currently being played, try !rp to get the most recent play"
      : windowTitle.replace(/^osu!\s*/, "");
  console.log({ message, windowTitle });
  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuNp" }
  );
};
