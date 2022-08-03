import { OSU_STRING_ID } from "../osu";
import { osuBeatmapRequestRefTopScore } from "./beatmapRequest";

export const OSU_COMMAND_REPLY_STRING_ID = `${OSU_STRING_ID}_COMMAND_REPLY`;

export const osuCommandReplyNp = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP`,
  default:
    "@$(USER) Currently playing '%OSU_WINDOW_TITLE:TITLE%' from '%OSU_WINDOW_TITLE:ARTIST%' [%OSU_WINDOW_TITLE:VERSION%]$(IF_NOT_UNDEFINED=%OSU_WINDOW_TITLE:MAP_ID_VIA_API%| \\(https://osu.ppy.sh/beatmaps/%OSU_WINDOW_TITLE:MAP_ID_VIA_API%\\))",
};

export const osuCommandReplyNpStreamCompanion = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION`,
  default:
    "@$(USER) Currently playing $(OSU_STREAMCOMPANION|'%OSU_STREAMCOMPANION:TITLE_ROMAN%' from '%OSU_STREAMCOMPANION:ARTIST_ROMAN%' [%OSU_STREAMCOMPANION:VERSION%]$(IF_NOT_UNDEFINED=%OSU_STREAMCOMPANION:MODS%|$(IF_NOT_EQUAL=%OSU_STREAMCOMPANION:MODS%!==None| using %OSU_STREAMCOMPANION:MODS%)) - CS %OSU_STREAMCOMPANION:CS%, AR %OSU_STREAMCOMPANION:AR%, OD %OSU_STREAMCOMPANION:OD%, HP %OSU_STREAMCOMPANION:HP%, BPM %OSU_STREAMCOMPANION:BPM%, %OSU_STREAMCOMPANION:MAX_COMBO%x, %OSU_STREAMCOMPANION:DIFFICULTY_RATING%* ($(IF_GREATER=%OSU_STREAMCOMPANION:ID%>0|https://osu.ppy.sh/beatmaps/%OSU_STREAMCOMPANION:ID% - )$(IF_NOT_GREATER=%OSU_STREAMCOMPANION:ID%<=0|$(IF_GREATER=%OSU_STREAMCOMPANION:SET_ID%>0|https://osu.ppy.sh/beatmapsets/%OSU_STREAMCOMPANION:SET_ID% - ))StreamCompanion))",
};

export const osuCommandReplyNpNoMap = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP`,
  default: "@$(USER) No map is currently being played",
};

export const osuCommandReplyNpNoMapStreamCompanion = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP_STREAMCOMPANION`,
  default:
    "@$(USER) No map is currently being played (This is either a custom map or you need to wait until a map change happens since StreamCompanion was found running but it hasn't yet detected an osu! map!)",
};

export const osuCommandReplyNpStreamCompanionNotRunning = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_NOT_RUNNING`,
  default:
    "@$(USER) No map is currently being played (StreamCompanion was configured but not found running!)",
};

export const osuCommandReplyRp = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP`,
  default:
    "@$(USER) $(OSU_MOST_RECENT_PLAY=%OSU_RP_REQUEST:ID%|" +
    "$(IF_EQUAL=%OSU_MOST_RECENT_PLAY:FOUND%===true|" +
    "Most recent play of %OSU_MOST_RECENT_PLAY:USER_NAME%: $(IF_EQUAL=%OSU_MOST_RECENT_PLAY:PASSED%===true|%OSU_MOST_RECENT_PLAY:RANK%)$(IF_EQUAL=%OSU_MOST_RECENT_PLAY:PASSED%===false|A fail)" +
    "$(IF_NOT_EMPTY=%OSU_MOST_RECENT_PLAY:MODS%| using %OSU_MOST_RECENT_PLAY:MODS%)$(IF_NOT_UNDEFINED=%OSU_MOST_RECENT_PLAY:PP%| with %OSU_MOST_RECENT_PLAY:PP%pp) \\(%OSU_MOST_RECENT_PLAY:COUNT_300%/%OSU_MOST_RECENT_PLAY:COUNT_100%/%OSU_MOST_RECENT_PLAY:COUNT_50%/%OSU_MOST_RECENT_PLAY:COUNT_MISS%\\) [mc=%OSU_MOST_RECENT_PLAY:MAX_COMBO%, acc=%OSU_MOST_RECENT_PLAY:ACC%%]" +
    " on $(OSU_BEATMAP=%OSU_MOST_RECENT_PLAY:MAP_ID%|%OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%' [%OSU_BEATMAP:DIFFICULTY_RATING%* $(TIME_IN_S_TO_STOPWATCH_STRING=%OSU_BEATMAP:LENGTH_IN_S%) %OSU_BEATMAP:RANKED_STATUS%] from %OSU_BEATMAP:LAST_UPDATED_MONTH% %OSU_BEATMAP:LAST_UPDATED_YEAR% {FC=%OSU_BEATMAP:MAX_COMBO%, CS=%OSU_BEATMAP:CS%, DRAIN=%OSU_BEATMAP:DRAIN%, ACC=%OSU_BEATMAP:ACC%, AR=%OSU_BEATMAP:AR%, BPM=%OSU_BEATMAP:BPM%, CC=%OSU_BEATMAP:CC%, SLC=%OSU_BEATMAP:SLC%, SPC=%OSU_BEATMAP:SPC%})" +
    "$(IF_EQUAL=%OSU_MOST_RECENT_PLAY:HAS_REPLAY%===true| {replay available})" +
    ")" +
    "$(IF_EQUAL=%OSU_MOST_RECENT_PLAY:FOUND%===false|" +
    "No recent play was found))",
};

export const osuCommandReplyRpNotFound = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP_NOT_FOUND`,
  default: "@$(USER) No recent play was found",
};

export const osuCommandReplyPp = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_PP`,
  default:
    "@$(USER) $(OSU_USER=%OSU_PP_REQUEST:ID%|%OSU_USER:NAME% \\(https://osu.ppy.sh/users/%OSU_USER:ID%\\) from %OSU_USER:COUNTRY% plays$(IF_NOT_UNDEFINED=%OSU_USER:PLAYSTYLE%| with %OSU_USER:PLAYSTYLE%) since %OSU_USER:JOIN_DATE_MONTH% %OSU_USER:JOIN_DATE_YEAR%$(IF_EQUAL=%OSU_USER:HAS_STATISTICS%===true| and reached rank #%OSU_USER:GLOBAL_RANK% [country #%OSU_USER:COUNTRY_RANK%] with %OSU_USER:PP%pp, %OSU_USER:ACC%% accuracy, a max combo of  %OSU_USER:MAX_COMBO%, %OSU_USER:COUNTS_SSH% SSHs, %OSU_USER:COUNTS_SS% SSs, %OSU_USER:COUNTS_SH% SHs, %OSU_USER:COUNTS_S% Ss, %OSU_USER:COUNTS_A% As) - bunny=$(IF_EQUAL=%OSU_USER:HAS_BUNNY%===true|yes)$(IF_EQUAL=%OSU_USER:HAS_BUNNY%===false|no),tutel=$(IF_EQUAL=%OSU_USER:HAS_TUTEL%===true|yes)$(IF_EQUAL=%OSU_USER:HAS_TUTEL%===false|no))",
};

export const osuScoreNoBeatmap = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE_NO_BEATMAP`,
  default: "@$(USER) No beatmap was found",
};

export const osuScoreNotFound = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE_NO_SCORE`,
  default:
    "@$(USER) No score was found of the user %OSU_SCORE_REQUEST:USER_NAME% on the map",
};

export const osuScore = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_SCORE`,
  default: `@$(USER) %OSU_SCORE_REQUEST:USER_NAME% has a $[${osuBeatmapRequestRefTopScore.id}]`,
};

export const osuCommandReply = [
  osuCommandReplyNp,
  osuCommandReplyNpNoMap,
  osuCommandReplyNpStreamCompanion,
  osuCommandReplyNpNoMapStreamCompanion,
  osuCommandReplyNpStreamCompanionNotRunning,
  osuCommandReplyRp,
  osuCommandReplyRpNotFound,
  osuCommandReplyPp,
  osuScoreNoBeatmap,
  osuScoreNotFound,
  osuScore,
];
