// Type imports
import type { MessageParserPluginGenerator } from "../../messageParser";

export const pluginRegexGroupId = "REGEX_GROUP";

export interface PluginsRegexGroupData {
  /**
   * The regex groups matched by the custom command regex.
   */
  regexGroups: RegExpMatchArray;
}

export const pluginsRegexGroupGenerator: MessageParserPluginGenerator<PluginsRegexGroupData> =
  {
    description: "Reference regex capture groups",
    generate: (data) => (_, regexGroupIndex) => {
      if (regexGroupIndex === undefined || regexGroupIndex.length === 0) {
        throw Error("Regex group index was undefined or empty");
      }
      return `${data.regexGroups[parseInt(regexGroupIndex)]}`;
    },
    id: pluginRegexGroupId,
    signature: {
      argument: "regexGroupIndex",
      type: "signature",
    },
  };
