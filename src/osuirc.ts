import irc from "irc";
import type { Logger } from "winston";

export const createOsuIrcConnection = (
  osuIrcUsername: string,
  osuIrcPassword: string,
  logger: Logger
) => {
  return () => {
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
        logger.info(
          "message: " +
            JSON.stringify({ creationDate, from, to, text, message })
        );
      }
    );
    osuIrcBotInstance.addListener(
      "pm",
      (from: string, to: string, text: string, message: string) => {
        logger.info(
          `pm: ${JSON.stringify({ creationDate, from, to, text, message })}`
        );
      }
    );
    osuIrcBotInstance.addListener("error", (message: string) => {
      logger.info(`IRC error: ${JSON.stringify({ creationDate, message })}`);
    });
    osuIrcBotInstance.addListener("registered", (info: string) => {
      logger.info(`Registered: ${JSON.stringify({ creationDate, info })}`);
    });
    osuIrcBotInstance.addListener("selfMessage", (info: string) => {
      logger.info(`Message sent: ${JSON.stringify({ creationDate, info })}`);
    });
    return osuIrcBotInstance;
  };
};
