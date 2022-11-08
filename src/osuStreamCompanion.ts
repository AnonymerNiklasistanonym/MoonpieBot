/*
 * StreamCompanion connection.
 */

// Package imports
import { constants, promises as fs } from "fs";
import path from "path";
import ReconnectingWebSocket from "reconnecting-websocket";
import WebSocket from "ws";
// Local imports
import { createLogFunc } from "./logging";
// Type imports
import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID = "osu_streamcompanion";

/**
 * The data that StreamCompanion should watch for changes.
 *
 * Source: https://piotrekol.github.io/StreamCompanion/development/SC/api.html#json.
 */
enum OsuStreamCompanionData {
  AR = "mAR",
  ARTIST_ROMAN = "artistRoman",
  ARTIST_UNICODE = "artistUnicode",
  BPM = "mBpm",
  CREATOR = "creator",
  CS = "mCS",
  DIFF_NAME = "diffName",
  HP = "mHP",
  MAPSET_ID = "mapsetid",
  MAP_ID = "mapid",
  MAX_COMBO = "maxCombo",
  MODS = "mods",
  OD = "mOD",
  OSU_IS_RUNNING = "osuIsRunning",
  OSU_PP_95 = "osu_m95PP",
  OSU_PP_96 = "osu_m96PP",
  OSU_PP_97 = "osu_m97PP",
  OSU_PP_98 = "osu_m98PP",
  OSU_PP_99 = "osu_m99PP",
  OSU_PP_SS = "osu_mSSPP",
  STARS = "mStars",
  TITLE_ROMAN = "titleRoman",
  TITLE_UNICODE = "titleUnicode",
}

/**
 * A representation of the data that StreamCompanion should watch for changes.
 */
export interface StreamCompanionWebSocketData extends StreamCompanionDataBase {
  artistRoman?: string;
  artistUnicode?: string;
  creator?: string;
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
  osuIsRunning?: boolean;
  osu_m95PP?: null | number;
  osu_m96PP?: null | number;
  osu_m97PP?: null | number;
  osu_m98PP?: null | number;
  osu_m99PP?: null | number;
  osu_mSSPP?: null | number;
  titleRoman?: string;
  titleUnicode?: string;
  type: "websocket";
}

export interface StreamCompanionFileData extends StreamCompanionDataBase {
  currentMods: string;
  custom: string;
  npAll: string;
  npPlayingDetails: string;
  npPlayingDl: string;
  type: "file";
}

interface StreamCompanionDataBase {
  type: string;
}

/** Interface which helps to get the hidden websocket URL. */
interface ReconnectingWebSocketHelper {
  _url: string;
}

export type StreamCompanionConnection = () =>
  | Promise<StreamCompanionFileData>
  | StreamCompanionWebSocketData
  | undefined;

const fileNameNpAll = "np_all.txt";
const fileNameNpPlayingDetails = "np_playing_details.txt";
const fileNameNpPlayingDl = "np_playing_DL.txt";
const fileNameCurrentMods = "current_mods.txt";
const fileNameCustom = "custom.txt";

const getFileContentIfExists = async (filePath: string) => {
  try {
    await fs.access(filePath, constants.F_OK);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return await fs.readFile(filePath);
  } catch (err) {
    return `[Error: File not found (${filePath})]`;
  }
};

/**
 * This method will setup an infinite loop that will continuously try to connect
 * to StreamCompanion.
 *
 * @param streamCompanionDirPath The directory of the StreamCompanion files.
 * @param _logger Global logger.
 * @returns A function that will use the file system interface to get the
 * StreamCompanion data.
 */
export const createStreamCompanionFileConnection =
  (
    streamCompanionDirPath: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _logger: Logger
  ): StreamCompanionConnection =>
  async (): Promise<StreamCompanionFileData> => {
    const npAll = getFileContentIfExists(
      path.join(streamCompanionDirPath, fileNameNpAll)
    );
    const npPlayingDetails = getFileContentIfExists(
      path.join(streamCompanionDirPath, fileNameNpPlayingDetails)
    );
    const npPlayingDl = getFileContentIfExists(
      path.join(streamCompanionDirPath, fileNameNpPlayingDl)
    );
    const currentMods = getFileContentIfExists(
      path.join(streamCompanionDirPath, fileNameCurrentMods)
    );
    const custom = getFileContentIfExists(
      path.join(streamCompanionDirPath, fileNameCustom)
    );

    // Wait for all promises concurrently for better performance
    await Promise.allSettled([
      npAll,
      npPlayingDetails,
      npPlayingDl,
      currentMods,
      custom,
    ]);

    // Somehow allSettled doesn't work so each promise needs to be awaited again
    return {
      currentMods: (await currentMods).toString(),
      custom: (await custom).toString(),
      npAll: (await npAll).toString(),
      npPlayingDetails: (await npPlayingDetails).toString(),
      npPlayingDl: (await npPlayingDl).toString(),
      type: "file",
    };
  };

/**
 * This method will setup an infinite loop that will continuously try to connect
 * to StreamCompanion.
 *
 * @param streamCompanionUrl The URL of the StreamCompanion websocket.
 * @param logger Global logger.
 * @returns A function that will if there is a connection and data available
 * return that data. Otherwise it will just return undefined.
 */
export const createStreamCompanionWebSocketConnection = (
  streamCompanionUrl: string,
  logger: Logger
): StreamCompanionConnection => {
  const logStreamCompanion = createLogFunc(logger, LOG_ID);

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
    ws.send(JSON.stringify(Object.values(OsuStreamCompanionData)));
  };
  const cache: StreamCompanionWebSocketData = { type: "websocket" };
  ws.onmessage = (wsEvent) => {
    Object.assign(
      cache,
      JSON.parse(wsEvent.data as string) as StreamCompanionWebSocketData
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
