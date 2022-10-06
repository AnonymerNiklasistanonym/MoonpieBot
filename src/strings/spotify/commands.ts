// Local imports
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../messageParser/plugins/general";
import { createMessageParserMessage } from "../../messageParser/createMessageParserMessage";
import { generalCommandsNone } from "../general";
import { macroCommandEnabled } from "../../messageParser/macros/commands";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
import { SPOTIFY_STRING_ID } from "../spotify";
// Type imports
import type { MessageForMessageElementPlugin } from "../../messageParser/createMessageParserMessage";
import type { StringEntry } from "../../strings";

const SPOTIFY_COMMANDS_STRING_ID = `${SPOTIFY_STRING_ID}_COMMANDS`;

export const spotifyCommandsSong: StringEntry = {
  default: createMessageParserMessage(
    ["!song [now playing and previously played song]"],
    true
  ),
  id: `${SPOTIFY_COMMANDS_STRING_ID}_SONG`,
};
export const spotifyCommandsPrefix: StringEntry = {
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
export const spotifyCommandsString: StringEntry = {
  default: createMessageParserMessage([
    {
      name: spotifyCommandsPrefix.id,
      type: "reference",
    },
    {
      args: {
        args: {
          args: [spotifyCommandsSong]
            .map(
              (a): MessageForMessageElementPlugin => ({
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
            .reduce<(MessageForMessageElementPlugin | string)[]>(
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

export const spotifyCommands: StringEntry[] = [
  spotifyCommandsSong,
  spotifyCommandsPrefix,
  spotifyCommandsString,
];
