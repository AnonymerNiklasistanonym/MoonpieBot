import { OSU_STRING_ID } from "../osu";

export const OSU_BEATMAP_REQUEST_STRING_ID = `${OSU_STRING_ID}_BEATMAP_REQUEST`;

export const osuBeatmapRequest: Iterable<readonly [string, string]> = [
  [
    `${OSU_BEATMAP_REQUEST_STRING_ID}`,
    "$(USER) requested %OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%'$(SHOW_IF_TRUE=%OSU_SCORE:EXISTS%| - Current top score is)",
  ],
  ["OSU_BEATMAP_REQUEST_NOT_FOUND", "TODO"],
  [
    `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC`,
    "$(USER) requested [https://osu.ppy.sh/beatmapsets/%OSU_BEATMAP:SET_ID%#osu/%OSU_BEATMAP:ID% %OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%']",
  ],
];
