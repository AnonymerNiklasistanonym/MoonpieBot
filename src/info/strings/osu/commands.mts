// Relative imports
import {
  getChatCommandsOsu,
  OsuCommands,
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
import { OSU_STRING_ID } from "../osu.mjs";
import { PluginTwitchChat } from "../../plugins/twitchChat.mjs";
// Type imports
import type { MessageForParserMessagePlugin } from "../../../messageParser.mjs";
import type { StringEntry } from "../../../messageParser.mjs";

const OSU_COMMANDS_STRING_ID = `${OSU_STRING_ID}_COMMANDS`;

export const osuCommandsLastRequest: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        OsuCommands.LAST_REQUEST,
        getChatCommandsOsu,
      ),
    ],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_LAST_REQUEST`,
};
export const osuCommandsPermitRequest: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(
        OsuCommands.PERMIT_REQUEST,
        getChatCommandsOsu,
      ),
    ],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_PERMIT_REQUEST`,
};
export const osuCommandsNp: StringEntry = {
  default: createMessageParserMessage(
    [createShortCommandDescription(OsuCommands.NP, getChatCommandsOsu)],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_NP`,
};
export const osuCommandsNpStreamCompanionWebsocket: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(OsuCommands.NP, getChatCommandsOsu) +
        " using StreamCompanion (websockets)",
    ],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_NP_STREAM_COMPANION_WEBSOCKET`,
};
export const osuCommandsNpStreamCompanionFile: StringEntry = {
  default: createMessageParserMessage(
    [
      createShortCommandDescription(OsuCommands.NP, getChatCommandsOsu) +
        " using StreamCompanion (files)",
    ],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_NP_STREAM_COMPANION_FILES`,
};
export const osuCommandsPp: StringEntry = {
  default: createMessageParserMessage(
    [createShortCommandDescription(OsuCommands.PP, getChatCommandsOsu)],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_PP`,
};
export const osuCommandsRequests: StringEntry = {
  default: createMessageParserMessage(
    [createShortCommandDescription(OsuCommands.REQUESTS, getChatCommandsOsu)],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_REQUESTS`,
};
export const osuCommandsRp: StringEntry = {
  default: createMessageParserMessage(
    [createShortCommandDescription(OsuCommands.RP, getChatCommandsOsu)],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_RP`,
};
export const osuCommandsScore: StringEntry = {
  default: createMessageParserMessage(
    [createShortCommandDescription(OsuCommands.SCORE, getChatCommandsOsu)],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_SCORE`,
};
export const osuCommandsPrefix: StringEntry = {
  default: createMessageParserMessage(
    [
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The following osu! commands are supported: ",
    ],
    true,
  ),
  id: `${OSU_COMMANDS_STRING_ID}_PREFIX`,
};
export const osuCommandsString: StringEntry = {
  default: createMessageParserMessage([
    {
      name: osuCommandsPrefix.id,
      type: "reference",
    },
    {
      args: {
        args: {
          args: [
            osuCommandsLastRequest,
            osuCommandsPermitRequest,
            osuCommandsNp,
            osuCommandsNpStreamCompanionWebsocket,
            osuCommandsNpStreamCompanionFile,
            osuCommandsPp,
            osuCommandsRequests,
            osuCommandsRp,
            osuCommandsScore,
          ]
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
              }),
            )
            .reduce<(MessageForParserMessagePlugin | string)[]>(
              (prev, curr) => prev.concat([curr, ";"]),
              [],
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
  id: `${OSU_COMMANDS_STRING_ID}_STRING`,
};

export const osuCommands: StringEntry[] = [
  osuCommandsLastRequest,
  osuCommandsPermitRequest,
  osuCommandsNp,
  osuCommandsNpStreamCompanionWebsocket,
  osuCommandsNpStreamCompanionFile,
  osuCommandsPp,
  osuCommandsRequests,
  osuCommandsRp,
  osuCommandsScore,
  osuCommandsPrefix,
  osuCommandsString,
];
