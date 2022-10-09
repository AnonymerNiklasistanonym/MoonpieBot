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
import { generatePluginInfo } from "../messageParser";
import { pluginCountGenerator } from "./plugins/count";
import { pluginsCustomCommandDataGenerator } from "./plugins/customDataLogic";
import { pluginsOsuGenerator } from "./plugins/osuApi";
import { pluginsOsuStreamCompanionGenerator } from "./plugins/osuStreamCompanion";
import { pluginSpotifyGenerator } from "./plugins/spotify";
import { pluginsTwitchApiGenerator } from "./plugins/twitchApi";
import { pluginsTwitchChatGenerator } from "./plugins/twitchChat";
// Type imports
import type {
  MessageParserPlugin,
  MessageParserPluginInfo,
} from "../messageParser";

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
  generatePluginInfo(pluginCountGenerator),
  ...pluginsCustomCommandDataGenerator.map(generatePluginInfo),
  ...pluginsTwitchApiGenerator.map(generatePluginInfo),
];
