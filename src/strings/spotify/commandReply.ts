// Local imports
import {
  pluginIfFalse,
  pluginIfTrue,
} from "../../messageParser/plugins/general";
import { createMessageParserMessage } from "../../messageParser/createMessageParserMessage";
import { macroSpotifySong } from "../../messageParser/macros/spotify";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
import { SPOTIFY_STRING_ID } from "../spotify";
import { SpotifySongMacro } from "../../messageParser/macros/spotify";
// Type imports
import type { StringEntry } from "../../strings";

const SPOTIFY_COMMAND_REPLY_STRING_ID = `${SPOTIFY_STRING_ID}_COMMAND_REPLY`;

const spotifyCommandReplyRefSongNone: StringEntry = {
  default: createMessageParserMessage(["Currently playing no song"], true),
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG_REF_NO_SONG`,
};

const spotifyCommandReplyRefSongCurrent: StringEntry = {
  default: createMessageParserMessage(
    [
      "Currently playing '",
      {
        key: SpotifySongMacro.CURRENT_TITLE,
        name: macroSpotifySong.id,
        type: "macro",
      },
      "' by '",
      {
        key: SpotifySongMacro.CURRENT_ARTISTS,
        name: macroSpotifySong.id,
        type: "macro",
      },
      "'",
      {
        args: {
          key: SpotifySongMacro.CURRENT_IS_SINGLE,
          name: macroSpotifySong.id,
          type: "macro",
        },
        name: pluginIfFalse.id,
        scope: [
          " from '",
          {
            key: SpotifySongMacro.CURRENT_ALBUM,
            name: macroSpotifySong.id,
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

const spotifyCommandReplyRefSongPrevious: StringEntry = {
  default: createMessageParserMessage(
    [
      ", previously played '",
      {
        key: SpotifySongMacro.PREVIOUS_TITLE,
        name: macroSpotifySong.id,
        type: "macro",
      },
      "' by '",
      {
        key: SpotifySongMacro.PREVIOUS_ARTISTS,
        name: macroSpotifySong.id,
        type: "macro",
      },
      "'",
      {
        args: {
          key: SpotifySongMacro.PREVIOUS_IS_SINGLE,
          name: macroSpotifySong.id,
          type: "macro",
        },
        name: pluginIfFalse.id,
        scope: [
          " from '",
          {
            key: SpotifySongMacro.PREVIOUS_ALBUM,
            name: macroSpotifySong.id,
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

export const spotifyCommandReplySong: StringEntry = {
  default: createMessageParserMessage([
    "@",
    { name: PluginTwitchChat.USER, type: "plugin" },
    " ",
    {
      args: {
        key: SpotifySongMacro.HAS_CURRENT,
        name: macroSpotifySong.id,
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
        name: macroSpotifySong.id,
        type: "macro",
      },
      name: pluginIfFalse.id,
      scope: { name: spotifyCommandReplyRefSongNone.id, type: "reference" },
      type: "plugin",
    },
    {
      args: {
        key: SpotifySongMacro.HAS_PREVIOUS,
        name: macroSpotifySong.id,
        type: "macro",
      },
      name: pluginIfTrue.id,
      scope: {
        name: spotifyCommandReplyRefSongPrevious.id,
        type: "reference",
      },
      type: "plugin",
    },
  ]),
  id: `${SPOTIFY_COMMAND_REPLY_STRING_ID}_SONG`,
};

export const spotifyCommandReply: StringEntry[] = [
  spotifyCommandReplySong,
  spotifyCommandReplyRefSongNone,
  spotifyCommandReplyRefSongCurrent,
  spotifyCommandReplyRefSongPrevious,
];
