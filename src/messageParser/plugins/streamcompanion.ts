/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { StreamCompanionData } from "src/streamcompanion";
import type { MessageParserPlugin } from "../plugins";

export const pluginStreamCompanion = (
  streamCompanionDataFunc: () => StreamCompanionData | undefined
): MessageParserPlugin => {
  return {
    id: "OSU_STREAMCOMPANION",
    func: () => {
      const streamCompanionData = streamCompanionDataFunc();
      if (streamCompanionData === undefined) {
        return [];
      }
      return [
        ["ARTIST_ROMAN", `${streamCompanionData.artistRoman}`],
        ["TITLE_ROMAN", `${streamCompanionData.titleRoman}`],
        ["VERSION", `${streamCompanionData.diffName}`],
        ["ID", `${streamCompanionData.mapid}`],
        ["SET_ID", `${streamCompanionData.mapsetid}`],
        ["CS", `${streamCompanionData.mCS}`],
        ["AR", `${streamCompanionData.mAR}`],
        ["OD", `${streamCompanionData.mOD}`],
        ["HP", `${streamCompanionData.mHP}`],
        ["BPM", `${streamCompanionData.mBpm}`],
        [
          "DIFFICULTY_RATING",
          `${
            streamCompanionData.mStars !== undefined
              ? Math.round(
                  streamCompanionData.mStars * 10000 + Number.EPSILON
                ) / 100
              : undefined
          }`,
        ],
        ["MAX_COMBO", `${streamCompanionData.maxCombo}`],
        ["MODS", `${streamCompanionData.mods}`],
      ];
    },
  };
};
