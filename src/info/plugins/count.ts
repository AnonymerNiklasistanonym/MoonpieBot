// Type imports
import type { MessageParserPluginGenerator } from "../../messageParser";

export const pluginCountId = "COUNT";

export interface PluginCountData {
  count: number;
}

export const pluginCountGenerator: MessageParserPluginGenerator<PluginCountData> =
  {
    description: "Get the amount of times the custom command was called",
    generate: (data) => () => `${data.count + 1}`,
    id: pluginCountId,
    signature: {
      type: "signature",
    },
  };
