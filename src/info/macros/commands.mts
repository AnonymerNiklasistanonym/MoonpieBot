// Relative imports
import { createMessageParserMacroGeneratorDynamicKeys } from "../../messageParser/macros.mjs";

export interface MacroCommandsEnabledData<ENUM_TYPE> {
  convertEnumValueToInfo: (enumValue: ENUM_TYPE) => [ENUM_TYPE, boolean];
  enumValues: ENUM_TYPE[];
}
enum MacroCommandEnabledExample {
  ABOUT = "COMMAND_ABOUT",
  COMMANDS = "COMMAND_COMMANDS",
  HELP = "COMMAND_HELP",
}
export const macroCommandEnabled = createMessageParserMacroGeneratorDynamicKeys<
  string,
  MacroCommandsEnabledData<string>
>(
  {
    description:
      "Available in !commands commands to see what commands are enabled",
    id: "COMMAND_ENABLED",
  },
  (data) =>
    data.enumValues.map(
      (enumValue) => data.convertEnumValueToInfo(enumValue)[0],
    ),
  (macroId, data) =>
    data.enumValues
      .map((enumValue) => data.convertEnumValueToInfo(enumValue))
      .find((a) => a[0] === macroId)
      ?.at(1)
      ? "true"
      : "false",
  {
    convertEnumValueToInfo: (enumValue) => {
      const enabled = [MacroCommandEnabledExample.HELP].includes(
        enumValue as MacroCommandEnabledExample,
      );
      switch (enumValue as MacroCommandEnabledExample) {
        case MacroCommandEnabledExample.ABOUT:
          return ["STRING_ID_COMMAND_ABOUT", enabled];
        case MacroCommandEnabledExample.COMMANDS:
          break;
        case MacroCommandEnabledExample.HELP:
          return ["STRING_ID_COMMAND_HELP", enabled];
      }
      return ["undefined", false];
    },
    enumValues: Object.values(MacroCommandEnabledExample),
  },
);
