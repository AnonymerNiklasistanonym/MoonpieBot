// Type imports
import type { EMPTY_OBJECT } from "../other/types.mjs";
import type { Logger } from "winston";

// A macro is a simple text replace dictionary
export type MacroDictionary<MACRO_ENUM extends string = string> = Map<
  MACRO_ENUM,
  string
>;
export type MacroMap<MACRO_ENUM extends string = string> = Map<
  string,
  MacroDictionary<MACRO_ENUM>
>;

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

export type MacroValues = undefined | string | number | boolean;

export interface ConvertMacroMapValueOptions {
  convertNumber?: (num: number) => string;
}

const convertMacroMapValue = (
  macroValue: MacroValues,
  options?: Readonly<ConvertMacroMapValueOptions>,
): string => {
  if (macroValue === undefined) {
    return "undefined";
  }
  if (typeof macroValue === "number") {
    if (options?.convertNumber !== undefined) {
      return options.convertNumber(macroValue);
    }
    return `${macroValue}`;
  }
  if (typeof macroValue === "boolean") {
    return macroValue ? "true" : "false";
  }
  return macroValue;
};

export const createMessageParserMacro = <MACRO_ENUM extends string = string>(
  info: MessageParserMacroInfo,
  macroIds: Readonly<MACRO_ENUM[]>,
  macroValueMapper: (macroId: MACRO_ENUM) => MacroValues,
): MessageParserMacro<MACRO_ENUM> => ({
  ...info,
  values: new Map(
    macroIds.map((value) => [
      value,
      convertMacroMapValue(macroValueMapper(value)),
    ]),
  ),
});

export const createMessageParserMacroGenerator = <
  MACRO_ENUM extends string,
  GENERATE_DATA extends object,
>(
  info: MessageParserMacroInfo,
  macroIds: MACRO_ENUM[],
  macroValueMapper: (
    macroId: MACRO_ENUM,
    data: Readonly<GENERATE_DATA>,
    logger: Readonly<Logger>,
  ) => MacroValues,
  exampleData?: Readonly<GENERATE_DATA>,
  options?: Readonly<ConvertMacroMapValueOptions>,
): MessageParserMacroGenerator<MACRO_ENUM, GENERATE_DATA> => ({
  ...info,
  exampleData,
  generate: (data, logger) =>
    new Map(
      macroIds.map((value) => [
        value,
        convertMacroMapValue(macroValueMapper(value, data, logger), options),
      ]),
    ),
  keys: macroIds,
});

export const createMessageParserMacroGeneratorDynamicKeys = <
  MACRO_ENUM extends string,
  GENERATE_DATA extends object,
>(
  info: MessageParserMacroInfo,
  macroIdGenerator: (data: Readonly<GENERATE_DATA>) => MACRO_ENUM[],
  macroValueMapper: (
    macroId: MACRO_ENUM,
    data: Readonly<GENERATE_DATA>,
    logger: Readonly<Logger>,
  ) => MacroValues,
  exampleData?: Readonly<GENERATE_DATA>,
): MessageParserMacroGenerator<MACRO_ENUM, GENERATE_DATA> => ({
  ...info,
  exampleData,
  generate: (data, logger) =>
    new Map(
      macroIdGenerator(data).map((value) => [
        value,
        convertMacroMapValue(macroValueMapper(value, data, logger)),
      ]),
    ),
  keys: [],
});

export interface MessageParserMacroDocumentation<
  MACRO_ENUM extends string = string,
> extends MessageParserMacroInfo {
  keys: MACRO_ENUM[];
}
export interface MessageParserMacroGenerator<
  MACRO_ENUM extends string = string,
  GENERATE_DATA extends object = EMPTY_OBJECT,
> extends MessageParserMacroDocumentation<MACRO_ENUM> {
  /** Example data. */
  exampleData?: GENERATE_DATA;
  /** Method to generate the macro entries. */
  generate: (
    data: Readonly<GENERATE_DATA>,
    logger: Readonly<Logger>,
  ) => MacroDictionary<MACRO_ENUM>;
}

export const generateMacroMap = (
  macros: Readonly<MessageParserMacro[]>,
): MacroMap => {
  const macrosMap: MacroMap = new Map();
  for (const macro of macros) {
    macrosMap.set(macro.id, new Map(macro.values));
  }
  return macrosMap;
};
