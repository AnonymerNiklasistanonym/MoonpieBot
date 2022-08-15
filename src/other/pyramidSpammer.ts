import type { Client } from "tmi.js";

/**
 * Spams an emote pyramid.
 *
 * @param twitchClient Twitch client to send messages.
 * @param channel Twitch channel in which messages should be sent.
 * @param emote The name of the emote.
 * @param pyramidWidth The maximum width of the pyramid.
 * @example ```
 * a
 * a a
 * a a a (pyramidWidth = 3)
 * a a
 * a
 * ```
 */
export const pyramidSpammer = async (
  twitchClient: Client,
  channel: string,
  emote: string,
  pyramidWidth: number
): Promise<void> => {
  const emoteToSpam = ` ${emote} `;
  // eslint-disable-next-line no-useless-catch
  try {
    for (let i = 1; i < pyramidWidth - 1; i++) {
      await twitchClient.say(channel, emoteToSpam.repeat(i));
    }
    for (let i = pyramidWidth; i >= 1; i--) {
      await twitchClient.say(channel, emoteToSpam.repeat(i));
    }
  } catch (err) {
    throw err;
  }
};
