// Type imports
import type { EMPTY_OBJECT } from "../other/types";

// A macro is a simple text replace dictionary
export type MacroDictionaryEntry<KEY = string> = [KEY, string];
export type MacroDictionary = Map<string, string>;
export type MacroMap = Map<string, MacroDictionary>;

// TODO Move to a better position
export interface RequestHelp {
  macros?: boolean;
  plugins?: boolean;
  type: "help";
}
// TODO Move to a better position
export interface ExportedMacroInformation {
  id: string;
  keys: string[];
}

export interface MessageParserMacroInfo {
  description?: string;
  id: string;
}

export interface MessageParserMacro extends MessageParserMacroInfo {
  values: MacroDictionary;
}

export interface MessageParserMacroDocumentation
  extends MessageParserMacroInfo {
  keys: string[];
}
export interface MessageParserMacroGenerator<
  GENERATE_DATA extends object = EMPTY_OBJECT
> extends MessageParserMacroDocumentation {
  /** Example data. */
  exampleData?: GENERATE_DATA;
  /** Method to generate the macro entries. */
  generate: (data: GENERATE_DATA) => MacroDictionaryEntry[];
}

export const generateMacroMap = (macros: MessageParserMacro[]): MacroMap => {
  const macrosMap: MacroMap = new Map();
  for (const macro of macros) {
    macrosMap.set(macro.id, macro.values);
  }
  return macrosMap;
};
