// Local imports
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../messageParser/plugins/general";
import { createMessageForMessageParser } from "../../messageParser";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
import { SPOTIFY_STRING_ID } from "../spotify";
// Type imports
import type { StringEntry } from "../../strings";

const SPOTIFY_COMMANDS_STRING_ID = `${SPOTIFY_STRING_ID}_COMMANDS`;

export const spotifyCommandsCommands: StringEntry = {
  default: createMessageForMessageParser(["!spotify commands"], true),
  id: `${SPOTIFY_COMMANDS_STRING_ID}_COMMANDS`,
};
export const spotifyCommandsSong: StringEntry = {
  default: createMessageForMessageParser(
    ["!song [now playing and previously played song]"],
    true
  ),
  id: `${SPOTIFY_COMMANDS_STRING_ID}_SONG`,
};
export const spotifyCommandsNone: StringEntry = {
  default: createMessageForMessageParser(["None"], true),
  id: `${SPOTIFY_COMMANDS_STRING_ID}_NONE`,
};
export const spotifyCommandsPrefix: StringEntry = {
  default: createMessageForMessageParser(
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
  default: createMessageForMessageParser([
    {
      name: spotifyCommandsPrefix.id,
      type: "reference",
    },
    {
      args: {
        args: {
          args: [spotifyCommandsCommands, spotifyCommandsSong]
            .map((a) => ({
              args: {
                key: a.id,
                name: "COMMAND_ENABLED",
                type: "macro",
              },
              name: pluginIfTrue.id,
              scope: {
                name: a.id,
                type: "reference",
              },
              type: "plugin",
            }))
            .join(";"),
          name: pluginListFilterUndefined.id,
          scope: {
            name: spotifyCommandsNone.id,
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
  spotifyCommandsCommands,
  spotifyCommandsSong,
  spotifyCommandsNone,
  spotifyCommandsPrefix,
  spotifyCommandsString,
];
