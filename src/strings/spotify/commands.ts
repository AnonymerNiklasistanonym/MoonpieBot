// Local imports
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

export const spotifyCommands: StringEntry[] = [
  spotifyCommandsCommands,
  spotifyCommandsSong,
  spotifyCommandsNone,
  spotifyCommandsPrefix,
];
