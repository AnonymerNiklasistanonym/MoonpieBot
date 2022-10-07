// Local imports
import {
  pluginIfTrue,
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
} from "../../plugins/general";
import { createMessageParserMessage } from "../../../messageParser/createMessageParserMessage";
import { generalCommandsNone } from "../general";
import { macroCommandEnabled } from "../../macros/commands";
import { OSU_STRING_ID } from "../osu";
import { PluginTwitchChat } from "../../plugins/twitchChat";
// Type imports
import type { MessageForMessageElementPlugin } from "../../../messageParser/createMessageParserMessage";
import type { StringEntry } from "../../../strings";

const OSU_COMMANDS_STRING_ID = `${OSU_STRING_ID}_COMMANDS`;

export const osuCommandsLastRequest: StringEntry = {
  default: createMessageParserMessage(
    ["!osuLastRequest ($COUNT) [resend previous requests]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_LAST_REQUEST`,
};
export const osuCommandsPermitRequest: StringEntry = {
  default: createMessageParserMessage(
    ["!osuPermitRequest [send blocked requests]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_PERMIT_REQUEST`,
};
export const osuCommandsNp: StringEntry = {
  default: createMessageParserMessage(["!np [now playing]"], true),
  id: `${OSU_COMMANDS_STRING_ID}_NP`,
};
export const osuCommandsNpStreamCompanionWebsocket: StringEntry = {
  default: createMessageParserMessage(
    ["!np [now playing using StreamCompanion (websockets)]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_NP_STREAM_COMPANION_WEBSOCKET`,
};
export const osuCommandsNpStreamCompanionFile: StringEntry = {
  default: createMessageParserMessage(
    ["!np [now playing StreamCompanion (files)]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_NP_STREAM_COMPANION_FILES`,
};
export const osuCommandsPp: StringEntry = {
  default: createMessageParserMessage(
    ["!pp ($USER_ID/$USER_NAME) [osu! profile information]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_PP`,
};
export const osuCommandsRequests: StringEntry = {
  default: createMessageParserMessage(
    [
      "!osuRequests (on/off ($REASON)|set/unset $OPTION ($VALUE)) [get/set osu requests demands]",
    ],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_REQUESTS`,
};
export const osuCommandsRp: StringEntry = {
  default: createMessageParserMessage(
    ["!rp ($USER_ID/$USER_NAME) [recent play]"],
    true
  ),
  id: `${OSU_COMMANDS_STRING_ID}_RP`,
};
export const osuCommandsScore: StringEntry = {
  default: createMessageParserMessage(
    ["!score $USER_ID/$USER_NAME [get score on the last mentioned map]"],
    true
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
    true
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
