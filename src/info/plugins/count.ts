// Type imports
import type { MessageParserPluginGenerator } from "../../messageParser";

export const pluginCountId = "COUNT";

export interface PluginCountData {
  count: number;
}

export const pluginCountGenerator: MessageParserPluginGenerator<PluginCountData> =
  {
    description: "Get the amount of times the custom command was called",
    generate: (data) => (_, regexGroupIndex) => {
      if (regexGroupIndex === undefined || regexGroupIndex.length === 0) {
        throw Error("Regex group index was undefined or empty");
      }
      return `${data.count}`;
    },
    id: pluginCountId,
    signature: {
      type: "signature",
    },
  };
