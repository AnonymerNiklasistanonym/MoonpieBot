// Package imports
import { promises as fs } from "fs";
// Local imports
import { convertTwitchBadgeLevelToString, TwitchBadgeLevel } from "../twitch";
import {
  FileDocumentationPartType,
  generateFileDocumentation,
} from "../other/splitTextAtLength";
import { customBroadcastsInformation } from "../info/customBroadcasts";
import { customCommandsInformation } from "../info/customCommands";
import { escapeStringIfWhiteSpace } from "../other/whiteSpaceChecker";
// Type imports
import type { CustomBroadcast } from "../customCommandsBroadcasts/customBroadcast";
import type { CustomCommand } from "../customCommandsBroadcasts/customCommand";
import type { FileDocumentationParts } from "../other/splitTextAtLength";

const addCustomCommandStringBuilder = (
  customCommand: Pick<CustomCommand, "id" | "regex" | "message"> &
    Partial<CustomCommand>
): string =>
  `!addcc ${escapeStringIfWhiteSpace(
    customCommand.id,
    "'"
  )} ${escapeStringIfWhiteSpace(
    customCommand.regex,
    "'"
  )} ${escapeStringIfWhiteSpace(customCommand.message, "'")}${
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
  customBroadcast: Pick<CustomBroadcast, "id" | "cronString" | "message"> &
    Partial<CustomBroadcast>
): string =>
  `!addcb ${escapeStringIfWhiteSpace(
    customBroadcast.id,
    "'"
  )} ${escapeStringIfWhiteSpace(
    customBroadcast.cronString,
    "'"
  )} ${escapeStringIfWhiteSpace(customBroadcast.message, "'")}`;

export const createCustomCommandsBroadcastsDocumentation = async (
  path: string
): Promise<void> => {
  const data: FileDocumentationParts[] = [];
  data.push({
    content:
      "This program has per default the ability to add/edit/delete custom commands and broadcasts if you are at least a moderator in the chat. " +
      "The commands and broadcasts are persistently saved in a database.",
    type: FileDocumentationPartType.TEXT,
  });
  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    description:
      "Add a custom command with an ID, a RegEx expression to detect it and capture contents of the match (https://regex101.com/) and a message",
    isComment: false,
    prefix: ">",
    type: FileDocumentationPartType.VALUE,
    value: addCustomCommandStringBuilder({
      id: "ID",
      message: "MESSAGE",
      regex: "REGEX",
    }),
  });
  data.push({
    description: `Optionally a cooldown (in s) and user level (${Object.values(
      TwitchBadgeLevel
    )
      .filter((a) => typeof a === "number")
      .map<string>((a) =>
        convertTwitchBadgeLevelToString(a as TwitchBadgeLevel)
      )
      .join(", ")}) are also supported`,
    isComment: false,
    prefix: ">",
    type: FileDocumentationPartType.VALUE,
    value: addCustomCommandStringBuilder({
      cooldownInS: 10,
      id: "ID",
      message: "MESSAGE",
      regex: "REGEX",
      userLevel: TwitchBadgeLevel.MODERATOR,
    }),
  });
  data.push({
    description:
      "A single property can be edited of an existing custom command",
    isComment: false,
    prefix: ">",
    type: FileDocumentationPartType.VALUE,
    value: "!editcc PROPERTY NEW_VALUE",
  });
  data.push({
    description: "And using the custom command ID it can be deleted",
    isComment: false,
    prefix: ">",
    type: FileDocumentationPartType.VALUE,
    value: "!delcc ID",
  });

  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    description:
      "Add a custom broadcast with an ID, a cron expression to determine when the broadcast should be sent (https://crontab.cronhub.io/) and a message",
    isComment: false,
    prefix: ">",
    type: FileDocumentationPartType.VALUE,
    value: addCustomBroadcastStringBuilder({
      cronString: "CRON_STRING",
      id: "ID",
      message: "MESSAGE",
    }),
  });
  data.push({
    description:
      "A single property can be edited of an existing custom broadcast",
    isComment: false,
    prefix: ">",
    type: FileDocumentationPartType.VALUE,
    value: "!editcb PROPERTY NEW_VALUE",
  });
  data.push({
    description: "And using the custom broadcast ID it can be deleted",
    isComment: false,
    prefix: ">",
    type: FileDocumentationPartType.VALUE,
    value: "!delcb ID",
  });

  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    content: "Custom command examples:",
    type: FileDocumentationPartType.TEXT,
  });
  for (const customCommand of customCommandsInformation) {
    data.push({
      description: customCommand.description,
      isComment: false,
      prefix: ">",
      type: FileDocumentationPartType.VALUE,
      value: addCustomCommandStringBuilder(customCommand),
    });
  }

  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    content: "Custom broadcast examples:",
    type: FileDocumentationPartType.TEXT,
  });
  for (const customBroadcast of customBroadcastsInformation) {
    data.push({
      description: customBroadcast.description,
      isComment: false,
      prefix: ">",
      type: FileDocumentationPartType.VALUE,
      value: addCustomBroadcastStringBuilder(customBroadcast),
    });
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, generateFileDocumentation(data));
};
