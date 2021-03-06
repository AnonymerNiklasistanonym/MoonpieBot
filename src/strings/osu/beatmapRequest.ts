import { OSU_STRING_ID } from "../osu";

export const OSU_BEATMAP_REQUEST_STRING_ID = `${OSU_STRING_ID}_BEATMAP_REQUEST`;

export const osuBeatmapRequest = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}`,
  default:
    "$(USER) requested " +
    "$(OSU_BEATMAP=%OSU_BEATMAP_REQUEST:ID%|%OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%')" +
    "$(OSU_SCORE=%OSU_BEATMAP_REQUEST:ID% %OSU_API:DEFAULT_USER_ID%|$(IF_EQUAL=%OSU_SCORE:EXISTS%===true| - Current top score is a %OSU_SCORE:RANK%$(IF_NOT_EMPTY=%OSU_SCORE:MODS%| using %OSU_SCORE:MODS%))$(IF_EQUAL=%OSU_SCORE:EXISTS%===false| - No score found))",
};

export const osuBeatmapRequestDetailed = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_DETAILED`,
  default:
    "$(USER) requested " +
    "$(OSU_BEATMAP=%OSU_BEATMAP_REQUEST:ID%|%OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%' [%OSU_BEATMAP:DIFFICULTY_RATING%* $(TIME_IN_S_TO_STOPWATCH_STRING=%OSU_BEATMAP:LENGTH_IN_S%) %OSU_BEATMAP:RANKED_STATUS%] from %OSU_BEATMAP:LAST_UPDATED_MONTH% %OSU_BEATMAP:LAST_UPDATED_YEAR% {FC=%OSU_BEATMAP:MAX_COMBO%, CS=%OSU_BEATMAP:CS%, DRAIN=%OSU_BEATMAP:DRAIN%, ACC=%OSU_BEATMAP:ACC%, AR=%OSU_BEATMAP:AR%, BPM=%OSU_BEATMAP:BPM%, CC=%OSU_BEATMAP:CC%, SLC=%OSU_BEATMAP:SLC%, SPC=%OSU_BEATMAP:SPC%})" +
    "$(OSU_SCORE=%OSU_BEATMAP_REQUEST:ID% %OSU_API:DEFAULT_USER_ID%|$(IF_EQUAL=%OSU_SCORE:EXISTS%===true| - Current top score is a %OSU_SCORE:RANK%$(IF_NOT_EMPTY=%OSU_SCORE:MODS%| using %OSU_SCORE:MODS%)$(IF_NOT_UNDEFINED=%OSU_SCORE:PP%| with %OSU_SCORE:PP%pp) \\(%OSU_SCORE:COUNT_300%/%OSU_SCORE:COUNT_100%/%OSU_SCORE:COUNT_50%/%OSU_SCORE:COUNT_MISS%\\) [mc=%OSU_SCORE:MAX_COMBO%, acc=%OSU_SCORE:ACC%%] from %OSU_SCORE:DATE_MONTH% %OSU_SCORE:DATE_YEAR% $(IF_EQUAL=%OSU_SCORE:HAS_REPLAY%===true| {replay available}))$(IF_EQUAL=%OSU_SCORE:EXISTS%===false| - No score found))",
};

export const osuBeatmapRequestNotFound = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_NOT_FOUND`,
  default: "osu! beatmap was not found :( (ID='%OSU_BEATMAP_REQUEST:ID%')",
};

export const osuBeatmapRequestIrc = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC`,
  default:
    "$(USER) requested $(OSU_BEATMAP=%OSU_BEATMAP_REQUEST:ID%|[https://osu.ppy.sh/beatmapsets/%OSU_BEATMAP:SET_ID%#osu/%OSU_BEATMAP:ID% %OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%'])" +
    "$(OSU_SCORE=%OSU_BEATMAP_REQUEST:ID% %OSU_API:DEFAULT_USER_ID%|$(IF_EQUAL=%OSU_SCORE:EXISTS%===true|%NEWLINE% > Top score: %OSU_SCORE:RANK%$(IF_NOT_EMPTY=%OSU_SCORE:MODS%| using %OSU_SCORE:MODS%)))" +
    "$(IF_NOT_EMPTY=%OSU_BEATMAP_REQUEST:COMMENT%|%NEWLINE% > Comment: %OSU_BEATMAP_REQUEST:COMMENT%)",
};

export const osuBeatmapRequestIrcDetailed = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_IRC_DETAILED`,
  default:
    "$(USER) requested $(OSU_BEATMAP=%OSU_BEATMAP_REQUEST:ID%|[https://osu.ppy.sh/beatmapsets/%OSU_BEATMAP:SET_ID%#osu/%OSU_BEATMAP:ID% %OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%']%NEWLINE%from %OSU_BEATMAP:LAST_UPDATED_MONTH% %OSU_BEATMAP:LAST_UPDATED_YEAR% {FC=%OSU_BEATMAP:MAX_COMBO%, CS=%OSU_BEATMAP:CS%, DRAIN=%OSU_BEATMAP:DRAIN%, ACC=%OSU_BEATMAP:ACC%, AR=%OSU_BEATMAP:AR%, BPM=%OSU_BEATMAP:BPM%, CC=%OSU_BEATMAP:CC%, SLC=%OSU_BEATMAP:SLC%, SPC=%OSU_BEATMAP:SPC%})" +
    "$(OSU_SCORE=%OSU_BEATMAP_REQUEST:ID% %OSU_API:DEFAULT_USER_ID%|$(IF_EQUAL=%OSU_SCORE:EXISTS%===true|%NEWLINE%> Top score: %OSU_SCORE:RANK%$(IF_NOT_EMPTY=%OSU_SCORE:MODS%| using %OSU_SCORE:MODS%)$(IF_NOT_UNDEFINED=%OSU_SCORE:PP%| with %OSU_SCORE:PP%pp) \\(%OSU_SCORE:COUNT_300%/%OSU_SCORE:COUNT_100%/%OSU_SCORE:COUNT_50%/%OSU_SCORE:COUNT_MISS%\\) [mc=%OSU_SCORE:MAX_COMBO%, acc=%OSU_SCORE:ACC%%] from %OSU_SCORE:DATE_MONTH% %OSU_SCORE:DATE_YEAR% $(IF_EQUAL=%OSU_SCORE:HAS_REPLAY%===true| {replay available})))" +
    "$(IF_NOT_EMPTY=%OSU_BEATMAP_REQUEST:COMMENT%|%NEWLINE% > Comment: %OSU_BEATMAP_REQUEST:COMMENT%)",
};

export const osuBeatmapRequestPermissionError = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_PERMISSION_ERROR`,
  default:
    "You are not a broadcaster and thus are not allowed to use this command!",
};

export const osuBeatmapRequestTurnedOff = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_OFF`,
  default:
    "Beatmap requests: Off$(IF_NOT_EMPTY=%BEATMAP_REQUEST:CUSTOM_MESSAGE%| \\(%BEATMAP_REQUEST:CUSTOM_MESSAGE%\\))",
};
export const osuBeatmapRequestTurnedOn = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_TURNED_ON`,
  default: "Beatmap requests: On",
};
export const osuBeatmapRequestCurrentlyOff = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_OFF`,
  default:
    "@$(USER) Beatmap requests are currently off$(IF_NOT_EMPTY=%BEATMAP_REQUEST:CUSTOM_MESSAGE%| \\(%BEATMAP_REQUEST:CUSTOM_MESSAGE%\\))",
};
export const osuBeatmapRequestCurrentlyOn = {
  id: `${OSU_BEATMAP_REQUEST_STRING_ID}_CURRENTLY_ON`,
  default: "@$(USER) Beatmap requests are currently on",
};

export const osuBeatmapRequests = [
  osuBeatmapRequest,
  osuBeatmapRequestDetailed,
  osuBeatmapRequestNotFound,
  osuBeatmapRequestIrc,
  osuBeatmapRequestIrcDetailed,
  osuBeatmapRequestPermissionError,
  osuBeatmapRequestTurnedOff,
  osuBeatmapRequestTurnedOn,
  osuBeatmapRequestCurrentlyOff,
  osuBeatmapRequestCurrentlyOn,
];
