// Package imports
import irc from "irc";
// Local imports
import { createLogFunc } from "./logging";
// Type imports
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
  const logOsuIrc = createLogFunc(logger, LOG_ID_MODULE_OSU_IRC);

  // TODO Handle authentication errors
  const creationDate = new Date().toISOString();
  logOsuIrc.info(
    `Trying to connect to ${OSU_IRC_URL}:${OSU_IRC_PORT} as ${osuIrcUsername} (creationDate=${creationDate})`
  );
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
      const logOsuIrcMsgListener = createLogFunc(
        logger,
        LOG_ID_MODULE_OSU_IRC,
        {
          subsection: "message_listener",
        }
      );
      logOsuIrcMsgListener.info(
        JSON.stringify({ creationDate, from, to, text, message })
      );
    }
  );
  osuIrcBotInstance.addListener(
    "pm",
    (from: string, text: string, message: string) => {
      const logOsuIrcPmListener = createLogFunc(logger, LOG_ID_MODULE_OSU_IRC, {
        subsection: "pm_listener",
      });
      logOsuIrcPmListener.info(
        JSON.stringify({ creationDate, from, text, message })
      );
    }
  );
  osuIrcBotInstance.addListener("error", (message: string) => {
    const logOsuIrcErrorListener = createLogFunc(
      logger,
      LOG_ID_MODULE_OSU_IRC,
      {
        subsection: "pm_listener",
      }
    );
    logOsuIrcErrorListener.error(
      Error(JSON.stringify({ creationDate, message }))
    );
  });
  osuIrcBotInstance.addListener("registered", (message: string) => {
    const logOsuIrcRegListener = createLogFunc(logger, LOG_ID_MODULE_OSU_IRC, {
      subsection: "registered_listener",
    });
    logOsuIrcRegListener.info(JSON.stringify({ creationDate, message }));
  });
  // Emitted when a message is sent from the client
  osuIrcBotInstance.addListener("selfMessage", (to: string, text: string) => {
    const logOsuIrcSelfMsgListener = createLogFunc(
      logger,
      LOG_ID_MODULE_OSU_IRC,
      {
        subsection: "self_message_listener",
      }
    );
    logOsuIrcSelfMsgListener.info(JSON.stringify({ creationDate, to, text }));
  });
  return osuIrcBotInstance;
};
