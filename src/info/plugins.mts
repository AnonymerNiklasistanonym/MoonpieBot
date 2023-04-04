// Relative imports
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
  pluginMath,
  pluginRandomNumber,
  pluginRoundNumber,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToHumanReadableStringShort,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
} from "./plugins/general.mjs";
import { generatePluginInfo } from "../messageParser.mjs";
import { pluginCountGenerator } from "./plugins/count.mjs";
import { pluginsCustomCommandDataGenerator } from "./plugins/customDataLogic.mjs";
import { pluginsOsuGenerator } from "./plugins/osuApi.mjs";
import { pluginsOsuStreamCompanionGenerator } from "./plugins/osuStreamCompanion.mjs";
import { pluginSpotifyGenerator } from "./plugins/spotify.mjs";
import { pluginsTwitchApiGenerator } from "./plugins/twitchApi.mjs";
import { pluginsTwitchChatGenerator } from "./plugins/twitchChat.mjs";
// Type imports
import type {
  MessageParserPlugin,
  MessageParserPluginInfo,
} from "../messageParser.mjs";
import type { DeepReadonlyArray } from "../other/types.mjs";

/**
 * The default values for all plugins.
 */
export const defaultPlugins: DeepReadonlyArray<MessageParserPlugin> = [
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
  pluginMath,
  pluginRandomNumber,
  pluginRoundNumber,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToHumanReadableStringShort,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
];

export const defaultPluginsOptional: DeepReadonlyArray<MessageParserPluginInfo> =
  [
    ...pluginsTwitchChatGenerator.map(generatePluginInfo),
    ...pluginsOsuGenerator.map(generatePluginInfo),
    ...pluginsOsuStreamCompanionGenerator.map(generatePluginInfo),
    generatePluginInfo(pluginSpotifyGenerator),
    generatePluginInfo(pluginCountGenerator),
    ...pluginsCustomCommandDataGenerator.map(generatePluginInfo),
    ...pluginsTwitchApiGenerator.map(generatePluginInfo),
  ];
