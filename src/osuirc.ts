import irc from "irc";
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_OSU_IRC = "osu_irc";

const OSU_IRC_URL = "irc.ppy.sh";
const OSU_IRC_PORT = 6667;

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
  logger.info({
    message: `Trying to connect to ${OSU_IRC_URL}:${OSU_IRC_PORT} as ${osuIrcUsername} (creationDate=${creationDate})`,
    section: LOG_ID_MODULE_OSU_IRC,
  });
  const osuIrcBotInstance = new irc.Client(OSU_IRC_URL, osuIrcUsername, {
    channels: [
      /*"#osu"*/
    ],
    password: osuIrcPassword,
    port: OSU_IRC_PORT,
    autoConnect: false,
  });
  osuIrcBotInstance.addListener(
    "message",
    (from: string, to: string, text: string, message: string) => {
      logger.info({
        message: JSON.stringify({ creationDate, from, to, text, message }),
        section: LOG_ID_MODULE_OSU_IRC,
        subsection: "message_listener",
      });
    }
  );
  osuIrcBotInstance.addListener(
    "pm",
    (from: string, text: string, message: string) => {
      logger.info({
        message: JSON.stringify({ creationDate, from, text, message }),
        section: LOG_ID_MODULE_OSU_IRC,
        subsection: "pm_listener",
      });
    }
  );
  osuIrcBotInstance.addListener("error", (message: string) => {
    logger.error({
      message: JSON.stringify({ creationDate, message }),
      section: LOG_ID_MODULE_OSU_IRC,
      subsection: "error_listener",
    });
  });
  osuIrcBotInstance.addListener("registered", (message: string) => {
    logger.info({
      message: JSON.stringify({ creationDate, message }),
      section: LOG_ID_MODULE_OSU_IRC,
      subsection: "registered_listener",
    });
  });
  // Emitted when a message is sent from the client
  osuIrcBotInstance.addListener("selfMessage", (to: string, text: string) => {
    logger.info({
      message: JSON.stringify({ creationDate, to, text }),
      section: LOG_ID_MODULE_OSU_IRC,
      subsection: "message_sent_listener",
    });
  });
  return osuIrcBotInstance;
};
