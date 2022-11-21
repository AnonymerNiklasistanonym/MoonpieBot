// Local imports
import { convertRegexToHumanString } from "./other/regexToString";

export interface ChatCommand<COMMAND_ENUM extends string = string> {
  command: RegExp | string;
  description: string;
  descriptionShort?: string;
  id: COMMAND_ENUM;
  permission: string;
}

export type GetChatCommand<COMMAND_ENUM extends string = string> = (
  id: COMMAND_ENUM
) => Readonly<ChatCommand<COMMAND_ENUM>[]>;

export const createShortCommandDescription = <
  COMMAND_ENUM extends string = string
>(
  id: COMMAND_ENUM,
  getChatCommands: (id: COMMAND_ENUM) => readonly ChatCommand<COMMAND_ENUM>[]
): string => {
  const info = getChatCommands(id);
  if (info.length === 0) {
    throw Error(`No info found for id '${id}'`);
  }
  return info
    .map(
      (a) =>
        `'${
          typeof a.command === "string"
            ? a.command
            : convertRegexToHumanString(a.command)
        }'${a.permission !== "everyone" ? ` (${a.permission})` : ""} ${
          a.descriptionShort ? a.descriptionShort : a.description
        }`
    )
    .join(", ");
};
