// Type imports
import { convertTwitchBadgeLevelToString } from "../../twitch";
import type { MessageParserMacroGenerator } from "../../messageParser";
// Type import
import type { TwitchBadgeLevel } from "../../twitch";

export interface MacroCustomCommandInfoData {
  cooldownInS?: number;
  id: string;
  message?: string;
  regex?: string;
  userLevel?: TwitchBadgeLevel;
}
export enum MacroCustomCommandInfo {
  COOLDOWN_IN_S = "COOLDOWN_IN_S",
  ID = "ID",
  MESSAGE = "MESSAGE",
  REGEX = "REGEX",
  USER_LEVEL = "USER_LEVEL",
}

export const macroCustomCommandInfo: MessageParserMacroGenerator<
  MacroCustomCommandInfoData,
  MacroCustomCommandInfo
> = {
  exampleData: {
    id: "ID",
    message: "MESSAGE",
    regex: "REGEX",
  },
  generate: (data) =>
    Object.values(MacroCustomCommandInfo).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroCustomCommandInfo.COOLDOWN_IN_S:
          macroValue = data.cooldownInS;
          break;
        case MacroCustomCommandInfo.ID:
          macroValue = data.id;
          break;
        case MacroCustomCommandInfo.MESSAGE:
          macroValue = data.message;
          break;
        case MacroCustomCommandInfo.REGEX:
          macroValue = data.regex;
          break;
        case MacroCustomCommandInfo.USER_LEVEL:
          if (data.userLevel) {
            macroValue = convertTwitchBadgeLevelToString(data.userLevel);
          }
          break;
      }
      if (macroValue === undefined) {
        macroValue = "undefined";
      }
      if (typeof macroValue === "number") {
        macroValue = `${macroValue}`;
      }
      return [macroId, macroValue];
    }),
  id: "CUSTOM_COMMAND_INFO",
  keys: Object.values(MacroCustomCommandInfo),
};