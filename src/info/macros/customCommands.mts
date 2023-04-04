// Relative imports
import { convertTwitchBadgeLevelToString } from "../../twitch.mjs";
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";
// Type imports
import type { TwitchBadgeLevel } from "../../twitch.mjs";

export interface MacroCustomCommandInfoData {
  cooldownInS?: number;
  description?: string;
  id: string;
  message?: string;
  regex?: string;
  userLevel?: TwitchBadgeLevel;
}
export enum MacroCustomCommandInfo {
  COOLDOWN_IN_S_OR_UNDEF = "COOLDOWN_IN_S_OR_UNDEF",
  DESCRIPTION_OR_EMPTY = "DESCRIPTION_OR_EMPTY",
  ID = "ID",
  MESSAGE_OR_UNDEF = "MESSAGE_OR_UNDEF",
  REGEX_OR_UNDEF = "REGEX_OR_UNDEF",
  USER_LEVEL_OR_UNDEF = "USER_LEVEL_OR_UNDEF",
}

export const macroCustomCommandInfo = createMessageParserMacroGenerator<
  MacroCustomCommandInfo,
  MacroCustomCommandInfoData
>(
  {
    id: "CUSTOM_COMMAND_INFO",
  },
  Object.values(MacroCustomCommandInfo),
  (macroId, data) => {
    switch (macroId) {
      case MacroCustomCommandInfo.COOLDOWN_IN_S_OR_UNDEF:
        return data.cooldownInS;
      case MacroCustomCommandInfo.ID:
        return data.id;
      case MacroCustomCommandInfo.DESCRIPTION_OR_EMPTY:
        return data.description ?? "";
      case MacroCustomCommandInfo.MESSAGE_OR_UNDEF:
        return data.message;
      case MacroCustomCommandInfo.REGEX_OR_UNDEF:
        return data.regex;
      case MacroCustomCommandInfo.USER_LEVEL_OR_UNDEF:
        if (data.userLevel) {
          return convertTwitchBadgeLevelToString(data.userLevel);
        }
    }
  },
  {
    id: "ID",
    message: "MESSAGE",
    regex: "REGEX",
  },
);

export interface MacroCustomCommandInfoEditData {
  option: string;
  optionValue: string;
}
export enum MacroCustomCommandBroadcastInfoEdit {
  OPTION = "OPTION",
  OPTION_VALUE = "OPTION_VALUE",
}
export const macroCustomCommandBroadcastInfoEdit =
  createMessageParserMacroGenerator<
    MacroCustomCommandBroadcastInfoEdit,
    MacroCustomCommandInfoEditData
  >(
    {
      id: "CUSTOM_COMMAND_BROADCAST_INFO_EDIT",
    },
    Object.values(MacroCustomCommandBroadcastInfoEdit),
    (macroId, data) => {
      switch (macroId) {
        case MacroCustomCommandBroadcastInfoEdit.OPTION:
          return data.option;
        case MacroCustomCommandBroadcastInfoEdit.OPTION_VALUE:
          return data.optionValue;
      }
    },
    {
      option: "ID",
      optionValue: "new ID",
    },
  );
