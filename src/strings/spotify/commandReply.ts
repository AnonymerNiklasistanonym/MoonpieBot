// Local imports
import {
  pluginIfFalse,
  pluginIfTrue,
} from "../../messageParser/plugins/general";
import {
  pluginSpotifySongId,
  SpotifySongMacro,
} from "../../messageParser/plugins/spotify";
import { createMessageForMessageParser } from "../../messageParser";
import { PluginsTwitchChat } from "../../messageParser/plugins/twitchChat";
import { SPOTIFY_STRING_ID } from "../spotify";

export const SPOTIFY_COMMAND_REPLY_STRING_ID = `${SPOTIFY_STRING_ID}_COMMAND_REPLY`;

export const spotifyCommandReplyRefSongNone = {
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_REF_NO_SONG`,
  default: createMessageForMessageParser(["Currently playing no song"], true),
};

export const spotifyCommandReplyRefSongCurrent = {
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_REF_CURRENT`,
  default: createMessageForMessageParser(
    [
      "Currently playing '",
      {
        type: "macro",
        name: pluginSpotifySongId,
        key: SpotifySongMacro.CURRENT_TITLE,
      },
      "' by '",
      {
        type: "macro",
        name: pluginSpotifySongId,
        key: SpotifySongMacro.CURRENT_ARTISTS,
      },
      "'",
      {
        type: "plugin",
        name: pluginIfFalse.id,
        args: {
          type: "macro",
          name: pluginSpotifySongId,
          key: SpotifySongMacro.CURRENT_IS_SINGLE,
        },
        scope: [
          " from '",
          {
            type: "macro",
            name: pluginSpotifySongId,
            key: SpotifySongMacro.CURRENT_ALBUM,
          },
          "'",
        ],
      },
    ],
    true
  ),
};

export const spotifyCommandReplyRefSongPrevious = {
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_REF_PREVIOUS`,
  default: createMessageForMessageParser(
    [
      ", previously played '",
      {
        type: "macro",
        name: pluginSpotifySongId,
        key: SpotifySongMacro.PREVIOUS_TITLE,
      },
      "' by '",
      {
        type: "macro",
        name: pluginSpotifySongId,
        key: SpotifySongMacro.PREVIOUS_ARTISTS,
      },
      "'",
      {
        type: "plugin",
        name: pluginIfFalse.id,
        args: {
          type: "macro",
          name: pluginSpotifySongId,
          key: SpotifySongMacro.PREVIOUS_IS_SINGLE,
        },
        scope: [
          " from '",
          {
            type: "macro",
            name: pluginSpotifySongId,
            key: SpotifySongMacro.PREVIOUS_ALBUM,
          },
          "'",
        ],
      },
    ],
    true
  ),
};

export const spotifyCommandReplySong = {
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG`,
  default: createMessageForMessageParser([
    "@",
    { type: "plugin", name: PluginsTwitchChat.USER },
    " ",
    {
      type: "plugin",
      name: pluginSpotifySongId,
      scope: [
        {
          type: "plugin",
          name: pluginIfTrue.id,
          args: {
            type: "macro",
            name: pluginSpotifySongId,
            key: SpotifySongMacro.HAS_CURRENT,
          },
          scope: {
            type: "reference",
            name: spotifyCommandReplyRefSongCurrent.id,
          },
        },
        {
          type: "plugin",
          name: pluginIfFalse.id,
          args: {
            type: "macro",
            name: pluginSpotifySongId,
            key: SpotifySongMacro.HAS_CURRENT,
          },
          scope: { type: "reference", name: spotifyCommandReplyRefSongNone.id },
        },
        {
          type: "plugin",
          name: pluginIfTrue.id,
          args: {
            type: "macro",
            name: pluginSpotifySongId,
            key: SpotifySongMacro.HAS_PREVIOUS,
          },
          scope: {
            type: "reference",
            name: spotifyCommandReplyRefSongPrevious.id,
          },
        },
      ],
    },
  ]),
};

export const spotifyCommandReply = [
  spotifyCommandReplySong,
  spotifyCommandReplyRefSongNone,
  spotifyCommandReplyRefSongCurrent,
  spotifyCommandReplyRefSongPrevious,
];
