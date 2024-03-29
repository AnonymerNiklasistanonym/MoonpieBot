// Type imports
import type { MessageParserMacroGenerator } from "../../messageParser";

export interface MacroCustomBroadcastInfoData {
  cronString?: string;
  description?: string;
  id: string;
  message?: string;
}
export enum MacroCustomBroadcastInfo {
  CRON_STRING = "CRON_STRING",
  /** Is an empty string if undefined. */
  DESCRIPTION = "DESCRIPTION",
  ID = "ID",
  MESSAGE = "MESSAGE",
}

export const macroCustomBroadcastInfo: MessageParserMacroGenerator<
  MacroCustomBroadcastInfoData,
  MacroCustomBroadcastInfo
> = {
  exampleData: {
    cronString: "*/15 * * * *",
    id: "ID",
    message: "MESSAGE",
  },
  generate: (data) =>
    Object.values(MacroCustomBroadcastInfo).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroCustomBroadcastInfo.CRON_STRING:
          macroValue = data.cronString;
          break;
        case MacroCustomBroadcastInfo.DESCRIPTION:
          macroValue = data.description !== undefined ? data.description : "";
          break;
        case MacroCustomBroadcastInfo.ID:
          macroValue = data.id;
          break;
        case MacroCustomBroadcastInfo.MESSAGE:
          macroValue = data.message;
          break;
      }
      if (macroValue === undefined) {
        macroValue = "undefined";
      }
      return [macroId, macroValue];
    }),
  id: "CUSTOM_BROADCAST_INFO",
  keys: Object.values(MacroCustomBroadcastInfo),
};
