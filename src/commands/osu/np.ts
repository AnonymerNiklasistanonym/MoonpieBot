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
} from "../../info/strings/osu/commandReply";
import {
  regexOsuBeatmapIdFromUrl,
  regexOsuChatHandlerCommandNp,
  regexOsuWindowTitleNowPlaying,
} from "../../info/regex";
import { createLogFunc } from "../../logging";
import { getProcessInformationByName } from "../../other/processInformation";
import { macroOsuWindowTitle } from "../../info/macros/osuWindowTitle";
// Type imports
import type {
  ChatMessageHandlerReplyCreator,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands,
} from "../../chatMessageHandler";
import type {
  CommandOsuGenericDataExtraBeatmapRequestsInfo,
  CommandOsuGenericDataOsuApiV2Credentials,
  CommandOsuGenericDataStreamCompanionFunc,
} from "../osu";
import type {
  RegexOsuBeatmapIdFromUrl,
  RegexOsuWindowTitleNowPlaying,
} from "../../info/regex";
import type { MacroMap } from "../../messageParser";

/**
 * NP (now playing) command:
 * Send the map that is currently being played in osu (via the window title
 * because the web api is not supporting it).
 */
export const commandNp: ChatMessageHandlerReplyCreator<
  (
    | (CommandOsuGenericDataStreamCompanionFunc &
        CommandOsuGenericDataOsuApiV2Credentials)
    | Required<CommandOsuGenericDataStreamCompanionFunc>
  ) &
    CommandOsuGenericDataExtraBeatmapRequestsInfo,
  ChatMessageHandlerReplyCreatorGenericDetectorInputEnabledCommands
> = {
  createReply: async (_channel, _tags, data, logger) => {
    const logCmdNp = createLogFunc(
      logger,
      LOG_ID_CHAT_HANDLER_OSU,
      OsuCommands.NP
    );

    if (data.osuStreamCompanionCurrentMapData !== undefined) {
      const currMapData = await data.osuStreamCompanionCurrentMapData();
      if (
        currMapData !== undefined &&
        ((currMapData.type === "websocket" &&
          currMapData.mapid !== undefined &&
          currMapData.mapid !== 0) ||
          (currMapData.type === "file" && currMapData?.npAll.length > 0))
      ) {
        switch (currMapData.type) {
          case "websocket":
            data.beatmapRequestsInfo.lastMentionedBeatmapId = currMapData.mapid;
            // TODO Insert macro in here so no plugin has to be used!
            return {
              messageId: osuCommandReplyNpStreamCompanionWebSocket.id,
            };
          case "file":
            // eslint-disable-next-line no-case-declarations
            const beatmapIdMatch = currMapData.npPlayingDl.match(
              regexOsuBeatmapIdFromUrl
            );
            if (beatmapIdMatch) {
              const matchGroups = beatmapIdMatch.groups as
                | undefined
                | RegexOsuBeatmapIdFromUrl;
              if (!matchGroups) {
                throw Error("RegexOsuBeatmapIdFromUrl groups undefined");
              }
              let beatmapId;
              if (
                "beatmapIdB" in matchGroups &&
                matchGroups.beatmapIdB !== undefined
              ) {
                beatmapId = matchGroups.beatmapIdB;
              }
              if (
                "beatmapIdBeatmaps" in matchGroups &&
                matchGroups.beatmapIdBeatmaps !== undefined
              ) {
                beatmapId = matchGroups.beatmapIdBeatmaps;
              }
              if (
                "beatmapIdBeatmapsets" in matchGroups &&
                matchGroups.beatmapIdBeatmapsets !== undefined
              ) {
                beatmapId = matchGroups.beatmapIdBeatmapsets;
              }
              if (beatmapId !== undefined) {
                data.beatmapRequestsInfo.lastMentionedBeatmapId =
                  parseInt(beatmapId);
              }
            }
            // TODO Insert macro in here so no plugin has to be used!
            return {
              messageId: osuCommandReplyNpStreamCompanionFile.id,
            };
        }
      } else if (
        currMapData?.type === "websocket" &&
        currMapData?.mapid === 0
      ) {
        return {
          messageId: osuCommandReplyNpNoMapStreamCompanionWebsocket.id,
        };
      } else if (currMapData?.type === "websocket") {
        return {
          messageId: osuCommandReplyNpStreamCompanionWebSocketNotRunning.id,
        };
      }
      return {
        messageId: osuCommandReplyNpStreamCompanionFileNotRunning.id,
      };
    } else if ("osuApiV2Credentials" in data) {
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
          const matchGroups = match.groups as
            | undefined
            | RegexOsuWindowTitleNowPlaying;
          if (!matchGroups) {
            throw Error("RegexOsuWindowTitleNowPlaying groups undefined");
          }
          let mapId;
          try {
            const oauthAccessToken =
              await osuApiV2.oauth.clientCredentialsGrant(
                data.osuApiV2Credentials.clientId,
                data.osuApiV2Credentials.clientSecret
              );

            const searchResult = await osuApiV2.beatmapsets.search(
              oauthAccessToken,
              `title='${matchGroups.title}' artist='${matchGroups.artist}'`,
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
                  matchGroups.title.trim().toLocaleLowerCase();
                const diffNameCanBeFound = a.beatmaps?.find(
                  (b) =>
                    b.version.trim().toLocaleLowerCase() ===
                    matchGroups.version.trim().toLocaleLowerCase()
                );
                return titleIsTheSame && diffNameCanBeFound;
              });
              if (exactMatch) {
                const exactBeatmapDiff = exactMatch.beatmaps?.find(
                  (a) =>
                    a.version.trim().toLocaleLowerCase() ===
                    matchGroups.version.trim().toLocaleLowerCase()
                );
                if (exactBeatmapDiff) {
                  data.beatmapRequestsInfo.lastMentionedBeatmapId =
                    exactBeatmapDiff.id;
                  mapId = exactBeatmapDiff.id;
                }
              }
            }
          } catch (err) {
            logCmdNp.warn((err as Error).message);
          }
          const customMacros: MacroMap = new Map();
          customMacros.set(
            macroOsuWindowTitle.id,
            new Map(
              macroOsuWindowTitle.generate({
                artist: matchGroups.artist,
                mapId,
                title: matchGroups.title,
                version: matchGroups.version,
              })
            )
          );
          return {
            additionalMacros: customMacros,
            messageId: osuCommandReplyNp.id,
          };
        }
      }
      return { messageId: osuCommandReplyNpNoMap.id };
    }
    throw Error(
      "Neither an osu!api credentials nor a StreamCompanion connection was found"
    );
  },
  detect: (_tags, message, data) => {
    if (!data.enabledCommands.includes(OsuCommands.NP)) {
      return false;
    }
    const match = message.match(regexOsuChatHandlerCommandNp);
    if (!match) {
      return false;
    }
    return { data: {} };
  },
  info: {
    chatHandlerId: LOG_ID_CHAT_HANDLER_OSU,
    id: OsuCommands.NP,
  },
};
