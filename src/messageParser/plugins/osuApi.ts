/* eslint-disable @typescript-eslint/restrict-template-expressions */

// Package imports
import osuApiV2, { GameMode, ScoresType } from "osu-api-v2";
// Type imports
import {
  macroOsuBeatmap,
  macroOsuMostRecentPlay,
  MacroOsuMostRecentPlay,
  MacroOsuScore,
  macroOsuScore,
  macroOsuUser,
} from "../macros/osuApi";
import { NOT_FOUND_STATUS_CODE } from "../../info/other";
// Type imports
import type { MacroMap } from "../../messageParser";
import type { MessageParserPluginGenerator } from "../plugins";
import type { OsuApiV2Credentials } from "../../commands/osu";
import type { OsuApiV2WebRequestError } from "osu-api-v2";

export enum PluginOsuApi {
  BEATMAP = "OSU_API_BEATMAP",
  MOST_RECENT_PLAY = "OSU_API_MOST_RECENT_PLAY",
  SCORE = "OSU_API_SCORE",
  USER = "OSU_API_USER",
}

export interface PluginOsuBeatmapGeneratorData {
  osuApiV2Credentials: OsuApiV2Credentials;
}

export interface PluginsOsuGeneratorData {
  osuApiV2Credentials: OsuApiV2Credentials;
}

export const pluginsOsuGenerator: MessageParserPluginGenerator<PluginsOsuGeneratorData>[] =
  [
    {
      generate:
        (data) =>
        async (_, beatmapId): Promise<MacroMap> => {
          if (beatmapId === undefined || beatmapId.trim().length === 0) {
            throw Error("osu! beatmap ID was empty");
          }
          const beatmapIdNumber = parseInt(beatmapId);
          const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
            data.osuApiV2Credentials.clientId,
            data.osuApiV2Credentials.clientSecret
          );
          const beatmap = await osuApiV2.beatmaps.get(
            oauthAccessToken,
            beatmapIdNumber
          );
          return new Map([
            [
              macroOsuBeatmap.id,
              new Map(macroOsuBeatmap.generate({ beatmap })),
            ],
          ]);
        },
      id: PluginOsuApi.BEATMAP,
      signature: {
        argument: "osuBeatmapID",
        exportedMacros: [macroOsuBeatmap],
        type: "signature",
      },
    },
    {
      generate:
        (data) =>
        async (_, beatmapIdAndUserId): Promise<MacroMap> => {
          if (
            beatmapIdAndUserId === undefined ||
            beatmapIdAndUserId.trim().length === 0
          ) {
            throw Error("osu! beatmap/user ID was empty");
          }
          const beatmapIdAndUserIdNumber = beatmapIdAndUserId
            .split(" ")
            .map((a) => parseInt(a));
          if (beatmapIdAndUserIdNumber.length !== 2) {
            throw Error("osu! beatmap or user ID missing");
          }
          const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
            data.osuApiV2Credentials.clientId,
            data.osuApiV2Credentials.clientSecret
          );
          try {
            const beatmapScore = await osuApiV2.beatmaps.scores.users(
              oauthAccessToken,
              beatmapIdAndUserIdNumber[0],
              beatmapIdAndUserIdNumber[1]
            );
            return new Map([
              [
                macroOsuScore.id,
                new Map(macroOsuScore.generate({ beatmapScore })),
              ],
            ]);
          } catch (err) {
            if (
              (err as OsuApiV2WebRequestError).statusCode ===
              NOT_FOUND_STATUS_CODE
            ) {
              return new Map([
                [macroOsuScore.id, new Map([[MacroOsuScore.EXISTS, "false"]])],
              ]);
            } else {
              throw err;
            }
          }
        },
      id: PluginOsuApi.SCORE,
      signature: {
        argument: "osuBeatmapId osuUserId",
        exportedMacros: [macroOsuScore],
        type: "signature",
      },
    },
    {
      generate:
        (data) =>
        async (_, userId): Promise<MacroMap> => {
          if (userId === undefined || userId.trim().length === 0) {
            throw Error("osu! user ID was empty");
          }
          const userIdNumber = parseInt(userId);
          const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
            data.osuApiV2Credentials.clientId,
            data.osuApiV2Credentials.clientSecret
          );
          const lastPlays = await osuApiV2.users.scores(
            oauthAccessToken,
            userIdNumber,
            ScoresType.RECENT,
            GameMode.OSU_STANDARD,
            1,
            0,
            true
          );
          if (lastPlays.length > 0) {
            return new Map([
              [
                macroOsuMostRecentPlay.id,
                new Map(
                  macroOsuMostRecentPlay.generate({ score: lastPlays[0] })
                ),
              ],
            ]);
          }
          return new Map([
            [
              macroOsuMostRecentPlay.id,
              new Map([[MacroOsuMostRecentPlay.FOUND, "false"]]),
            ],
          ]);
        },
      id: PluginOsuApi.MOST_RECENT_PLAY,
      signature: {
        argument: "osuUserId",
        exportedMacros: [macroOsuMostRecentPlay],
        type: "signature",
      },
    },
    {
      generate:
        (data) =>
        async (_, userId): Promise<MacroMap> => {
          if (userId === undefined || userId.trim().length === 0) {
            throw Error("osu! user ID was empty");
          }
          const userIdNumber = parseInt(userId);
          const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
            data.osuApiV2Credentials.clientId,
            data.osuApiV2Credentials.clientSecret
          );
          const user = await osuApiV2.users.get(
            oauthAccessToken,
            userIdNumber,
            GameMode.OSU_STANDARD
          );
          return new Map([
            [macroOsuUser.id, new Map(macroOsuUser.generate({ user }))],
          ]);
        },
      id: PluginOsuApi.USER,
      signature: {
        argument: "osuUserId",
        exportedMacros: [macroOsuUser],
        type: "signature",
      },
    },
  ];
