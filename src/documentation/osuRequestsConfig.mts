// Relative imports
import {
  fileDocumentationGenerator,
  FileDocumentationPartType,
} from "./fileDocumentationGenerator.mjs";
import {
  regexOsuChatHandlerCommandRequests,
  regexOsuChatHandlerCommandRequestsSet,
  regexOsuChatHandlerCommandRequestsUnset,
} from "../info/regex.mjs";
import { convertRegexToHumanString } from "../other/regexToString.mjs";
import { escapeWhitespaceChatCommandGroup } from "../other/whiteSpaceChecker.mjs";
import { OsuRequestsConfig } from "../info/databases/osuRequestsDb.mjs";
// Type imports
import type { FileDocumentationParts } from "./fileDocumentationGenerator.mjs";
import type { GetOsuRequestsConfigOut } from "../database/osuRequestsDb/requests/osuRequestsConfig.mjs";

const osuRequestsSetConfig = (
  customCommand: Readonly<GetOsuRequestsConfigOut>
): string =>
  `!osuRequests set ${customCommand.option} ${escapeWhitespaceChatCommandGroup(
    customCommand.optionValue
  )}`;

export const createOsuRequestsConfigDocumentation = (
  osuRequestsConfigList: Readonly<GetOsuRequestsConfigOut[]>
): string => {
  const data: FileDocumentationParts[] = [];
  data.push({
    text: "This program has per default the ability to set osu! request demands.",
    type: FileDocumentationPartType.TEXT,
  });
  data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  data.push({
    description: {
      prefix: ">",
      text: "Turn requests on/off",
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexOsuChatHandlerCommandRequests),
  });
  data.push({
    description: {
      prefix: ">",
      text: `A single option (${Object.values(OsuRequestsConfig).join(
        ", "
      )}) can be set`,
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexOsuChatHandlerCommandRequestsSet),
  });
  data.push({
    description: {
      prefix: ">",
      text: `A single option (${Object.values(OsuRequestsConfig).join(
        ", "
      )}) can be unset`,
    },
    isComment: false,
    type: FileDocumentationPartType.VALUE,
    value: convertRegexToHumanString(regexOsuChatHandlerCommandRequestsUnset),
  });

  if (osuRequestsConfigList.length > 0) {
    data.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
    data.push({
      text: "osu! requests config:",
      type: FileDocumentationPartType.TEXT,
    });
    for (const osuRequestsConfig of osuRequestsConfigList) {
      data.push({
        isComment: false,
        type: FileDocumentationPartType.VALUE,
        value: osuRequestsSetConfig(osuRequestsConfig),
      });
    }
  }

  return fileDocumentationGenerator(data);
};
