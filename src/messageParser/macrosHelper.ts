// Type imports
import type {
  MacroMap,
  MessageParserMacroGenerator,
  MessageParserMacroInfo,
} from "./macros";
import type { EMPTY_OBJECT } from "../info/other";

export const generateMacroMapFromMacroGenerator = <
  GENERATE_DATA extends EMPTY_OBJECT
>(
  macroGenerator: MessageParserMacroGenerator<GENERATE_DATA>,
  data: GENERATE_DATA
): MacroMap =>
  new Map([[macroGenerator.id, new Map(macroGenerator.generate(data))]]);

export const checkMacrosForDuplicates = <
  MACRO_TYPE extends MessageParserMacroInfo
>(
  name: string,
  ...macros: MACRO_TYPE[]
): MACRO_TYPE[] => {
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
