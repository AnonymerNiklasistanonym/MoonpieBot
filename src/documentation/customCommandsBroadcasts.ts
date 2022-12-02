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
import { customBroadcastsInformation } from "../info/customBroadcasts";
import { customCommandsInformation } from "../info/customCommands";
import { escapeStringIfWhiteSpace } from "../other/whiteSpaceChecker";
// Type imports
import type { CustomBroadcast } from "../customCommandsBroadcasts/customBroadcast";
import type { CustomCommand } from "../customCommandsBroadcasts/customCommand";
import type { FileDocumentationParts } from "./fileDocumentationGenerator";

const addCustomCommandStringBuilder = (
  customCommand: Pick<CustomCommand, "id" | "regex" | "message"> &
    Partial<CustomCommand>
): string =>
  `!addcc ${escapeStringIfWhiteSpace(customCommand.id, {
    surroundCharacter: "'",
  })} ${escapeStringIfWhiteSpace(customCommand.regex, {
    surroundCharacter: "'",
  })} ${escapeStringIfWhiteSpace(customCommand.message, {
    surroundCharacter: "'",
  })}${
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
  `!addcb ${escapeStringIfWhiteSpace(customBroadcast.id, {
    surroundCharacter: "'",
  })} ${escapeStringIfWhiteSpace(customBroadcast.cronString, {
    surroundCharacter: "'",
  })} ${escapeStringIfWhiteSpace(customBroadcast.message, {
    surroundCharacter: "'",
  })}`;

export const createCustomCommandsBroadcastsDocumentation = (): string => {
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
      text: "Add a custom command with an ID, a RegEx expression to detect it and capture contents of the match (https://regex101.com/) and a message",
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: addCustomCommandStringBuilder({
      id: "ID",
      message: "MESSAGE",
      regex: "REGEX",
    }),
  });
  data.push({
    description: {
      prefix: ">",
      text: `Optionally a cooldown (in s) and user level (${Object.values(
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
    value: addCustomCommandStringBuilder({
      cooldownInS: 10,
      id: "ID",
      message: "MESSAGE",
      regex: "REGEX",
      userLevel: TwitchBadgeLevel.MODERATOR,
    }),
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
    value: "!editcc PROPERTY NEW_VALUE",
  });
  data.push({
    description: {
      prefix: ">",
      text: "And using the custom command ID it can be deleted",
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: "!delcc ID",
  });

  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    description: {
      prefix: ">",
      text: "Add a custom broadcast with an ID, a cron expression to determine when the broadcast should be sent (https://crontab.cronhub.io/) and a message",
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: addCustomBroadcastStringBuilder({
      cronString: "CRON_STRING",
      id: "ID",
      message: "MESSAGE",
    }),
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
    value: "!editcb PROPERTY NEW_VALUE",
  });
  data.push({
    description: {
      prefix: ">",
      text: "And using the custom broadcast ID it can be deleted",
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: "!delcb ID",
  });

  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    text: "Custom command examples:",
    type: FileDocumentationPartType.TEXT,
  });
  for (const customCommand of customCommandsInformation) {
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

  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    text: "Custom broadcast examples:",
    type: FileDocumentationPartType.TEXT,
  });
  for (const customBroadcast of customBroadcastsInformation) {
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

  return fileDocumentationGenerator(data);
};
