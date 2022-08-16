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
import {
  pluginsCustomCommandDataGenerator,
  pluginsCustomCommandGenerator,
} from "./plugins/customCommand";
import { pluginsOsuGenerator } from "./plugins/osuApi";
import { pluginsOsuStreamCompanionGenerator } from "./plugins/osuStreamCompanion";
import { pluginSpotifyGenerator } from "./plugins/spotify";
import { pluginsTwitchChatGenerator } from "./plugins/twitchChat";
// Type imports
import type { PluginFunc, PluginSignature } from "../messageParser";
import { pluginsTwitchApiGenerator } from "./plugins/twitchApi";

export interface MessageParserPluginExample {
  after?: string;
  argument?: string;
  before?: string;
  hideOutput?: boolean;
  scope?: string;
}

interface MessageParserPluginBase {
  description?: string;
  examples?: MessageParserPluginExample[];
  id: string;
}

export interface MessageParserPlugin extends MessageParserPluginBase {
  func: PluginFunc;
}

export interface MessageParserPluginGenerator<DATA>
  extends MessageParserPluginBase {
  generate: (data: DATA) => PluginFunc;
  signature?: PluginSignature;
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

const generatePluginInfo = <DATA>(
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
  ...pluginsOsuStreamCompanionGenerator.map(generatePluginInfo),
  generatePluginInfo(pluginSpotifyGenerator),
  generatePluginInfo(pluginSpotifyGenerator),
  ...pluginsCustomCommandGenerator.map(generatePluginInfo),
  ...pluginsCustomCommandDataGenerator.map(generatePluginInfo),
  ...pluginsTwitchApiGenerator.map(generatePluginInfo),
];
