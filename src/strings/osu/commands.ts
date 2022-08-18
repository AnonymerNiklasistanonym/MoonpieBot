// Local imports
import { createMessageForMessageParser } from "../../messageParser";
import { OSU_STRING_ID } from "../osu";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../strings";

const OSU_COMMANDS_STRING_ID = `${OSU_STRING_ID}_COMMANDS`;

export const osuCommandsCommands: StringEntry = {
  default: createMessageForMessageParser(["!osu commands"], true),
  id: `${OSU_COMMANDS_STRING_ID}_COMMANDS`,
};
export const osuCommandsNp: StringEntry = {
  default: createMessageForMessageParser(["!np [now playing]"], true),
  id: `${OSU_COMMANDS_STRING_ID}_NP`,
};
export const osuCommandsNpStreamCompanionWebsocket: StringEntry = {
  default: createMessageForMessageParser(
    ["!np [now playing using StreamCompanion (websockets)]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_NP_STREAM_COMPANION_WEBSOCKET`,
};
export const osuCommandsNpStreamCompanionFile: StringEntry = {
  default: createMessageForMessageParser(
    ["!np [now playing StreamCompanion (files)]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_NP_STREAM_COMPANION_FILES`,
};
export const osuCommandsPp: StringEntry = {
  default: createMessageForMessageParser(
    ["!pp ($USER_ID/$USER_NAME) [osu! information about streamer or user]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_PP`,
};
export const osuCommandsRequests: StringEntry = {
  default: createMessageForMessageParser(
    [
      "!osuRequests (on/off ($REASON)) [get if requests are currently open or toggle them]",
    ],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_REQUESTS`,
};
export const osuCommandsRp: StringEntry = {
  default: createMessageForMessageParser(
    ["!rp ($USER_ID/$USER_NAME) [recent play]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_RP`,
};
export const osuCommandsScore: StringEntry = {
  default: createMessageForMessageParser(
    [
      "!score $USER_ID/$USER_NAME [get score of a user on the most recent mentioned map]",
    ],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_SCORE`,
};
export const osuCommandsNone: StringEntry = {
  default: createMessageForMessageParser(["None"], true),
  id: `${OSU_COMMANDS_STRING_ID}_NONE`,
};
export const osuCommandsPrefix: StringEntry = {
  default: createMessageForMessageParser(
    [
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The following osu commands are supported: ",
    ],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_PREFIX`,
};

export const osuCommands: StringEntry[] = [
  osuCommandsCommands,
  osuCommandsNp,
  osuCommandsNpStreamCompanionWebsocket,
  osuCommandsNpStreamCompanionFile,
  osuCommandsPp,
  osuCommandsRequests,
  osuCommandsRp,
  osuCommandsScore,
  osuCommandsNone,
  osuCommandsPrefix,
];
