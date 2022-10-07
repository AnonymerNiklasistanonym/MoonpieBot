// Local imports
import { createLogFunc } from "./logging";
import { createParseTree } from "./messageParser/createParseTree";
import { parseTreeNode } from "./messageParser/parseTreeNode";
// Type imports
import type { Logger } from "winston";
import type { MacroMap } from "./messageParser/macros";
import type { PluginMap } from "./messageParser/plugins";
import type { StringMap } from "./strings";
// Local exports
export { generateMacroMap } from "./messageParser/macros";
export { generatePlugin, generatePluginMap } from "./messageParser/plugins";
export { generateMacroMapFromMacroGenerator } from "./messageParser/macrosHelper";
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
  strings: Readonly<StringMap> = new Map(),
  plugins: Readonly<PluginMap> = new Map(),
  macros: Readonly<MacroMap> = new Map(),
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
  strings: Readonly<StringMap>,
  plugins: Readonly<PluginMap> = new Map(),
  macros: Readonly<MacroMap> = new Map(),
  logger: Logger
): Promise<string> => {
  const stringFromId = strings.get(stringId);
  if (stringFromId === undefined) {
    throw Error(`Message string could not be found via its ID '${stringId}'`);
  }
  return await messageParser(stringFromId, strings, plugins, macros, logger);
};
