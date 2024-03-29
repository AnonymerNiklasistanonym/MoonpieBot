// Type imports
import type { MessageParserPluginGenerator } from "../../messageParser";

export interface PluginCountData {
  count: number;
}

export const pluginCountGenerator: MessageParserPluginGenerator<PluginCountData> =
  {
    description: "Get the amount of times the custom command was called",
    generate: (data) => () => `${data.count + 1}`,
    id: "COUNT",
    signature: {
      type: "signature",
    },
  };
