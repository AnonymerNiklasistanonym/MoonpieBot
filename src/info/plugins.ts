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
import {
  pluginsCustomCommandDataGenerator,
  pluginsCustomCommandGenerator,
} from "./plugins/customDataLogic";
import { generatePluginInfo } from "../messageParser/plugins";
import { pluginsOsuGenerator } from "./plugins/osuApi";
import { pluginsOsuStreamCompanionGenerator } from "./plugins/osuStreamCompanion";
import { pluginSpotifyGenerator } from "./plugins/spotify";
import { pluginsTwitchApiGenerator } from "./plugins/twitchApi";
import { pluginsTwitchChatGenerator } from "./plugins/twitchChat";
// Type imports
import type {
  MessageParserPlugin,
  MessageParserPluginInfo,
} from "../messageParser/plugins";

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
