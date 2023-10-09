// Relative imports
import { genericStringSorter } from "../other/genericStringSorter.mjs";
// Type imports
import type {
  DeepReadonly,
  DeepReadonlyArray,
  OrArray,
  OrPromise,
} from "../other/types.mjs";
import type {
  ExportedMacroInformation,
  MacroMap,
  RequestHelp,
} from "./macros.mjs";
import type { Logger } from "winston";
import type { ParseTreeNodeErrorCode } from "./errors.mjs";

export interface PluginSignature {
  argument?: OrArray<string>;
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
  logger: Readonly<Logger>,
  /**
   * The plugin value string if exists.
   */
  value?: string,
  /**
   * Return the plugin signature if available.
   */
  signature?: boolean,
) => OrPromise<MacroMap | string | boolean | RequestHelp | PluginSignature>;
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
  generate: (data: DeepReadonly<DATA>) => PluginFunc;
  signature?: PluginSignature;
}

export const generatePlugin = <DATA,>(
  generator: MessageParserPluginGenerator<DATA>,
  data: DeepReadonly<DATA>,
): MessageParserPlugin => ({
  ...generator,
  func: async (logger, value, signature) => {
    if (signature) {
      if (generator.signature !== undefined) {
        return generator.signature;
      }
    }
    return await generator.generate(data)(logger, value, signature);
  },
});

export const generatePluginInfo = <DATA,>(
  generator: MessageParserPluginGenerator<DATA>,
): MessageParserPluginInfo => ({
  ...generator,
});

export interface MessageParserPluginInfo extends MessageParserPluginBase {
  signature?: PluginSignature;
}

export const generatePluginMap = (
  plugins: DeepReadonlyArray<MessageParserPlugin>,
): PluginMap => {
  const pluginsMap: PluginMap = new Map();
  for (const plugin of plugins) {
    pluginsMap.set(plugin.id, plugin.func);
  }
  return pluginsMap;
};

export const createPluginSignature = async (
  logger: Readonly<Logger>,
  pluginName: string,
  pluginFunc?: PluginFunc,
  pluginSignatureObject?: DeepReadonly<PluginSignature>,
): Promise<string> => {
  // Check for plugin signature
  const argumentSignatures: string[] = [];
  let scopeSignature: string | undefined;
  try {
    let pluginSignature;
    if (pluginFunc !== undefined) {
      pluginSignature = await pluginFunc(logger, undefined, true);
    }
    if (pluginSignatureObject !== undefined) {
      pluginSignature = Object.assign({}, pluginSignatureObject);
    }
    if (
      typeof pluginSignature === "object" &&
      !(pluginSignature instanceof Map) &&
      pluginSignature.type === "signature"
    ) {
      if (pluginSignature.argument) {
        if (Array.isArray(pluginSignature.argument)) {
          argumentSignatures.push(...pluginSignature.argument);
        } else {
          argumentSignatures.push(pluginSignature.argument);
        }
      }
      if (pluginSignature.scope) {
        scopeSignature = pluginSignature.scope;
      }
      if (
        pluginSignature.exportedMacros &&
        pluginSignature.exportedMacros.length > 0
      ) {
        if (scopeSignature === undefined) {
          scopeSignature = "";
        }
        if (scopeSignature.length > 0) {
          scopeSignature += ";";
        }
        for (const exportedMacro of pluginSignature.exportedMacros) {
          scopeSignature += `%${exportedMacro.id}:[${exportedMacro.keys
            .sort(genericStringSorter)
            .join(",")}]%`;
        }
      }
    }
  } catch (err) {
    // ignore
  }
  if (argumentSignatures.length === 0) {
    return `$(${pluginName}${scopeSignature ? "|" + scopeSignature : ""})`;
  }
  return argumentSignatures
    .map(
      (argumentSignature) =>
        `$(${pluginName}${
          argumentSignature && argumentSignature.length > 0
            ? "=" + argumentSignature
            : ""
        }${scopeSignature ? "|" + scopeSignature : ""})`,
    )
    .join(",");
};
