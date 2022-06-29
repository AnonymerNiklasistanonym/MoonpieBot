import type { MacroDictionary } from "../messageParser";

export interface MessageParserMacro {
  description?: string;
  id: string;
  values: MacroDictionary;
}
