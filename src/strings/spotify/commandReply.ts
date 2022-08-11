// Local imports
import {
  pluginIfFalse,
  pluginIfTrue,
} from "../../messageParser/plugins/general";
import {
  pluginSpotifyGenerator,
  SpotifySongMacro,
} from "../../messageParser/plugins/spotify";
import { createMessageForMessageParser } from "../../messageParser";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
import { SPOTIFY_STRING_ID } from "../spotify";

export const SPOTIFY_COMMAND_REPLY_STRING_ID = `${SPOTIFY_STRING_ID}_COMMAND_REPLY`;

export const spotifyCommandReplyRefSongNone = {
  default: createMessageForMessageParser(["Currently playing no song"], true),
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_REF_NO_SONG`,
};

export const spotifyCommandReplyRefSongCurrent = {
  default: createMessageForMessageParser(
    [
      "Currently playing '",
      {
        key: SpotifySongMacro.CURRENT_TITLE,
        name: pluginSpotifyGenerator.id,
        type: "macro",
      },
      "' by '",
      {
        key: SpotifySongMacro.CURRENT_ARTISTS,
        name: pluginSpotifyGenerator.id,
        type: "macro",
      },
      "'",
      {
        args: {
          key: SpotifySongMacro.CURRENT_IS_SINGLE,
          name: pluginSpotifyGenerator.id,
          type: "macro",
        },
        name: pluginIfFalse.id,
        scope: [
          " from '",
          {
            key: SpotifySongMacro.CURRENT_ALBUM,
            name: pluginSpotifyGenerator.id,
            type: "macro",
          },
          "'",
        ],
        type: "plugin",
      },
    ],
    true
  ),
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_REF_CURRENT`,
};

export const spotifyCommandReplyRefSongPrevious = {
  default: createMessageForMessageParser(
    [
      ", previously played '",
      {
        key: SpotifySongMacro.PREVIOUS_TITLE,
        name: pluginSpotifyGenerator.id,
        type: "macro",
      },
      "' by '",
      {
        key: SpotifySongMacro.PREVIOUS_ARTISTS,
        name: pluginSpotifyGenerator.id,
        type: "macro",
      },
      "'",
      {
        args: {
          key: SpotifySongMacro.PREVIOUS_IS_SINGLE,
          name: pluginSpotifyGenerator.id,
          type: "macro",
        },
        name: pluginIfFalse.id,
        scope: [
          " from '",
          {
            key: SpotifySongMacro.PREVIOUS_ALBUM,
            name: pluginSpotifyGenerator.id,
            type: "macro",
          },
          "'",
        ],
        type: "plugin",
      },
    ],
    true
  ),
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_REF_PREVIOUS`,
};

export const spotifyCommandReplySong = {
  default: createMessageForMessageParser([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    {
      name: pluginSpotifyGenerator.id,
      scope: [
        {
          args: {
            key: SpotifySongMacro.HAS_CURRENT,
            name: pluginSpotifyGenerator.id,
            type: "macro",
          },
          name: pluginIfTrue.id,
          scope: {
            name: spotifyCommandReplyRefSongCurrent.id,
            type: "reference",
          },
          type: "plugin",
        },
        {
          args: {
            key: SpotifySongMacro.HAS_CURRENT,
            name: pluginSpotifyGenerator.id,
            type: "macro",
          },
          name: pluginIfFalse.id,
          scope: { name: spotifyCommandReplyRefSongNone.id, type: "reference" },
          type: "plugin",
        },
        {
          args: {
            key: SpotifySongMacro.HAS_PREVIOUS,
            name: pluginSpotifyGenerator.id,
            type: "macro",
          },
          name: pluginIfTrue.id,
          scope: {
            name: spotifyCommandReplyRefSongPrevious.id,
            type: "reference",
          },
          type: "plugin",
        },
      ],
      type: "plugin",
    },
  ]),
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG`,
};

export const spotifyCommandReply = [
  spotifyCommandReplySong,
  spotifyCommandReplyRefSongNone,
  spotifyCommandReplyRefSongCurrent,
  spotifyCommandReplyRefSongPrevious,
];
