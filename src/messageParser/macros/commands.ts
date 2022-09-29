// Type imports
import type { MessageParserMacroGenerator } from "../macros";

export interface MacroCommandsEnabledData<ENUM_TYPE> {
  convertEnumValueToInfo: (enumValue: ENUM_TYPE) => [string, boolean];
  enumValues: ENUM_TYPE[];
}

export const macroCommandEnabled: MessageParserMacroGenerator<
  MacroCommandsEnabledData<string>
> = {
  description: "Available in strings from successful moonpie claims",
  generate: (data) =>
    data.enumValues
      .map<[string, boolean]>((enumValue) =>
        data.convertEnumValueToInfo(enumValue)
      )
      .map<[string, string]>((a) => [a[0], a[1] ? "true" : "false"]),
  id: "COMMAND_ENABLED",
  keys: [],
};
