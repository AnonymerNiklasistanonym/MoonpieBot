/**
 * Strings handling.
 */

export const defaultStrings = new Map<string, string>([
  [
    "OSU_BEATMAP_REQUEST",
    "$(user) requested %OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%'$(SHOW_IF_TRUE=%OSU_SCORE:EXISTS%| - Current top score is)",
  ],
  ["OSU_BEATMAP_REQUEST_IRC", "TODO"],
  [
    "OSU_BEATMAP_REQUEST_NOT_FOUND",
    "$(user) requested [https://osu.ppy.sh/beatmapsets/%OSU:BEATMAPSET_ID%#osu/%OSU:BEATMAP_ID% %OSU:BEATMAP_TITLE% '%OSU:BEATMAP_VERSION%' by '%OSU:BEATMAP_ARTIST%']",
  ],
]);
