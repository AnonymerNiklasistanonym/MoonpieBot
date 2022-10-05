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
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
  pluginLowercase,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToHumanReadableStringShort,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
} from "./plugins/general";
import { pluginsCustomCommandGenerator } from "./plugins/customDataLogic";
import { pluginsOsuGenerator } from "./plugins/osuApi";
import { pluginsOsuStreamCompanionGenerator } from "./plugins/osuStreamCompanion";
import { pluginSpotifyGenerator } from "./plugins/spotify";
import { pluginsTwitchApiGenerator } from "./plugins/twitchApi";
import { pluginsTwitchChatGenerator } from "./plugins/twitchChat";
// Type imports
import type { ExportedMacroInformation, MacroMap, RequestHelp } from "./macros";
import type { Logger } from "winston";

export interface PluginSignature {
  argument?: string | string[];
  exportedMacros?: ExportedMacroInformation[];
  scope?: string;
  type: "signature";
}

/**
 * A plugin can have a scope in which special plugins can be defined.
 * They output a tuple list of macro value and macro output or just a string.
 *
 * The plugin either returns:
 * - a "string" which contains the result.
 * - a "boolean" which if true means insert the plugin value string as scope or render scope if not empty or false meaning the same as empty string.
 * - a "map" which contains plugin macros.
 * - a help information object.
 * - a signature information object.
 */
export type PluginFunc = (
  logger: Logger,
  /**
   * The plugin value string if exists.
   */
  value?: string,
  /**
   * Return the plugin signature if available.
   */
  signature?: boolean
) =>
  | Promise<MacroMap | string | boolean | RequestHelp | PluginSignature>
  | MacroMap
  | string
  | boolean
  | RequestHelp
  | PluginSignature;
export type PluginMap = Map<string, PluginFunc>;

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
  pluginListFilterUndefined,
  pluginListJoinCommaSpace,
  pluginListSort,
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
  //...pluginsCustomCommandDataGenerator.map(generatePluginInfo),
  ...pluginsTwitchApiGenerator.map(generatePluginInfo),
];

export const generatePluginMap = (
  plugins: MessageParserPlugin[]
): PluginMap => {
  const pluginsMap: PluginMap = new Map();
  for (const plugin of plugins) {
    pluginsMap.set(plugin.id, plugin.func);
  }
  return pluginsMap;
};
