import irc from "irc";
import type { Logger } from "winston";

/**
 * Establish a osu irc connection which can then be used to send messages.
 *
 * Check the docs at https://github.com/martynsmith/node-irc/blob/master/docs/API.rst for more information.
 *
 * @param osuIrcUsername The osu IRC user name.
 * @param osuIrcPassword The osu IRC user password.
 * @param logger Used for logging.
 * @returns Function that can be called to create a IRC connection object.
 */
export const createOsuIrcConnection = (
  osuIrcUsername: string,
  osuIrcPassword: string,
  logger: Logger
) => {
  // TODO Handle authentication errors
  const creationDate = new Date().toISOString();
  const osuIrcBotInstance = new irc.Client("irc.ppy.sh", osuIrcUsername, {
    channels: [
      /*"#osu"*/
    ],
    password: osuIrcPassword,
    port: 6667,
    autoConnect: false,
  });
  osuIrcBotInstance.addListener(
    "message",
    (from: string, to: string, text: string, message: string) => {
      logger.info({
        message: JSON.stringify({ creationDate, from, to, text, message }),
        section: "osu_irc",
        subsection: "message_listener",
      });
    }
  );
  osuIrcBotInstance.addListener(
    "pm",
    (from: string, text: string, message: string) => {
      logger.info({
        message: JSON.stringify({ creationDate, from, text, message }),
        section: "osu_irc",
        subsection: "pm_listener",
      });
    }
  );
  osuIrcBotInstance.addListener("error", (message: string) => {
    logger.error({
      message: JSON.stringify({ creationDate, message }),
      section: "osu_irc",
      subsection: "error_listener",
    });
  });
  osuIrcBotInstance.addListener("registered", (message: string) => {
    logger.info({
      message: JSON.stringify({ creationDate, message }),
      section: "osu_irc",
      subsection: "registered_listener",
    });
  });
  // Emitted when a message is sent from the client
  osuIrcBotInstance.addListener("selfMessage", (to: string, text: string) => {
    logger.info({
      message: JSON.stringify({ creationDate, to, text }),
      section: "osu_irc",
      subsection: "message_sent_listener",
    });
  });
  return osuIrcBotInstance;
};
