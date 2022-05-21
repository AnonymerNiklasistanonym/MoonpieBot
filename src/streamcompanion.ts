import ReconnectingWebSocket from "reconnecting-websocket";
import WebSocket from "ws";
import type { Logger } from "winston";

export interface StreamCompanionData {
  titleRoman?: string;
  artistRoman?: string;
  diffName?: string;
  mapid?: number;
  mapsetid?: number;
  maxCombo?: number;
  mods?: string;
  mAR?: number;
  mCS?: number;
  mOD?: number;
  mHP?: number;
  mStars?: number;
  mBpm?: string;
}

/** Interface which helps to get the hidden websocket URL. */
interface ReconnectingWebSocketHelper {
  _url: string;
}

export const createStreamCompanionConnection = (
  streamCompanionUrl: string,
  logger: Logger
) => {
  // Automatically reconnect on loss of connection - this means StreamCompanion
  // does not need to be run all the time but only when needed
  let connectedToStreamCompanion = false;
  const websocketUrl = `ws://${streamCompanionUrl}/tokens`;
  const websocketReconnectTimeoutInS = 10;
  const ws = new ReconnectingWebSocket(websocketUrl, [], {
    WebSocket: WebSocket,
    connectionTimeout: websocketReconnectTimeoutInS * 1000,
  });
  logger.info(
    `Try to connect to StreamCompanion via '${
      (ws as unknown as ReconnectingWebSocketHelper)._url
    }' (url=${websocketUrl}, timeout=${websocketReconnectTimeoutInS}s)`
  );
  ws.onopen = () => {
    connectedToStreamCompanion = true;
    logger.info("StreamCompanion socket was opened");
    // Send token names which should be watched for value changes
    // https://piotrekol.github.io/StreamCompanion/development/SC/api.html#json
    // TODO: Check what happens for invalid/custom maps
    ws.send(
      JSON.stringify([
        "titleRoman",
        "artistRoman",
        "diffName",
        "mapid",
        "mapsetid",
        "maxCombo",
        "mods",
        "mAR",
        "mCS",
        "mOD",
        "mHP",
        "mStars",
        "mBpm",
      ])
    );
  };
  const cache: StreamCompanionData = {};
  ws.onmessage = (wsEvent) => {
    Object.assign(
      cache,
      JSON.parse(wsEvent.data as string) as StreamCompanionData
    );
    logger.debug(`New StreamCompanion data: '${wsEvent.data as string}'`);
  };
  ws.onclose = () => {
    if (connectedToStreamCompanion) {
      connectedToStreamCompanion = false;
      logger.info("StreamCompanion socket was closed");
    }
  };
  ws.onerror = (err) => {
    connectedToStreamCompanion = false;
    logger.error(`StreamCompanion socket error: ${err.message}`);
  };
  return () => (connectedToStreamCompanion ? cache : undefined);
};
