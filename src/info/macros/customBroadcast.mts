// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";

export interface MacroCustomBroadcastInfoData {
  cronString?: string;
  description?: string;
  id: string;
  message?: string;
}
export enum MacroCustomBroadcastInfo {
  CRON_STRING_OR_UNDEF = "CRON_STRING_OR_UNDEF",
  DESCRIPTION_OR_EMPTY = "DESCRIPTION_OR_EMPTY",
  ID = "ID",
  MESSAGE_OR_UNDEF = "MESSAGE_OR_UNDEF",
}

export const macroCustomBroadcastInfo = createMessageParserMacroGenerator<
  MacroCustomBroadcastInfo,
  MacroCustomBroadcastInfoData
>(
  {
    id: "CUSTOM_BROADCAST_INFO",
  },
  Object.values(MacroCustomBroadcastInfo),
  (macroId, data) => {
    switch (macroId) {
      case MacroCustomBroadcastInfo.CRON_STRING_OR_UNDEF:
        return data.cronString;
      case MacroCustomBroadcastInfo.DESCRIPTION_OR_EMPTY:
        return data.description ?? "";
      case MacroCustomBroadcastInfo.ID:
        return data.id;
      case MacroCustomBroadcastInfo.MESSAGE_OR_UNDEF:
        return data.message;
    }
  },
  {
    cronString: "*/15 * * * *",
    id: "ID",
    message: "MESSAGE",
  },
);
