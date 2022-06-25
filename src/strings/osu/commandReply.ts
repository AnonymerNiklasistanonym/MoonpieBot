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
    "@$(USER) Currently playing '%OSU_STREAMCOMPANION:TITLE_ROMAN%' from '%OSU_STREAMCOMPANION:ARTIST_ROMAN%' [%OSU_STREAMCOMPANION:DIFF_NAME%]$(SHOW_IF_NOT_UNDEFINED=%OSU_STREAMCOMPANION:MODS%|$(SHOW_IF_STRINGS_NOT_THE_SAME=%OSU_STREAMCOMPANION:MODS%===None| using %OSU_STREAMCOMPANION:MODS%)) - CS %OSU_STREAMCOMPANION:CS%, AR %OSU_STREAMCOMPANION:AR%, OD %OSU_STREAMCOMPANION:OD%, HP %OSU_STREAMCOMPANION:HP%, BPM %OSU_STREAMCOMPANION:BPM%, %OSU_STREAMCOMPANION:MAX_COMBO%x, %OSU_STREAMCOMPANION:STARS%* ($(SHOW_IF_NUMBER_GREATER_THAN=%OSU_STREAMCOMPANION:ID%>0|https://osu.ppy.sh/beatmaps/%OSU_STREAMCOMPANION:ID% - )$(SHOW_IF_NUMBER_NOT_GREATER_THAN=%OSU_STREAMCOMPANION:ID%>0|$(SHOW_IF_NUMBER_GREATER_THAN=%OSU_STREAMCOMPANION:SET_ID%>0|https://osu.ppy.sh/beatmapsets/%OSU_STREAMCOMPANION:SET_ID% - ))StreamCompanion)",
};

export const osuCommandReplyNpNoMap = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP`,
  default: "$(USER) No map is currently being played",
};

export const osuCommandReplyNpNoMapStreamCompanion = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_NO_MAP_STREAMCOMPANION`,
  default:
    "$(USER) No map is currently being played (Please wait until a map change happens since StreamCompanion was found running but it hasn't yet detected an osu! map!)",
};

export const osuCommandReplyNpStreamCompanionNotRunning = {
  id: `${OSU_COMMAND_REPLY_STRING_ID}_NP_STREAMCOMPANION_NOT_RUNNING`,
  default:
    "$(USER) No map is currently being played (StreamCompanion was configured but not found running!)",
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
];
