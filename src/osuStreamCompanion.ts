/*
 * StreamCompanion connection.
 */

// Package imports
import ReconnectingWebSocket from "reconnecting-websocket";
import WebSocket from "ws";
// Local imports
import { createLogFunc } from "./logging";
// Type imports
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_STREAMCOMPANION = "osu_streamcompanion";

/**
 * The data that StreamCompanion should watch for changes.
 */
const OSU_STREAMCOMPANION_DATA = [
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
];

/**
 * A representation of the data that StreamCompanion should watch for changes.
 */
export interface StreamCompanionData {
  artistRoman?: string;
  diffName?: string;
  mAR?: number;
  mBpm?: string;
  mCS?: number;
  mHP?: number;
  mOD?: number;
  mStars?: number;
  mapid?: number;
  mapsetid?: number;
  maxCombo?: number;
  mods?: string;
  titleRoman?: string;
}

/** Interface which helps to get the hidden websocket URL. */
interface ReconnectingWebSocketHelper {
  _url: string;
}

export type StreamCompanionConnection = () => StreamCompanionData | undefined;

/**
 * This method will setup an infinite loop that will continuously try to connect
 * to StreamCompanion.
 *
 * @param streamCompanionUrl The URL of the StreamCompanion websocket.
 * @param logger Global logger.
 * @returns A function that will if there is a connection and data available
 * return that data. Otherwise it will just return undefined.
 */
export const createStreamCompanionConnection = (
  streamCompanionUrl: string,
  logger: Logger
): StreamCompanionConnection => {
  const logStreamCompanion = createLogFunc(
    logger,
    LOG_ID_MODULE_STREAMCOMPANION
  );

  // Automatically reconnect on loss of connection - this means StreamCompanion
  // does not need to be run all the time but only when needed
  let connectedToStreamCompanion = false;
  const websocketUrl = `ws://${streamCompanionUrl}/tokens`;
  const websocketReconnectTimeoutInS = 10;
  const ws = new ReconnectingWebSocket(websocketUrl, [], {
    WebSocket: WebSocket,
    connectionTimeout: websocketReconnectTimeoutInS * 1000,
  });
  logStreamCompanion.info(
    `Try to connect to StreamCompanion via '${
      // eslint-disable-next-line no-underscore-dangle
      (ws as unknown as ReconnectingWebSocketHelper)._url
    }' (url=${websocketUrl}, timeout=${websocketReconnectTimeoutInS}s)`
  );
  ws.onopen = () => {
    connectedToStreamCompanion = true;
    logStreamCompanion.info("StreamCompanion socket was opened");
    // Send token names which should be watched for value changes
    // https://piotrekol.github.io/StreamCompanion/development/SC/api.html#json
    // TODO: Check what happens for invalid/custom maps
    ws.send(JSON.stringify(OSU_STREAMCOMPANION_DATA));
  };
  const cache: StreamCompanionData = {};
  ws.onmessage = (wsEvent) => {
    Object.assign(
      cache,
      JSON.parse(wsEvent.data as string) as StreamCompanionData
    );
    logStreamCompanion.debug(
      `New StreamCompanion data: '${wsEvent.data as string}'`
    );
  };
  ws.onclose = () => {
    if (connectedToStreamCompanion) {
      connectedToStreamCompanion = false;
      logStreamCompanion.info("StreamCompanion socket was closed");
    }
  };
  ws.onerror = (err) => {
    connectedToStreamCompanion = false;
    logStreamCompanion.error(
      Error(`StreamCompanion socket error: ${err.message}`)
    );
  };
  return () => (connectedToStreamCompanion ? cache : undefined);
};
