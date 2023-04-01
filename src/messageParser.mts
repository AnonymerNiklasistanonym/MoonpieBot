// Relative imports
import { createLogFunc } from "./logging.mjs";
import { createParseTree } from "./messageParser/createParseTree.mjs";
import { parseTreeNode } from "./messageParser/parseTreeNode.mjs";
// Type imports
import type { DeepReadonly, OrUndef } from "./other/types.mjs";
import type { Logger } from "winston";
import type { MacroMap } from "./messageParser/macros.mjs";
import type { PluginMap } from "./messageParser/plugins.mjs";
import type { StringMap } from "./messageParser/strings.mjs";
// Local exports
export {
  ParseTreeNodeError,
  ParseTreeNodeErrorCode,
} from "./messageParser/errors.mjs";
export {
  createPluginSignature,
  generatePlugin,
  generatePluginMap,
  generatePluginInfo,
} from "./messageParser/plugins.mjs";
export {
  createMessageParserMessage,
  generateMessageParserMessageMacro,
  generateMessageParserMessageReference,
} from "./messageParser/createMessageParserMessage.mjs";
export { generateMacroMap } from "./messageParser/macros.mjs";
export {
  checkMacrosForDuplicates,
  generateMacroMapFromMacroGenerator,
} from "./messageParser/macrosHelper.mjs";
export {
  generateStringMap,
  updateStringsMapWithCustomEnvStrings,
} from "./messageParser/strings.mjs";
// Type exports
export type {
  MacroMap,
  MacroDictionary,
  MacroDictionaryEntry,
  MessageParserMacro,
  MessageParserMacroDocumentation,
  MessageParserMacroGenerator,
} from "./messageParser/macros.mjs";
export type {
  MessageParserPlugin,
  MessageParserPluginExample,
  MessageParserPluginGenerator,
  MessageParserPluginInfo,
  PluginFunc,
  PluginMap,
  PluginSignature,
} from "./messageParser/plugins.mjs";
export type { StringEntry, StringMap } from "./messageParser/strings.mjs";
export type {
  MessageForParserMessageElements,
  MessageForParserMessageMacro,
  MessageForParserMessageReference,
  MessageForParserMessagePlugin,
} from "./messageParser/createMessageParserMessage.mjs";

/**
 * The logging ID of this module.
 */
const LOG_ID = "message_parser";

export const messageParser = async (
  messageString: OrUndef<string>,
  strings: DeepReadonly<StringMap> = new Map(),
  plugins: DeepReadonly<PluginMap> = new Map(),
  macros: DeepReadonly<MacroMap> = new Map(),
  logger: Readonly<Logger>
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
    // 2. Parse parse tree from top down
    return await parseTreeNode(parseTreeNodeRoot, plugins, macros, logger);
  } catch (err) {
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
  strings: DeepReadonly<StringMap>,
  plugins: DeepReadonly<PluginMap> = new Map(),
  macros: DeepReadonly<MacroMap> = new Map(),
  logger: Readonly<Logger>
): Promise<string> => {
  const stringEntryFromId = strings.get(stringId);
  if (stringEntryFromId === undefined) {
    throw Error(`Message string could not be found via its ID '${stringId}'`);
  }
  return await messageParser(
    stringEntryFromId.default,
    strings,
    plugins,
    macros,
    logger
  );
};
