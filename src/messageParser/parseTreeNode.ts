/**
 * This file contains the code of how to parse a tree node to a string.
 */

// Local imports
import { createLogFunc } from "../logging";
import { createPluginSignatureString } from "../documentation/messageParser";
import { genericStringSorter } from "../other/genericStringSorter";
// Type imports
import type { Logger } from "winston";
import type { MacroMap } from "../messageParser/macros";
import type { ParseTreeNode } from "../messageParser/createParseTree";
import type { PluginMap } from "../messageParser/plugins";

/**
 * The logging ID of this module.
 */
const LOG_ID = "parse_tree_node";

const replaceMacros = (text: string, macros: MacroMap) => {
  return text.replace(
    /%([^:\s]+?):([^:\s]+?)%/g,
    (_fullMatch, macroName, macroValue) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const macro = macros.get(macroName);
      if (macro === undefined) {
        throw Error(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Macro (${macroName}) was not found [${Array.from(macros.entries())
            .map((a) => a[0])
            .join(",")}]`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const macroOutput = macro.get(macroValue);
      if (macroOutput === undefined) {
        throw Error(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Macro (${macroName}:${macroValue}) was not found [${Array.from(
            macro.entries()
          )
            .map((a) => a[0])
            .join(",")}]`
        );
      }
      return macroOutput;
    }
  );
};

export const parseTreeNode = async (
  treeNode: ParseTreeNode,
  plugins: PluginMap,
  macros: MacroMap,
  logger: Logger
): Promise<string> => {
  const logMessageParser = createLogFunc(logger, LOG_ID, "parse_tree_node");

  switch (treeNode.type) {
    case "text":
      if (treeNode.content === undefined) {
        throw Error(
          `Parse tree node '${treeNode.type}' had no content (${treeNode.originalString})`
        );
      }
      try {
        return replaceMacros(treeNode.content, macros);
      } catch (err) {
        throw Error(
          `Parse tree node '${treeNode.type}' encountered a macro error ('${
            treeNode.originalString
          }',${(err as Error).message})`
        );
      }
    case "plugin":
      // Run plugin
      // eslint-disable-next-line no-case-declarations
      const pluginName = treeNode.pluginName;
      if (pluginName === undefined) {
        throw Error(
          `Parse tree node '${treeNode.type}' had no plugin name (${treeNode.originalString})`
        );
      }
      // eslint-disable-next-line no-case-declarations
      const plugin = plugins.get(pluginName);
      if (plugin === undefined) {
        throw Error(
          `Parse tree node '${
            treeNode.type
          }' plugin name '${pluginName}' was not found ('${
            treeNode.originalString
          }',[${Array.from(plugins.entries())
            .map((a) => a[0])
            .sort(genericStringSorter)
            .join(",")}])`
        );
      }
      // eslint-disable-next-line no-case-declarations
      const pluginValue = treeNode.pluginValue;
      // eslint-disable-next-line no-case-declarations
      let pluginValueString;
      try {
        pluginValueString = pluginValue
          ? await parseTreeNode(pluginValue, plugins, macros, logger)
          : undefined;
      } catch (err) {
        logMessageParser.error(err as Error);
        logMessageParser.error(
          Error(
            `Parse tree node '${
              treeNode.type
            }' could not produce plugin value string ('${
              treeNode.originalString
            }',${(err as Error).message}`
          )
        );
        throw err;
      }
      // eslint-disable-next-line no-case-declarations
      let pluginOutput;
      try {
        // TODO Think about a cache implementation
        pluginOutput = await plugin(logger, pluginValueString);
      } catch (err) {
        logMessageParser.error(err as Error);
        logMessageParser.error(
          Error(
            `Parse tree node '${
              treeNode.type
            }' could not produce plugin output (${treeNode.originalString},${
              (err as Error).message
            })`
          )
        );
        throw err;
      }
      if (pluginOutput instanceof Map) {
        for (const [macroId, macroValues] of pluginOutput) {
          if (!macros.has(macroId)) {
            macros.set(macroId, new Map());
          }
          for (const [macroName, macroValue] of macroValues) {
            macros.get(macroId)?.set(macroName, macroValue);
          }
        }
        const pluginContentNode = treeNode.pluginContent;
        if (pluginContentNode === undefined) {
          throw Error(
            `Parse tree node '${treeNode.type}' had no plugin content (${treeNode.originalString})`
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parseTreeNode(pluginContentNode, plugins, macros, logger);
      } else if (typeof pluginOutput === "string") {
        return pluginOutput;
      } else if (typeof pluginOutput === "boolean") {
        if (pluginOutput === false) {
          return "";
        }
        const pluginContentNode = treeNode.pluginContent;
        if (pluginContentNode === undefined) {
          if (pluginValueString !== undefined) {
            return pluginValueString;
          }
          throw Error(
            `Parse tree node '${treeNode.type}' had no plugin content and no plugin value (${treeNode.originalString})`
          );
        }
        return parseTreeNode(pluginContentNode, plugins, macros, logger);
      } else if (pluginOutput.type === "help") {
        let helpOutput = "";
        if (pluginOutput.macros && macros) {
          const stringsMacros: string[] = [];
          for (const macro of macros.entries()) {
            for (const macroValue of macro[1]) {
              stringsMacros.push(
                `%${macro[0]}:${macroValue[0]}%='${macroValue[1]}'`
              );
            }
          }
          if (helpOutput.length > 0) {
            helpOutput += "; ";
          }
          helpOutput += "Macros: ";
          if (stringsMacros.length > 0) {
            helpOutput += stringsMacros.sort(genericStringSorter).join(",");
          } else {
            helpOutput += "[]";
          }
        }
        if (pluginOutput.plugins && plugins) {
          const stringsPlugins: string[] = [];
          for (const pluginForSignature of plugins.entries()) {
            stringsPlugins.push(
              await createPluginSignatureString(
                logger,
                pluginForSignature[0],
                pluginForSignature[1]
              )
            );
          }
          if (helpOutput.length > 0) {
            helpOutput += "; ";
          }
          helpOutput += "Plugins: ";
          if (stringsPlugins.length > 0) {
            helpOutput += stringsPlugins.sort(genericStringSorter).join(",");
          } else {
            helpOutput += "[]";
          }
        }
        return helpOutput;
      } else if (pluginOutput.type === "signature") {
        throw Error("Signature output is not supported in the message parser!");
      }
      throw Error("This should be unreachable!");
    case "children":
      if (treeNode.children === undefined) {
        throw Error(
          `Parse tree node '${treeNode.type}' had no children (${treeNode.originalString})`
        );
      }
      // eslint-disable-next-line no-case-declarations
      let output = "";
      for (const childNode of treeNode.children) {
        output += await parseTreeNode(childNode, plugins, macros, logger);
      }
      return output;
  }
};
