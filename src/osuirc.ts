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

export interface IrcMessage {
  /** @example cho.ppy.sh */
  prefix: string;
  /** @example cho.ppy.sh */
  server: string;
  /** @example err_passwdmismatch */
  command: string;
  /** @example 464 */
  rawCommand: string;
  /** @example error */
  commandType: string;
  /** @example ["osuId","Bad authentication token."] */
  args: [string, string];
}

/**
 * Establish a osu irc connection which can then be used to send messages.
 *
 * Check the docs at https://github.com/martynsmith/node-irc/blob/master/docs/API.rst for more information.
 *
 * @param osuIrcUsername The osu IRC user name.
 * @param osuIrcPassword The osu IRC user password.
 * @param id Used for logging.
 * @param logger Used for logging.
 * @returns Function that can be called to create a IRC connection object.
 */
export const createOsuIrcConnection = (
  osuIrcUsername: string,
  osuIrcPassword: string,
  id: string,
  logger: Logger
) => {
  const logOsuIrc = createLogFunc(logger, LOG_ID_MODULE_OSU_IRC, {
    subsection: id,
  });

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
          subsection: `${id}:message_listener`,
        }
      );
      logOsuIrcMsgListener.debug(
        JSON.stringify({ creationDate, from, to, text, message })
      );
    }
  );
  osuIrcBotInstance.addListener(
    "pm",
    (from: string, text: string, message: string) => {
      const logOsuIrcPmListener = createLogFunc(logger, LOG_ID_MODULE_OSU_IRC, {
        subsection: `${id}:pm_listener`,
      });
      logOsuIrcPmListener.debug(
        JSON.stringify({ creationDate, from, text, message })
      );
    }
  );
  osuIrcBotInstance.addListener("error", (message: IrcMessage) => {
    const logOsuIrcErrorListener = createLogFunc(
      logger,
      LOG_ID_MODULE_OSU_IRC,
      {
        subsection: `${id}:error_listener`,
      }
    );
    logOsuIrcErrorListener.error(
      Error(JSON.stringify({ creationDate, message }))
    );
    if (message.command === "err_passwdmismatch") {
      logOsuIrcErrorListener.error(
        Error(`osu!IRC password missmatch: ${message.args.join(",")}`)
      );
    }
  });
  osuIrcBotInstance.addListener("registered", (message: string) => {
    const logOsuIrcRegListener = createLogFunc(logger, LOG_ID_MODULE_OSU_IRC, {
      subsection: `${id}:registered_listener`,
    });
    logOsuIrcRegListener.debug(JSON.stringify({ creationDate, message }));
  });
  // Emitted when a message is sent from the client
  osuIrcBotInstance.addListener("selfMessage", (to: string, text: string) => {
    const logOsuIrcSelfMsgListener = createLogFunc(
      logger,
      LOG_ID_MODULE_OSU_IRC,
      {
        subsection: `${id}:self_message_listener`,
      }
    );
    logOsuIrcSelfMsgListener.info(
      `osu! IRC message was sent to '${to}': '${text}'`
    );
    logOsuIrcSelfMsgListener.debug(JSON.stringify({ creationDate, to, text }));
  });
  return osuIrcBotInstance;
};

export const tryToSendOsuIrcMessage = async (
  osuIrcBot: (id: string) => irc.Client,
  id: string,
  osuIrcRequestTarget: string,
  messages: string[],
  logger: Logger
) => {
  const logOsuIrc = createLogFunc(logger, LOG_ID_MODULE_OSU_IRC, {
    subsection: id,
  });

  let osuIrcBotInstance: undefined | irc.Client = osuIrcBot(id);
  await new Promise<void>((resolve, reject) => {
    logOsuIrc.info("Try to connect to osu! IRC channel");
    osuIrcBotInstance?.connect(2, (message) => {
      logOsuIrc.info(
        `osu! IRC connection was established: ${message.args.join(", ")}`
      );
      for (const message of messages) {
        osuIrcBotInstance?.say(osuIrcRequestTarget, message);
      }
      osuIrcBotInstance?.disconnect("", () => {
        osuIrcBotInstance?.conn.end();
        osuIrcBotInstance = undefined;
        logOsuIrc.info("osu! IRC connection was closed");
        resolve();
      });
    });
    osuIrcBotInstance?.on("error", (message: IrcMessage) => {
      logOsuIrc.info(`osu! IRC error: ${JSON.stringify(message)}`);
      if (message.command === "err_passwdmismatch") {
        reject(Error(`osu!IRC password missmatch: ${message.args.join(",")}`));
      }
    });
  }).catch(async (err) => {
    await new Promise<void>((resolve) => {
      if (osuIrcBotInstance === undefined) {
        logOsuIrc.info("osu! IRC connection was already closed");
        return resolve();
      }
      osuIrcBotInstance?.disconnect("", () => {
        osuIrcBotInstance?.conn.end();
        osuIrcBotInstance = undefined;
        logOsuIrc.info("osu! IRC connection was closed");
        resolve();
      });
    });
    throw err;
  });
};
