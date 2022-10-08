// Type imports
import type { EMPTY_OBJECT } from "../other/types";

// A macro is a simple text replace dictionary
export type MacroDictionaryEntry<MACRO_ENUM extends string = string> = [
  MACRO_ENUM,
  string
];
export type MacroDictionary<MACRO_ENUM extends string = string> = Map<
  MACRO_ENUM,
  string
>;
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

export interface MessageParserMacro<MACRO_ENUM extends string = string>
  extends MessageParserMacroInfo {
  values: MacroDictionary<MACRO_ENUM>;
}

export interface MessageParserMacroDocumentation<
  MACRO_ENUM extends string = string
> extends MessageParserMacroInfo {
  keys: MACRO_ENUM[];
}
export interface MessageParserMacroGenerator<
  GENERATE_DATA extends object = EMPTY_OBJECT,
  MACRO_ENUM extends string = string
> extends MessageParserMacroDocumentation<MACRO_ENUM> {
  /** Example data. */
  exampleData?: GENERATE_DATA;
  /** Method to generate the macro entries. */
  generate: (data: GENERATE_DATA) => MacroDictionaryEntry<MACRO_ENUM>[];
}

export const generateMacroMap = (macros: MessageParserMacro[]): MacroMap => {
  const macrosMap: MacroMap = new Map();
  for (const macro of macros) {
    macrosMap.set(macro.id, macro.values);
  }
  return macrosMap;
};
