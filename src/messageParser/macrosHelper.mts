// Type imports
import type {
  DeepReadonly,
  DeepReadonlyArray,
  EMPTY_OBJECT,
} from "../other/types.mjs";
import type {
  MacroMap,
  MessageParserMacroGenerator,
  MessageParserMacroInfo,
} from "./macros.mjs";

export const generateMacroMapFromMacroGenerator = <
  GENERATE_DATA extends EMPTY_OBJECT
>(
  macroGenerator: Readonly<MessageParserMacroGenerator<GENERATE_DATA>>,
  data: DeepReadonly<GENERATE_DATA>
): MacroMap =>
  new Map([[macroGenerator.id, new Map(macroGenerator.generate(data))]]);

export const checkMacrosForDuplicates = <
  MACRO_TYPE extends MessageParserMacroInfo
>(
  name: string,
  ...macros: DeepReadonlyArray<MACRO_TYPE>
): DeepReadonlyArray<MACRO_TYPE> => {
  // Check for duplicated IDs
  macros.forEach((value, index, array) => {
    if (array.findIndex((a) => a.id === value.id) !== index) {
      throw Error(
        `The macro list ${name} contained the ID "${value.id}" twice`
      );
    }
  });
  return macros;
};
