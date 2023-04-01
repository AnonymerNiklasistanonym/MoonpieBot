// Type imports
import type { MessageParserMacroGenerator } from "../../messageParser.mjs";

export interface MacroCommandsEnabledData<ENUM_TYPE> {
  convertEnumValueToInfo: (enumValue: ENUM_TYPE) => [string, boolean];
  enumValues: ENUM_TYPE[];
}
enum MacroCommandEnabledExample {
  ABOUT = "COMMAND_ABOUT",
  COMMANDS = "COMMAND_COMMANDS",
  HELP = "COMMAND_HELP",
}
export const macroCommandEnabled: MessageParserMacroGenerator<
  MacroCommandsEnabledData<string>,
  string
> = {
  description:
    "Available in !commands commands to see what commands are enabled",
  exampleData: {
    convertEnumValueToInfo: (enumValue) => {
      const enabled = [MacroCommandEnabledExample.HELP].includes(
        enumValue as MacroCommandEnabledExample
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
  generate: (data) =>
    data.enumValues
      .map<[string, boolean]>((enumValue) =>
        data.convertEnumValueToInfo(enumValue)
      )
      .map<[string, string]>((a) => [a[0], a[1] ? "true" : "false"]),
  id: "COMMAND_ENABLED",
  keys: [],
};
