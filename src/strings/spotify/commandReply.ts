import { SPOTIFY_STRING_ID } from "../spotify";

export const SPOTIFY_COMMAND_REPLY_STRING_ID = `${SPOTIFY_STRING_ID}_COMMAND_REPLY`;

export const spotifyCommandReplyRefSongNone = {
  id: `REF_${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_NO_SONG`,
  default: "Currently playing no song",
};

export const spotifyCommandReplyRefSongCurrent = {
  id: `REF_${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_CURRENT`,
  default:
    "Currently playing '%SPOTIFY_SONG:CURRENT_TITLE%' by '%SPOTIFY_SONG:CURRENT_ARTISTS%'$(SHOW_IF_FALSE=%SPOTIFY_SONG:CURRENT_IS_SINGLE%| from '%SPOTIFY_SONG:CURRENT_ALBUM%')",
};

export const spotifyCommandReplyRefSongPrevious = {
  id: `REF_${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_PREVIOUS`,
  default:
    ", previously played '%SPOTIFY_SONG:PREVIOUS_TITLE%' by '%SPOTIFY_SONG:PREVIOUS_ARTISTS%'$(SHOW_IF_FALSE=%SPOTIFY_SONG:PREVIOUS_IS_SINGLE%| from '%SPOTIFY_SONG:PREVIOUS_ALBUM%')",
};

export const spotifyCommandReplySong = {
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG`,
  default: `@$(USER) $(SPOTIFY_SONG|$(SHOW_IF_TRUE=%SPOTIFY_SONG:HAS_CURRENT%|$[${spotifyCommandReplyRefSongCurrent.id}])$(SHOW_IF_FALSE=%SPOTIFY_SONG:HAS_CURRENT%|$[${spotifyCommandReplyRefSongNone.id}])$(SHOW_IF_TRUE=%SPOTIFY_SONG:HAS_PREVIOUS%|$[${spotifyCommandReplyRefSongPrevious.id}]))`,
};

export const spotifyCommandReply: Iterable<readonly [string, string]> = [
  [spotifyCommandReplySong.id, spotifyCommandReplySong.default],
  [spotifyCommandReplyRefSongNone.id, spotifyCommandReplyRefSongNone.default],
  [
    spotifyCommandReplyRefSongCurrent.id,
    spotifyCommandReplyRefSongCurrent.default,
  ],
  [
    spotifyCommandReplyRefSongPrevious.id,
    spotifyCommandReplyRefSongPrevious.default,
  ],
];
