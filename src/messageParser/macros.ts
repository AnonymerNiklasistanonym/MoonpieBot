import { MacroDictionary } from "../messageParser";

export interface MessageParserMacro {
  name: string;
  values: MacroDictionary;
}
