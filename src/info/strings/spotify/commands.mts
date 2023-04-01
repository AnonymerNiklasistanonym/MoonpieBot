// Relative imports
import {
  getChatCommandsSpotify,
  SpotifyCommands,
} from "../../../info/chatCommands.mjs";
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../plugins/general.mjs";
import { createMessageParserMessage } from "../../../messageParser.mjs";
import { createShortCommandDescription } from "../../../chatCommand.mjs";
import { generalCommandsNone } from "../general.mjs";
import { macroCommandEnabled } from "../../macros/commands.mjs";
import { PluginTwitchChat } from "../../plugins/twitchChat.mjs";
import { SPOTIFY_STRING_ID } from "../spotify.mjs";
// Type imports
import type { MessageForParserMessagePlugin } from "../../../messageParser.mjs";
import type { StringEntry } from "../../../messageParser.mjs";

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
