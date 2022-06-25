import { OSU_STRING_ID } from "../osu";

export const OSU_COMMAND_REPLY_STRING_ID = `${OSU_STRING_ID}_COMMAND_REPLY`;

export const osuCommandReplyNp = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP`,
  default:
    "@$(USER) Currently playing '%OSU_WINDOW_TITLE:TITLE%' from '%OSU_WINDOW_TITLE:ARTIST%' [%OSU_WINDOW_TITLE:VERSION%]$(SHOW_IF_NOT_UNDEFINED=%OSU_WINDOW_TITLE:MAP_ID_VIA_API%| \\(https://osu.ppy.sh/beatmaps/%OSU_WINDOW_TITLE:MAP_ID_VIA_API%\\))",
};

export const osuCommandReplyNpStreamCompanion = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION`,
  default:
    "@$(USER) Currently playing $(OSU_STREAMCOMPANION|'%OSU_STREAMCOMPANION:TITLE_ROMAN%' from '%OSU_STREAMCOMPANION:ARTIST_ROMAN%' [%OSU_STREAMCOMPANION:VERSION%]$(SHOW_IF_NOT_UNDEFINED=%OSU_STREAMCOMPANION:MODS%|$(SHOW_IF_STRINGS_NOT_THE_SAME=%OSU_STREAMCOMPANION:MODS%!==None| using %OSU_STREAMCOMPANION:MODS%)) - CS %OSU_STREAMCOMPANION:CS%, AR %OSU_STREAMCOMPANION:AR%, OD %OSU_STREAMCOMPANION:OD%, HP %OSU_STREAMCOMPANION:HP%, BPM %OSU_STREAMCOMPANION:BPM%, %OSU_STREAMCOMPANION:MAX_COMBO%x, %OSU_STREAMCOMPANION:DIFFICULTY_RATING%* ($(SHOW_IF_NUMBER_GREATER_THAN=%OSU_STREAMCOMPANION:ID%>0|https://osu.ppy.sh/beatmaps/%OSU_STREAMCOMPANION:ID% - )$(SHOW_IF_NUMBER_NOT_GREATER_THAN=%OSU_STREAMCOMPANION:ID%>0|$(SHOW_IF_NUMBER_GREATER_THAN=%OSU_STREAMCOMPANION:SET_ID%>0|https://osu.ppy.sh/beatmapsets/%OSU_STREAMCOMPANION:SET_ID% - ))StreamCompanion))",
};

export const osuCommandReplyNpNoMap = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP`,
  default: "@$(USER) No map is currently being played",
};

export const osuCommandReplyNpNoMapStreamCompanion = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP_STREAMCOMPANION`,
  default:
    "$(USER) No map is currently being played (This is either a custom map or you need to wait until a map change happens since StreamCompanion was found running but it hasn't yet detected an osu! map!)",
};

export const osuCommandReplyNpStreamCompanionNotRunning = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_NOT_RUNNING`,
  default:
    "$(USER) No map is currently being played (StreamCompanion was configured but not found running!)",
};

export const osuCommandReplyRp = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP`,
  default:
    "@$(USER) $(OSU_MOST_RECENT_PLAY=%OSU_RP_REQUEST:ID%|" +
    "$(SHOW_IF_STRINGS_THE_SAME=%OSU_MOST_RECENT_PLAY:FOUND%===true|" +
    "Most recent play of %OSU_MOST_RECENT_PLAY:USER_NAME%: $(SHOW_IF_STRINGS_THE_SAME=%OSU_MOST_RECENT_PLAY:PASSED%===true|%OSU_MOST_RECENT_PLAY:RANK%)$(SHOW_IF_STRINGS_THE_SAME=%OSU_MOST_RECENT_PLAY:PASSED%===false|A fail)" +
    "$(SHOW_IF_NOT_EMPTY=%OSU_MOST_RECENT_PLAY:MODS%| using %OSU_MOST_RECENT_PLAY:MODS%)$(SHOW_IF_NOT_UNDEFINED=%OSU_MOST_RECENT_PLAY:PP%| with %OSU_MOST_RECENT_PLAY:PP%pp) \\(%OSU_MOST_RECENT_PLAY:COUNT_300%/%OSU_MOST_RECENT_PLAY:COUNT_100%/%OSU_MOST_RECENT_PLAY:COUNT_50%/%OSU_MOST_RECENT_PLAY:COUNT_MISS%\\) [mc=%OSU_MOST_RECENT_PLAY:MAX_COMBO%, acc=%OSU_MOST_RECENT_PLAY:ACC%%]" +
    " on $(OSU_BEATMAP=%OSU_MOST_RECENT_PLAY:MAP_ID%|%OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%' [%OSU_BEATMAP:DIFFICULTY_RATING%* $(TIME_IN_S_TO_STOPWATCH_STRING=%OSU_BEATMAP:LENGTH_IN_S%) %OSU_BEATMAP:RANKED_STATUS%] from %OSU_BEATMAP:LAST_UPDATED_MONTH% %OSU_BEATMAP:LAST_UPDATED_YEAR% {FC=%OSU_BEATMAP:MAX_COMBO%, CS=%OSU_BEATMAP:CS%, DRAIN=%OSU_BEATMAP:DRAIN%, ACC=%OSU_BEATMAP:ACC%, AR=%OSU_BEATMAP:AR%, BPM=%OSU_BEATMAP:BPM%, CC=%OSU_BEATMAP:CC%, SLC=%OSU_BEATMAP:SLC%, SPC=%OSU_BEATMAP:SPC%})" +
    "$(SHOW_IF_STRINGS_THE_SAME=%OSU_MOST_RECENT_PLAY:HAS_REPLAY%===true| {replay available})" +
    ")" +
    "$(SHOW_IF_STRINGS_THE_SAME=%OSU_MOST_RECENT_PLAY:FOUND%===false|" +
    "No recent play was found))",
};
export const osuCommandReplyRpNotFound = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_RP_NOT_FOUND`,
  default: "$(USER) No recent play was found",
};

export const osuCommandReply: Iterable<readonly [string, string]> = [
  [osuCommandReplyNp.id, osuCommandReplyNp.default],
  [osuCommandReplyNpNoMap.id, osuCommandReplyNpNoMap.default],
  [
    osuCommandReplyNpStreamCompanion.id,
    osuCommandReplyNpStreamCompanion.default,
  ],
  [
    osuCommandReplyNpNoMapStreamCompanion.id,
    osuCommandReplyNpNoMapStreamCompanion.default,
  ],
  [
    osuCommandReplyNpStreamCompanionNotRunning.id,
    osuCommandReplyNpStreamCompanionNotRunning.default,
  ],
  [osuCommandReplyRp.id, osuCommandReplyRp.default],
  [osuCommandReplyRpNotFound.id, osuCommandReplyRpNotFound.default],
];
