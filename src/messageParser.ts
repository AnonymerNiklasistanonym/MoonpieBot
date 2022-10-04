// Local imports
import { createLogFunc } from "./logging";
import { createParseTree } from "./messageParser/createParseTree";
import { parseTreeNode } from "./messageParser/parseTreeNode";
// Type imports
import type { MacroMap, MessageParserMacro } from "./messageParser/macros";
import type { MessageParserPlugin, PluginMap } from "./messageParser/plugins";
import type { Logger } from "winston";
import type { StringMap } from "./strings";
// Type exports
export type {
  MessageParserMacroDocumentation,
  MessageParserMacroGenerator,
} from "./messageParser/macros";
export type { PluginFunc, PluginMap } from "./messageParser/plugins";
export type { MacroMap } from "./messageParser/macros";
export type { MessageParserPluginInfo } from "./messageParser/plugins";

/**
 * The logging ID of this module.
 */
const LOG_ID = "message_parser";

export const messageParser = async (
  messageString: undefined | string,
  strings: StringMap = new Map(),
  plugins: PluginMap = new Map(),
  macros: MacroMap = new Map(),
  logger: Logger
): Promise<string> => {
  const logMessageParser = createLogFunc(logger, LOG_ID);

  if (messageString === undefined) {
    throw Error("Message string could not be parsed because it's undefined");
  }
  try {
    // 1. Create parse tree
    const parseTreeNodeRoot = createParseTree(
      messageString,
      strings,
      undefined,
      undefined,
      undefined,
      logger
    );
    //console.log(JSON.stringify(parseTreeNodeRoot));
    // 2. Parse parse tree from top down
    return await parseTreeNode(parseTreeNodeRoot, plugins, macros, logger);
  } catch (err) {
    logMessageParser.error(err as Error);
    logMessageParser.error(
      Error(
        `There was an error parsing the message string '${messageString}': ${
          (err as Error).message
        }`
      )
    );
    throw err;
  }
};

export const messageParserById = async (
  stringId: string,
  strings: StringMap,
  plugins: PluginMap = new Map(),
  macros: MacroMap = new Map(),
  logger: Logger
): Promise<string> => {
  const stringFromId = strings.get(stringId);
  if (stringFromId === undefined) {
    throw Error(`Message string could not be found via its ID '${stringId}'`);
  }
  return await messageParser(stringFromId, strings, plugins, macros, logger);
};

// TODO Think about if this is actually necessary

export interface MacroPluginMap {
  macroMap: MacroMap;
  pluginMap: PluginMap;
}

export const generateMacroPluginMap = (
  plugins: MessageParserPlugin[],
  macros: MessageParserMacro[]
): MacroPluginMap => {
  const pluginsMap: PluginMap = new Map();
  for (const plugin of plugins) {
    pluginsMap.set(plugin.id, plugin.func);
  }
  const macrosMap: MacroMap = new Map();
  for (const macro of macros) {
    macrosMap.set(macro.id, macro.values);
  }
  return { macroMap: macrosMap, pluginMap: pluginsMap };
};
