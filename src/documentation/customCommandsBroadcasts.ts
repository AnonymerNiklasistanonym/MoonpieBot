// Local imports
import { convertTwitchBadgeLevelToString, TwitchBadgeLevel } from "../twitch";
import {
  CustomBroadcastValueOptions,
  CustomCommandValueOptions,
} from "../commands/customCommandsBroadcasts/valueOptions";
import {
  fileDocumentationGenerator,
  FileDocumentationPartType,
} from "./fileDocumentationGenerator";
import {
  regexCustomBroadcastAdd,
  regexCustomBroadcastDelete,
  regexCustomBroadcastEdit,
  regexCustomCommandAdd,
  regexCustomCommandDelete,
  regexCustomCommandEdit,
} from "../info/regex";
import { convertRegexToHumanString } from "../other/regexToString";
import { customBroadcastsInformation } from "../info/customBroadcasts";
import { customCommandsInformation } from "../info/customCommands";
import { escapeWhitespaceChatCommandGroup } from "../other/whiteSpaceChecker";
// Type imports
import type { CustomBroadcast } from "../customCommandsBroadcasts/customBroadcast";
import type { CustomCommand } from "../customCommandsBroadcasts/customCommand";
import type { DeepReadonlyArray } from "../other/types";
import type { FileDocumentationParts } from "./fileDocumentationGenerator";

const addCustomCommandStringBuilder = (
  customCommand: Readonly<
    Pick<CustomCommand, "id" | "regex" | "message"> & Partial<CustomCommand>
  >
): string =>
  `!addcc ${escapeWhitespaceChatCommandGroup(
    customCommand.id
  )} ${escapeWhitespaceChatCommandGroup(
    customCommand.regex
  )} ${escapeWhitespaceChatCommandGroup(customCommand.message)}${
    customCommand.userLevel !== undefined &&
    customCommand.userLevel !== TwitchBadgeLevel.NONE
      ? ` -ul=${convertTwitchBadgeLevelToString(customCommand.userLevel)}`
      : ""
  }${
    customCommand.cooldownInS !== undefined && customCommand.cooldownInS > 0
      ? ` -cd=${customCommand.cooldownInS}`
      : ""
  }`;

const addCustomBroadcastStringBuilder = (
  customBroadcast: Readonly<
    Pick<CustomBroadcast, "id" | "cronString" | "message"> &
      Partial<CustomBroadcast>
  >
): string =>
  `!addcb ${escapeWhitespaceChatCommandGroup(
    customBroadcast.id
  )} ${escapeWhitespaceChatCommandGroup(
    customBroadcast.cronString
  )} ${escapeWhitespaceChatCommandGroup(customBroadcast.message)}`;

export const createCustomCommandsBroadcastsDocumentation = (
  customCommands: DeepReadonlyArray<CustomCommand> = customCommandsInformation,
  customBroadcasts: DeepReadonlyArray<CustomBroadcast> = customBroadcastsInformation,
  example = true
): string => {
  const data: FileDocumentationParts[] = [];
  data.push({
    text:
      "This program has per default the ability to add/edit/delete custom commands and broadcasts if you are at least a moderator in the chat. " +
      "The commands and broadcasts are persistently saved in a database.",
    type: FileDocumentationPartType.TEXT,
  });
  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    description: {
      prefix: ">",
      text:
        "Add a custom command with an ID, a RegEx expression to detect it and capture contents of the match (https://regex101.com/) and a message. " +
        `Optionally a cooldown (in s) and user level (${Object.values(
          TwitchBadgeLevel
        )
          .filter((a) => typeof a === "number")
          .map<string>((a) =>
            convertTwitchBadgeLevelToString(a as TwitchBadgeLevel)
          )
          .join(", ")}) are also supported`,
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexCustomCommandAdd),
  });
  data.push({
    description: {
      prefix: ">",
      text: `A single property (${Object.values(CustomCommandValueOptions).join(
        ", "
      )}) can be edited of an existing custom command`,
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexCustomCommandEdit),
  });
  data.push({
    description: {
      prefix: ">",
      text: "And using the custom command ID it can be deleted",
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexCustomCommandDelete),
  });

  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    description: {
      prefix: ">",
      text: "Add a custom broadcast with an ID, a cron expression to determine when the broadcast should be sent (https://crontab.cronhub.io/) and a message",
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexCustomBroadcastAdd),
  });
  data.push({
    description: {
      prefix: ">",
      text: `A single property (${Object.values(
        CustomBroadcastValueOptions
      ).join(", ")}) can be edited of an existing custom broadcast`,
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexCustomBroadcastEdit),
  });
  data.push({
    description: {
      prefix: ">",
      text: "And using the custom broadcast ID it can be deleted",
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexCustomBroadcastDelete),
  });

  if (customCommands.length > 0) {
    data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
    data.push({
      text: `Custom command${example ? " examples" : "s"}:`,
      type: FileDocumentationPartType.TEXT,
    });
    for (const customCommand of customCommands) {
      data.push({
        description:
          customCommand.description !== undefined
            ? {
                prefix: ">",
                text: customCommand.description,
              }
            : undefined,
        isComment: false,
        type: FileDocumentationPartType.VALUE,
        value: addCustomCommandStringBuilder(customCommand),
      });
    }
  }

  if (customBroadcasts.length > 0) {
    data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
    data.push({
      text: `Custom broadcast${example ? " examples" : "s"}:`,
      type: FileDocumentationPartType.TEXT,
    });
    for (const customBroadcast of customBroadcasts) {
      data.push({
        description:
          customBroadcast.description !== undefined
            ? {
                prefix: ">",
                text: customBroadcast.description,
              }
            : undefined,
        isComment: false,
        type: FileDocumentationPartType.VALUE,
        value: addCustomBroadcastStringBuilder(customBroadcast),
      });
    }
  }

  return fileDocumentationGenerator(data);
};
