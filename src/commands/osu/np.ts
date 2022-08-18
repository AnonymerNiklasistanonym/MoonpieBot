// Package imports
import osuApiV2 from "osu-api-v2";
// Local imports
import { LOG_ID_CHAT_HANDLER_OSU, OsuCommands } from "../../info/commands";
import {
  osuCommandReplyNp,
  osuCommandReplyNpNoMap,
  osuCommandReplyNpNoMapStreamCompanionWebsocket,
  osuCommandReplyNpStreamCompanionFile,
  osuCommandReplyNpStreamCompanionFileNotRunning,
  osuCommandReplyNpStreamCompanionWebSocket,
  osuCommandReplyNpStreamCompanionWebSocketNotRunning,
} from "../../strings/osu/commandReply";
import {
  regexOsuBeatmapDownloadUrlMatcher,
  regexOsuChatHandlerCommandNp,
  regexOsuWindowTitleNowPlaying,
} from "../../info/regex";
import { createLogFunc } from "../../logging";
import { errorMessageOsuApiCredentialsUndefined } from "../../error";
import { getProcessInformationByName } from "../../other/processInformation";
import { macroOsuWindowTitle } from "../../messageParser/macros/osuWindowTitle";
import { messageParserById } from "../../messageParser";
// Type imports
import type { BeatmapRequestsInfo, OsuApiV2Credentials } from "../osu";
import type {
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
} from "../../twitch";
import type { StreamCompanionConnection } from "../../osuStreamCompanion";

export interface CommandNpCreateReplyInput {
  /**
   * The osu API (v2) credentials.
   */
  osuApiV2Credentials?: OsuApiV2Credentials;
  /**
   * If available get the current map data using StreamCompanion.
   */
  osuStreamCompanionCurrentMapData?: StreamCompanionConnection;
}
export interface CommandNpCreateReplyInputExtra
  extends CommandNpCreateReplyInput {
  beatmapRequestsInfo: BeatmapRequestsInfo;
}
export type CommandNpDetectorInput = CommandGenericDetectorInputEnabledCommands;
/**
 * NP (now playing) command:
 * Send the map that is currently being played in osu (via the window title
 * because the web api is not supporting it).
 */
export const commandNp: TwitchChatCommandHandler<
  CommandNpCreateReplyInputExtra,
  CommandNpDetectorInput
> = {
  createReply: async (
    client,
    channel,
    _tags,
    data,
    globalStrings,
    globalPlugins,
    globalMacros,
    logger
  ) => {
    const logCmdNp = createLogFunc(
      logger,
      LOG_ID_CHAT_HANDLER_OSU,
      OsuCommands.NP
    );

    let msg = await messageParserById(
      osuCommandReplyNpNoMap.id,
      globalStrings,
      globalPlugins,
      globalMacros,
      logger
    );

    if (data.osuStreamCompanionCurrentMapData !== undefined) {
      const currMapData = await data.osuStreamCompanionCurrentMapData();
      if (
        currMapData !== undefined &&
        ((currMapData.type === "websocket" &&
          currMapData.mapid !== undefined &&
          currMapData.mapid !== 0) ||
          (currMapData.type === "file" &&
            currMapData.npAll !== undefined &&
            currMapData.npAll.length > 0))
      ) {
        switch (currMapData.type) {
          case "websocket":
            data.beatmapRequestsInfo.lastBeatmapId = currMapData.mapid;
            // TODO Insert macro in here so no plugin has to be used!
            msg = await messageParserById(
              osuCommandReplyNpStreamCompanionWebSocket.id,
              globalStrings,
              globalPlugins,
              globalMacros,
              logger
            );
            break;
          case "file":
            // eslint-disable-next-line no-case-declarations
            const beatmapIdMatch = currMapData.npPlayingDl.match(
              regexOsuBeatmapDownloadUrlMatcher
            );
            if (beatmapIdMatch && beatmapIdMatch.length > 1) {
              data.beatmapRequestsInfo.lastBeatmapId = parseInt(
                beatmapIdMatch[1]
              );
            }
            // TODO Insert macro in here so no plugin has to be used!
            msg = await messageParserById(
              osuCommandReplyNpStreamCompanionFile.id,
              globalStrings,
              globalPlugins,
              globalMacros,
              logger
            );
            break;
        }
      } else if (
        currMapData !== undefined &&
        currMapData.type === "websocket" &&
        currMapData.mapid !== undefined &&
        currMapData.mapid === 0
      ) {
        msg = await messageParserById(
          osuCommandReplyNpNoMapStreamCompanionWebsocket.id,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger
        );
      } else if (
        currMapData !== undefined &&
        currMapData.type === "websocket"
      ) {
        msg = await messageParserById(
          osuCommandReplyNpStreamCompanionWebSocketNotRunning.id,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger
        );
      } else {
        msg = await messageParserById(
          osuCommandReplyNpStreamCompanionFileNotRunning.id,
          globalStrings,
          globalPlugins,
          globalMacros,
          logger
        );
      }
    } else {
      if (data.osuApiV2Credentials === undefined) {
        throw errorMessageOsuApiCredentialsUndefined();
      }
      const osuProcessInformation = await getProcessInformationByName("osu");
      if (
        osuProcessInformation.platform === "win32" &&
        osuProcessInformation.processInformation !== undefined &&
        osuProcessInformation.processInformation["Window Title"] !== "osu!"
      ) {
        const match = osuProcessInformation.processInformation[
          "Window Title"
        ].match(regexOsuWindowTitleNowPlaying);
        if (match != null) {
          let mapId;
          try {
            const oauthAccessToken =
              await osuApiV2.oauth.clientCredentialsGrant(
                data.osuApiV2Credentials.clientId,
                data.osuApiV2Credentials.clientSecret
              );

            const searchResult = await osuApiV2.beatmapsets.search(
              oauthAccessToken,
              `title='${match[2]}' artist='${match[1]}'`,
              false
            );
            if (
              searchResult.beatmapsets !== undefined &&
              Array.isArray(searchResult.beatmapsets) &&
              searchResult.beatmapsets.length >= 1
            ) {
              const exactMatch = searchResult.beatmapsets.find((a) => {
                const titleIsTheSame =
                  a.title.trim().toLocaleLowerCase() ===
                  match[2].trim().toLocaleLowerCase();
                const diffNameCanBeFound = a.beatmaps?.find(
                  (b) =>
                    b.version.trim().toLocaleLowerCase() ===
                    match[3].trim().toLocaleLowerCase()
                );
                return titleIsTheSame && diffNameCanBeFound;
              });
              if (exactMatch) {
                const exactBeatmapDiff = exactMatch.beatmaps?.find(
                  (a) =>
                    a.version.trim().toLocaleLowerCase() ===
                    match[3].trim().toLocaleLowerCase()
                );
                if (exactBeatmapDiff) {
                  data.beatmapRequestsInfo.lastBeatmapId = exactBeatmapDiff.id;
                  mapId = exactBeatmapDiff.id;
                }
              }
            }
          } catch (err) {
            logCmdNp.warn((err as Error).message);
          }
          const customMacros = new Map(globalMacros);
          customMacros.set(
            macroOsuWindowTitle.id,
            new Map(
              macroOsuWindowTitle.generate({
                artist: match[1],
                mapId,
                title: match[2],
                version: match[3],
              })
            )
          );
          msg = await messageParserById(
            osuCommandReplyNp.id,
            globalStrings,
            globalPlugins,
            customMacros,
            logger
          );
        }
      }
    }
    const sentMessage = await client.say(channel, msg);
    return { sentMessage };
  },
  detect: (_tags, message, data) => {
    if (
      message.match(regexOsuChatHandlerCommandNp) &&
      data.enabledCommands.includes(OsuCommands.NP)
    ) {
      return {
        data: {},
      };
    }
    return false;
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.NP,
  },
};
