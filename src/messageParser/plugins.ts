// Type imports
import type { ExportedMacroInformation, MacroMap, RequestHelp } from "./macros";
import type { Logger } from "winston";
import type { ParseTreeNodeErrorCode } from "./errors";

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
  /** Text content after plugin. */
  after?: string;
  /** The plugin argument content. */
  argument?: string;
  /** Text content before plugin. */
  before?: string;
  /** The expected plugin error message. */
  expectedError?: string;
  /** The expected error code of the parser. */
  expectedErrorCode?: ParseTreeNodeErrorCode;
  /** The expected string. */
  expectedOutput?: string;
  /** Hide the output (because it is time dependent/random etc.). */
  hideOutput?: boolean;
  /** The plugin scope content. */
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

export const generatePluginInfo = <DATA>(
  generator: MessageParserPluginGenerator<DATA>
): MessageParserPluginInfo => ({
  ...generator,
});

export interface MessageParserPluginInfo extends MessageParserPluginBase {
  signature?: PluginSignature;
}

export const generatePluginMap = (
  plugins: MessageParserPlugin[]
): PluginMap => {
  const pluginsMap: PluginMap = new Map();
  for (const plugin of plugins) {
    pluginsMap.set(plugin.id, plugin.func);
  }
  return pluginsMap;
};
