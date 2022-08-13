/* eslint-disable @typescript-eslint/restrict-template-expressions */

// Package imports
import osuApiV2, { GameMode, ScoresType } from "osu-api-v2";
// Type imports
import {
  macroOsuBeatmap,
  macroOsuBeatmapLogic,
  macroOsuMostRecentPlay,
  MacroOsuMostRecentPlay,
  macroOsuScore,
  macroOsuScoreLogic,
  macroOsuUser,
  MacroOsuUser,
} from "../macros/osuApi";
import { monthNames } from "../../other/monthNames";
import { roundNumber } from "../../other/round";
// Type imports
import type { MessageParserPluginGenerator } from "../plugins";
import type { OsuApiV2Credentials } from "../../commands/osu";
import type { OsuApiV2WebRequestError } from "osu-api-v2";

export enum PluginOsuApi {
  BEATMAP = "OSU_BEATMAP",
  MOST_RECENT_PLAY = "OSU_MOST_RECENT_PLAY",
  SCORE = "OSU_SCORE",
  USER = "OSU_USER",
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
      generate: (data) => async (_, beatmapId) => {
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
        return macroOsuBeatmapLogic(beatmap);
      },
      id: PluginOsuApi.BEATMAP,
      signature: {
        argument: "osuBeatmapID",
        exportedMacros: [macroOsuBeatmap],
        type: "signature",
      },
    },
    {
      generate: (data) => async (_, beatmapIdAndUserId) => {
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
          return macroOsuScoreLogic(beatmapScore);
        } catch (err) {
          if (
            (err as OsuApiV2WebRequestError).statusCode ===
            STATUS_CODE_NOT_FOUND
          ) {
            return [["EXISTS", "false"]];
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
      generate: (data) => async (_, userId) => {
        if (userId === undefined || userId.trim().length === 0) {
          throw Error("osu! user ID was empty");
        }
        const userIdNumber = parseInt(userId);
        const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
          data.osuApiV2Credentials.clientId,
          data.osuApiV2Credentials.clientSecret
        );
        const lastPlay = await osuApiV2.users.scores(
          oauthAccessToken,
          userIdNumber,
          ScoresType.Recent,
          GameMode.osu,
          1,
          0,
          true
        );
        if (lastPlay.length > 0) {
          const score = lastPlay[0];
          const scoreDate = new Date(score.created_at);
          const scoreDateRangeMs = new Date().getTime() - scoreDate.getTime();
          return [
            [MacroOsuMostRecentPlay.FOUND, "true"],
            [MacroOsuMostRecentPlay.PASSED, `${score.passed}`],
            [MacroOsuMostRecentPlay.RANK, `${score.rank}`],
            [MacroOsuMostRecentPlay.FC, `${score.perfect}`],
            [
              MacroOsuMostRecentPlay.ACC,
              `${roundNumber(score.accuracy * 100, 2)}`,
            ],
            [
              MacroOsuMostRecentPlay.PP,
              score.pp == null ? "undefined" : `${roundNumber(score.pp * 100)}`,
            ],
            [MacroOsuMostRecentPlay.MODS, `${score.mods.join(",")}`],
            [MacroOsuMostRecentPlay.COUNT_300, `${score.statistics.count_300}`],
            [MacroOsuMostRecentPlay.COUNT_100, `${score.statistics.count_100}`],
            [MacroOsuMostRecentPlay.COUNT_50, `${score.statistics.count_50}`],
            [
              MacroOsuMostRecentPlay.COUNT_MISS,
              `${score.statistics.count_miss}`,
            ],
            [MacroOsuMostRecentPlay.MAX_COMBO, `${score.max_combo}`],
            [
              MacroOsuMostRecentPlay.TIME_IN_S_AGO,
              `${scoreDateRangeMs / 1000}`,
            ],
            [
              MacroOsuMostRecentPlay.DATE_MONTH,
              monthNames[scoreDate.getMonth()],
            ],
            [MacroOsuMostRecentPlay.DATE_YEAR, `${scoreDate.getFullYear()}`],
            [MacroOsuMostRecentPlay.USER_NAME, `${score.user?.username}`],
            [MacroOsuMostRecentPlay.USER_ID, `${score.user?.id}`],
            [MacroOsuMostRecentPlay.HAS_REPLAY, `${score.replay}`],
            [MacroOsuMostRecentPlay.ID, `${score.id}`],
            [MacroOsuMostRecentPlay.MAP_ID, `${score.beatmap?.id}`],
            [MacroOsuMostRecentPlay.USER_ID, `${score.user?.id}`],
            [MacroOsuMostRecentPlay.USER_NAME, `${score.user?.username}`],
          ];
        }
        return [["FOUND", "false"]];
      },
      id: PluginOsuApi.MOST_RECENT_PLAY,
      signature: {
        argument: "osuUserId",
        exportedMacros: [macroOsuMostRecentPlay],
        type: "signature",
      },
    },
    {
      generate: (data) => async (_, userId) => {
        if (userId === undefined || userId.trim().length === 0) {
          throw Error("osu! user ID was empty");
        }
        const userIdNumber = parseInt(userId);
        const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
          data.osuApiV2Credentials.clientId,
          data.osuApiV2Credentials.clientSecret
        );
        const user = await osuApiV2.users.id(
          oauthAccessToken,
          userIdNumber,
          GameMode.osu
        );
        const joinDate = new Date(user.join_date);
        const joinDateMonth = joinDate.getMonth();
        const joinDateYear = joinDate.getFullYear();
        const userAchievements = user.user_achievements;

        return [
          // eslint-disable-next-line security/detect-object-injection
          [MacroOsuUser.JOIN_DATE_MONTH, `${monthNames[joinDateMonth]}`],
          [MacroOsuUser.JOIN_DATE_YEAR, `${joinDateYear}`],
          [MacroOsuUser.GLOBAL_RANK, `${user.statistics?.global_rank}`],
          [MacroOsuUser.COUNTRY_RANK, `${user.statistics?.country_rank}`],
          [MacroOsuUser.COUNTRY, `${user.country.name}`],
          [MacroOsuUser.ID, `${user.id}`],
          [MacroOsuUser.NAME, `${user.username}`],
          [
            MacroOsuUser.PLAY_STYLE,
            `${
              user.playstyle != null && user.playstyle.length > 0
                ? user.playstyle.join(", ")
                : undefined
            }`,
          ],
          [MacroOsuUser.HAS_STATISTICS, `${user.statistics !== undefined}`],
          [
            MacroOsuUser.PP,
            `${
              user.statistics ? roundNumber(user.statistics.pp, 2) : undefined
            }`,
          ],
          [
            MacroOsuUser.ACC,
            `${
              user.statistics
                ? roundNumber(user.statistics.hit_accuracy, 2)
                : undefined
            }`,
          ],
          [MacroOsuUser.MAX_COMBO, `${user.statistics?.maximum_combo}`],
          [MacroOsuUser.COUNTS_SSH, `${user.statistics?.grade_counts.ssh}`],
          [MacroOsuUser.COUNTS_SS, `${user.statistics?.grade_counts.ss}`],
          [MacroOsuUser.COUNTS_SH, `${user.statistics?.grade_counts.sh}`],
          [MacroOsuUser.COUNTS_S, `${user.statistics?.grade_counts.s}`],
          [MacroOsuUser.COUNTS_A, `${user.statistics?.grade_counts.a}`],
          [
            MacroOsuUser.HAS_BUNNY,
            `${
              userAchievements !== undefined &&
              userAchievements.find(
                (a) => a.achievement_id === OSU_ACHIEVEMENT_ID_BUNNY
              )
                ? true
                : false
            }`,
          ],
          [
            MacroOsuUser.HAS_TUTEL,
            `${
              userAchievements !== undefined &&
              userAchievements?.find(
                (a) => a.achievement_id === OSU_ACHIEVEMENT_ID_TUTEL
              )
                ? true
                : false
            }`,
          ],
        ];
      },
      id: PluginOsuApi.USER,
      signature: {
        argument: "osuUserId",
        exportedMacros: [macroOsuUser],
        type: "signature",
      },
    },
  ];

const STATUS_CODE_NOT_FOUND = 404;

const OSU_ACHIEVEMENT_ID_TUTEL = 151;
const OSU_ACHIEVEMENT_ID_BUNNY = 6;
