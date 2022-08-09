// Local imports
import {
  pluginConvertToShortNumber,
  pluginHelp,
  pluginIfEmpty,
  pluginIfEqual,
  pluginIfFalse,
  pluginIfGreater,
  pluginIfNotEmpty,
  pluginIfNotEqual,
  pluginIfNotGreater,
  pluginIfNotSmaller,
  pluginIfNotUndefined,
  pluginIfSmaller,
  pluginIfTrue,
  pluginIfUndefined,
  pluginLowercase,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToHumanReadableStringShort,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
} from "./plugins/general";
import { pluginsOsuGenerator } from "./plugins/osu";
import { pluginsTwitchChatGenerator } from "./plugins/twitchChat";
// Type imports
import type { PluginFunc, PluginSignature } from "../messageParser";
import { pluginOsuStreamCompanionGenerator } from "./plugins/streamcompanion";

export interface MessageParserPluginExample {
  before?: string;
  argument?: string;
  scope?: string;
  after?: string;
}

interface MessageParserPluginBase {
  id: string;
  description?: string;
  examples?: MessageParserPluginExample[];
}

export interface MessageParserPlugin extends MessageParserPluginBase {
  func: PluginFunc;
}

export interface MessageParserPluginGenerator<DATA>
  extends MessageParserPluginBase {
  signature?: PluginSignature;
  generate: (data: DATA) => PluginFunc;
}

export const generatePlugin = <DATA>(
  generator: MessageParserPluginGenerator<DATA>,
  data: DATA
): MessageParserPlugin => ({
  ...generator,
  func: (logger, value, signature) => {
    if (signature) {
      if (generator.signature !== undefined) {
        return generator.signature;
      }
    }
    return generator.generate(data)(logger, value, signature);
  },
});

export const generatePluginInfo = <DATA>(
  generator: MessageParserPluginGenerator<DATA>
): MessageParserPluginInfo => ({
  ...generator,
});

/**
 * The default values for all plugins.
 */
export const defaultPlugins: MessageParserPlugin[] = [
  pluginConvertToShortNumber,
  pluginHelp,
  pluginIfEmpty,
  pluginIfEqual,
  pluginIfFalse,
  pluginIfGreater,
  pluginIfNotEmpty,
  pluginIfNotEqual,
  pluginIfNotGreater,
  pluginIfNotSmaller,
  pluginIfNotUndefined,
  pluginIfSmaller,
  pluginIfTrue,
  pluginIfUndefined,
  pluginLowercase,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToHumanReadableStringShort,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
];

export interface MessageParserPluginInfo extends MessageParserPluginBase {
  signature?: PluginSignature;
}

export const defaultPluginsOptional: MessageParserPluginInfo[] = [
  ...pluginsTwitchChatGenerator.map(generatePluginInfo),
  ...pluginsOsuGenerator.map(generatePluginInfo),
  generatePluginInfo(pluginOsuStreamCompanionGenerator),
];
