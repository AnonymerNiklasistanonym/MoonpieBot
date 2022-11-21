// Local imports
import {
  getChatCommandsSpotify,
  SpotifyCommands,
} from "../../../info/chatCommands";
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../plugins/general";
import { createMessageParserMessage } from "../../../messageParser";
import { createShortCommandDescription } from "../../../chatCommand";
import { generalCommandsNone } from "../general";
import { macroCommandEnabled } from "../../macros/commands";
import { PluginTwitchChat } from "../../plugins/twitchChat";
import { SPOTIFY_STRING_ID } from "../spotify";
// Type imports
import type { MessageForParserMessagePlugin } from "../../../messageParser";
import type { StringEntry } from "../../../messageParser";

const SPOTIFY_COMMANDS_STRING_ID = `${SPOTIFY_STRING_ID}_COMMANDS`;

export const spotifyCommandsSong: Readonly<StringEntry> = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        SpotifyCommands.SONG,
        getChatCommandsSpotify
      ),
    ],
    true
  ),
  id: `${SPOTIFY_COMMANDS_STRING_ID}_SONG`,
};
export const spotifyCommandsPrefix: Readonly<StringEntry> = {
  default: createMessageParserMessage(
    [
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The following Spotify commands are supported: ",
    ],
    true
  ),
  id: `${SPOTIFY_COMMANDS_STRING_ID}_PREFIX`,
};
export const spotifyCommandsString: Readonly<StringEntry> = {
  default: createMessageParserMessage([
    {
      name: spotifyCommandsPrefix.id,
      type: "reference",
    },
    {
      args: {
        args: {
          args: [spotifyCommandsSong]
            .sort()
            .map(
              (a): MessageForParserMessagePlugin => ({
                args: {
                  key: a.id,
                  name: macroCommandEnabled.id,
                  type: "macro",
                },
                name: pluginIfTrue.id,
                scope: {
                  name: a.id,
                  type: "reference",
                },
                type: "plugin",
              })
            )
            .reduce<(MessageForParserMessagePlugin | string)[]>(
              (prev, curr) => prev.concat([curr, ";"]),
              []
            ),
          name: pluginListFilterUndefined.id,
          scope: {
            name: generalCommandsNone.id,
            type: "reference",
          },
          type: "plugin",
        },
        name: pluginListSort.id,
        type: "plugin",
      },
      name: pluginListJoinCommaSpace.id,
      type: "plugin",
    },
  ]),
  id: `${SPOTIFY_COMMANDS_STRING_ID}_STRING`,
};

export const spotifyCommands: Readonly<StringEntry[]> = [
  spotifyCommandsSong,
  spotifyCommandsPrefix,
  spotifyCommandsString,
];
