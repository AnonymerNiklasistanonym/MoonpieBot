// Type imports
import type { DeepReadonlyArray, EMPTY_OBJECT } from "../other/types.mjs";
import type {
  MacroMap,
  MessageParserMacroGenerator,
  MessageParserMacroInfo,
} from "./macros.mjs";
import type { Logger } from "winston";

export const generateMacroMapFromMacroGenerator = <
  MACRO_ENUM extends string = string,
  GENERATE_DATA extends EMPTY_OBJECT = EMPTY_OBJECT,
>(
  macroGenerator: Readonly<
    MessageParserMacroGenerator<MACRO_ENUM, GENERATE_DATA>
  >,
  data: Readonly<GENERATE_DATA>,
  logger: Readonly<Logger>,
): MacroMap<MACRO_ENUM> =>
  new Map([
    [macroGenerator.id, new Map(macroGenerator.generate(data, logger))],
  ]);

export const normalizeMacroMap = <MACRO_ENUM extends string = string>(
  macroMap: MacroMap<MACRO_ENUM>,
): MacroMap => macroMap;

export const checkMacrosForDuplicates = <
  MACRO_TYPE extends MessageParserMacroInfo,
>(
  name: string,
  ...macros: DeepReadonlyArray<MACRO_TYPE>
): DeepReadonlyArray<MACRO_TYPE> => {
  // Check for duplicated IDs
  macros.forEach((value, index, array) => {
    if (array.findIndex((a) => a.id === value.id) !== index) {
      throw Error(
        `The macro list ${name} contained the ID "${value.id}" twice`,
      );
    }
  });
  return macros;
};
