// Local imports
import {
  FileDocumentationPartType,
  FileDocumentationPartValue,
  FileDocumentationParts,
} from "./other/splitTextAtLength";
import { genericStringSorter } from "./other/genericStringSorter";
// Type imports
import type { Logger } from "winston";
import type { MessageParserMacro } from "./messageParser/macros";
import type { MessageParserPlugin } from "./messageParser/plugins";
import type { Strings } from "./strings";
import { createLogFunc } from "./logging";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_MESSAGE_PARSER = "message_parser";

/**
 * A message parse tree node.
 * Every parse tree node can be converted to a string (top to bottom).
 * With that nested plugin or macro calls are only being evaluated if the plugin
 * above them doesn't early exit. It also allows to create dynamically new
 * macros in a plugin up in the parse tree for its children (pluginContent).
 *
 * There are 3 types of nodes:
 * 1. Text: Then content contains a pure string.
 * 2. Plugin: Then there is a plugin name, and optional a value or content
 * 3. Children: Then there is a list of child nodes.
 */
export interface ParseTreeNode {
  originalString: string;
  type: "text" | "children" | "plugin";
  content?: string;
  pluginName?: string;
  pluginValue?: ParseTreeNode;
  pluginContent?: ParseTreeNode;
  children?: ParseTreeNode[];
}

/**
 * There are multiple parse states while parsing a message.
 *
 * @example ```
 * this is text \$ with an escaped dollar
 * ```
 * @example ```
 * $(plugin_name)
 * ```
 * @example ```
 * $(plugin_name|plugin content)
 * ```
 * @example ```
 * $(plugin_name=plugin_value|a $(plugin_name) in a plugin)
 * ```
 */
enum ParseState {
  /**
   * Currently parsing simple text.
   */
  TEXT = "TEXT",
  /**
   * Previously an escape symbol `\` was found while parsing simple text.
   * Any symbol after that will be added to the content string even if its
   * normally has a special meaning.
   */
  TEXT_ESCAPE_SYMBOL = "TEXT_ESCAPE_SYMBOL",
  /**
   * Previously an unescaped dollar symbol `$` was found while parsing simple
   * text. If now a `(` symbol is found a plugin is detected.
   */
  TEXT_UNESCAPED_DOLLAR = "TEXT_UNESCAPED_DOLLAR",
  /**
   * Currently parsing a plugin name.
   */
  PLUGIN_NAME = "PLUGIN_NAME",
  /**
   * Currently parsing a plugin value.
   */
  PLUGIN_VALUE = "PLUGIN_VALUE",
  /**
   * Currently parsing a plugin content scope.
   */
  PLUGIN_CONTENT = "PLUGIN_CONTENT",
  /**
   * Currently parsing a reference name.
   */
  REFERENCE_NAME = "REFERENCE_NAME",
}
/**
 * There are multiple subroutines during certain parse states.
 */
enum ParseStateHelper {
  /**
   * Do nothing.
   */
  NOTHING = "NOTHING",
  /**
   * Subroutine if a plugin scope is detected.
   */
  PLUGIN_WAS_OPENED = "PLUGIN_WAS_OPENED",
  /**
   * Subroutine if a plugin scope close is detected.
   */
  PLUGIN_WAS_CLOSED = "PLUGIN_WAS_CLOSED",
  /**
   * Subroutine if plugin content is detected since this requires a recursive call.
   */
  PLUGIN_CONTENT_FOUND = "PLUGIN_CONTENT_FOUND",
  /**
   * Subroutine if plugin value is detected since this requires a recursive call.
   */
  PLUGIN_VALUE_FOUND = "PLUGIN_VALUE_FOUND",
  /**
   * Subroutine if a reference is detected.
   */
  REFERENCE_WAS_OPENED = "REFERENCE_WAS_OPENED",
  /**
   * Subroutine if a reference closing is detected.
   */
  REFERENCE_WAS_CLOSED = "REFERENCE_WAS_CLOSED",
}

const MAX_STRING_DEPTH = 15;

/**
 * Create a parse tree of a message string.
 * This method will call itself recursively if inside of a plugin content is
 * detected. The recursive call will early exit as soon as a plugin content
 * scope close is detected.
 *
 * @param messageString The input string.
 * @param strings The global string dictonary for references.
 * @param pluginDepth The depth of the plugin which is used for recursive calls.
 * @param earlyExitBecausePluginValue If true this means a call was made to parse a plugin value so a special early exit is necessary.
 * @param stringDepth The depth of the current string reference to detect loops.
 * @param logger Global logger.
 * @returns Parse tree of the message string.
 */
export const createParseTree = (
  messageString: string,
  strings: Strings,
  pluginDepth = 0,
  earlyExitBecausePluginValue = false,
  stringDepth = 0,
  logger: Logger
) => {
  //console.log(`Generate parse tree of '${messageString}'`);
  //if (pluginDepth > 0) {
  //  console.log(`Early exit if a plugin close is found (${pluginDepth})`);
  //}
  // Per default the root node is a children node to make the code much less
  // complex
  /**
   * The root node of the parse tree to return.
   */
  const rootNode: ParseTreeNode = {
    type: "children",
    children: [],
    originalString: messageString,
  };
  /**
   * A walking child node to process the input string which is per default
   * a text node.
   */
  let currentChildNode: ParseTreeNode = {
    type: "text",
    content: "",
    originalString: "",
  };
  // The following walking variables help to parse the string:
  /**
   * The general parse state.
   */
  let parseState: ParseState = ParseState.TEXT;
  /**
   * An additional parse state helper for certain subroutines.
   */
  let parseStateHelper: ParseStateHelper = ParseStateHelper.NOTHING;
  /**
   * Be able to skip characters while still adding them to the original string.
   */
  let skipCharacterCount = 0;
  /**
   * Track the length of the read substring.
   * TODO Why.
   */
  let lengthOfReadSubstring = 0;
  /**
   * Indicator if there should be an early exit because of a plugin content
   * scope close in a recursive call.
   */
  let earlyExitBecausePluginClosed = false;
  /**
   * Track string references.
   */
  let referenceName = "";
  // Iterate over the whole input message string one character at a time:
  for (const character of messageString) {
    //console.log({
    //  character,
    //  skipCharacterCount,
    //});
    // Update the length and content of the read in substring
    lengthOfReadSubstring++;
    currentChildNode.originalString += character;
    // If for example a substring was read via a recursive call be able to
    // skip this substring while still adding it to the original string
    if (skipCharacterCount > 0) {
      //console.log(`Skip the character '${character}'`);
      skipCharacterCount--;
      continue;
    }
    // Handle the input depending on the current parse state
    switch (parseState) {
      case ParseState.TEXT:
        // If in text state there are 3 special cases in which the character
        // won't be added to the content variable:
        if (character === "$") {
          // 1. If the first part of the indicator of a plugin scope is detected
          parseState = ParseState.TEXT_UNESCAPED_DOLLAR;
        } else if (character === "\\") {
          // 2. If the escape symbol is detected
          parseState = ParseState.TEXT_ESCAPE_SYMBOL;
        } else if (character === ")" && pluginDepth > 0) {
          // 3. If the plugin close symbol is detected and this method call was
          //    a recursive call
          //console.log(
          //  `Early exit parsing because the character '${character}' at depth ${pluginDepth} indicates the closing of a plugin content scope for '${currentChildNode.originalString}'`
          //);
          // Early exit parsing when text is inside a plugin that is closed
          earlyExitBecausePluginClosed = true;
        } else if (
          (character === ")" || character === "|") &&
          pluginDepth > 0 &&
          earlyExitBecausePluginValue
        ) {
          // 4. If the plugin close or content symbol is detected and this
          // method call was a recursive call
          // Early exit parsing when text is inside a plugin value that is
          // closed or expects now a content scope
          earlyExitBecausePluginClosed = true;
        } else {
          currentChildNode.content += character;
        }
        break;
      case ParseState.TEXT_ESCAPE_SYMBOL:
        // If the previous character during text parsing was the escape symbol
        // ignore all special meanings of symbols and add it raw to the detected
        // text content, then go back to parsing text normally
        parseState = ParseState.TEXT;
        currentChildNode.content += character;
        break;
      case ParseState.TEXT_UNESCAPED_DOLLAR:
        // If the previous character during text parsing was the first part of
        // the plugin scope open symbols $( check if a plugin scope is now open
        // or go back to parsing text normally
        if (character === "(") {
          parseStateHelper = ParseStateHelper.PLUGIN_WAS_OPENED;
        } else if (character === "[") {
          parseStateHelper = ParseStateHelper.REFERENCE_WAS_OPENED;
        } else {
          parseState = ParseState.TEXT;
          currentChildNode.content += "$" + character;
        }
        break;
      case ParseState.REFERENCE_NAME:
        if (character === "]") {
          parseStateHelper = ParseStateHelper.REFERENCE_WAS_CLOSED;
        } else {
          referenceName += character;
        }
        break;
      case ParseState.PLUGIN_NAME:
        if (character === "=") {
          parseStateHelper = ParseStateHelper.PLUGIN_VALUE_FOUND;
        } else if (character === "|") {
          parseStateHelper = ParseStateHelper.PLUGIN_CONTENT_FOUND;
        } else if (character === ")") {
          parseStateHelper = ParseStateHelper.PLUGIN_WAS_CLOSED;
        } else {
          currentChildNode.pluginName += character;
        }
        break;
      case ParseState.PLUGIN_VALUE:
        //console.log(`Parse plugin value '${character}'`);
        if (character === "|") {
          parseStateHelper = ParseStateHelper.PLUGIN_CONTENT_FOUND;
        } else if (character === ")") {
          parseStateHelper = ParseStateHelper.PLUGIN_WAS_CLOSED;
        } else {
          throw Error(
            `Plugin value found that should not exist: '${character}' (${JSON.stringify(
              currentChildNode.pluginValue
            )})`
          );
        }
        break;
      case ParseState.PLUGIN_CONTENT:
        //console.log(`Parse plugin content '${character}'`);
        if (character === ")") {
          parseStateHelper = ParseStateHelper.PLUGIN_WAS_CLOSED;
        } else {
          throw Error(
            `Plugin content found that should not exist: '${character}' (${JSON.stringify(
              currentChildNode.pluginContent
            )})`
          );
        }
        break;
    }
    //console.log({
    //  first: true,
    //  character,
    //  parseState,
    //  parseStateHelper,
    //  pluginDepth,
    //  messageString,
    //  rootNode: JSON.stringify(rootNode),
    //  currentChildNode: JSON.stringify(currentChildNode),
    //  earlyExitBecausePluginClosed,
    //});
    // Certain routines need to be done for multiple states which is why there
    // is an additional parse state helper
    switch (parseStateHelper) {
      case ParseStateHelper.NOTHING:
        break;
      case ParseStateHelper.PLUGIN_WAS_OPENED:
        parseStateHelper = ParseStateHelper.NOTHING;
        // If a plugin scope opening was detected continue parsing the plugin
        // name
        parseState = ParseState.PLUGIN_NAME;
        // And increase the plugin depth by 1
        pluginDepth++;
        // If the current walking node has content that is not the empty string
        // add it to the root node before doing anything:
        if (currentChildNode.type !== "text") {
          throw Error("A plugin was opened while not being in text type");
        }
        if (
          currentChildNode.content !== undefined &&
          currentChildNode.content.length > 0
        ) {
          rootNode.children?.push({
            ...currentChildNode,
            // Remove the begin of the plugin scope open from the string
            originalString: currentChildNode.originalString.slice(0, -2),
          });
        }
        // Now that all previously recorded content was pushed to the root node
        // we can reset the current child node as a plugin node:
        currentChildNode = {
          type: "plugin",
          pluginName: "",
          // Add the begin of the plugin scope open to the string
          originalString: "$(",
        };
        break;
      case ParseStateHelper.PLUGIN_VALUE_FOUND:
        parseStateHelper = ParseStateHelper.NOTHING;
        // If plugin value is found parse this content in a recursive call
        // that stops parsing the content as soon as the plugin close indicator
        // or content indicator is detected
        currentChildNode.pluginValue = createParseTree(
          // Remove the parsed substring from the input string
          messageString.slice(lengthOfReadSubstring),
          strings,
          pluginDepth,
          true,
          stringDepth,
          logger
        );
        //console.log(
        //  `Determined pluginValue from '${messageString.slice(
        //    lengthOfReadSubstring
        //  )}' as '${
        //    currentChildNode.pluginValue.originalString
        //  }': ${JSON.stringify(currentChildNode.pluginContent)}`
        //);
        skipCharacterCount +=
          currentChildNode.pluginValue.originalString.length;
        parseState = ParseState.PLUGIN_VALUE;
        break;
      case ParseStateHelper.PLUGIN_CONTENT_FOUND:
        parseStateHelper = ParseStateHelper.NOTHING;
        // If plugin content is found parse this content in a recursive call
        // that stops parsing the content as soon as the plugin close indicator
        // is detected
        currentChildNode.pluginContent = createParseTree(
          // Remove the parsed substring from the input string
          messageString.slice(lengthOfReadSubstring),
          strings,
          pluginDepth,
          undefined,
          stringDepth,
          logger
        );
        //console.log(
        //  `Determined pluginContent from '${messageString.slice(
        //    lengthOfReadSubstring
        //  )}' as '${
        //    currentChildNode.pluginContent.originalString
        //  }': ${JSON.stringify(currentChildNode.pluginContent)}`
        //);
        skipCharacterCount +=
          currentChildNode.pluginContent.originalString.length;
        parseState = ParseState.PLUGIN_CONTENT;
        break;
      case ParseStateHelper.PLUGIN_WAS_CLOSED:
        parseStateHelper = ParseStateHelper.NOTHING;
        // If a plugin scope close was detected parse now text
        parseState = ParseState.TEXT;
        // And decrease the plugin depth by 1
        pluginDepth--;
        // If a plugin is closed the current child plugin node needs to be added
        // to the root node
        rootNode.children?.push({ ...currentChildNode });
        // Now prepare the current child node for new text content
        currentChildNode = {
          type: "text",
          content: "",
          originalString: "",
        };
        break;
      case ParseStateHelper.REFERENCE_WAS_OPENED:
        parseStateHelper = ParseStateHelper.NOTHING;
        // Prevent stack overflows when string references have loop
        if (stringDepth > MAX_STRING_DEPTH) {
          throw Error(
            "The maximum string depth was reached, most likely there is a loop!"
          );
        }
        // And increase the plugin depth by 1
        stringDepth++;
        // If the current walking node has content that is not the empty string
        // add it to the root node before doing anything:
        if (currentChildNode.type !== "text") {
          throw Error("A reference was found while not being in text type");
        }
        if (
          currentChildNode.type === "text" &&
          currentChildNode.content !== undefined &&
          currentChildNode.content.length > 0
        ) {
          rootNode.children?.push({
            ...currentChildNode,
            // Remove the begin of the reference scope open from the string
            originalString: currentChildNode.originalString.slice(0, -2),
          });
        }
        parseState = ParseState.REFERENCE_NAME;
        referenceName = "";
        break;
      case ParseStateHelper.REFERENCE_WAS_CLOSED:
        parseStateHelper = ParseStateHelper.NOTHING;
        // eslint-disable-next-line no-case-declarations
        const referenceString = strings.get(referenceName);
        if (referenceString === undefined) {
          throw Error(
            `The reference '${referenceName}' from '${messageString}' was not found`
          );
        }
        // eslint-disable-next-line no-case-declarations
        const referenceParseTree = createParseTree(
          referenceString,
          strings,
          undefined,
          undefined,
          stringDepth,
          logger
        );
        //console.log(
        //  `Reference parse tree: ${JSON.stringify(
        //    referenceParseTree
        //  )} from ${referenceName}=>${referenceString}`
        //);
        rootNode.children?.push(referenceParseTree);
        // If a reference scope close was detected parse now text
        parseState = ParseState.TEXT;
        currentChildNode = {
          type: "text",
          content: "",
          originalString: "",
        };
        break;
    }
    //console.log({
    //  second: true,
    //  character,
    //  parseState,
    //  parseStateHelper,
    //  pluginDepth,
    //  messageString,
    //  rootNode: JSON.stringify(rootNode),
    //  currentChildNode: JSON.stringify(currentChildNode),
    //  earlyExitBecausePluginClosed,
    //});
    if (earlyExitBecausePluginClosed) {
      //console.log(
      //  `Early exited parsing because of a plugin content scope close for '${currentChildNode.originalString}'`
      //);
      break;
    }
  }
  if (parseState !== ParseState.TEXT) {
    throw Error(
      `Message is invalid! Final parse state was "${parseState}" (${JSON.stringify(
        { rootNode, currentChildNode }
      )})`
    );
  }
  // If there is content that was not yet added to the root node add it now
  if (
    currentChildNode.type === "text" &&
    currentChildNode.content !== undefined &&
    currentChildNode.content.length > 0
  ) {
    rootNode.children?.push({
      ...currentChildNode,
      // In case that there was an early exit because of a plugin close remove
      // the trailing plugin close symbol from the original string of the node
      originalString: earlyExitBecausePluginClosed
        ? currentChildNode.originalString.slice(0, -1)
        : currentChildNode.originalString,
    });
  }
  // Finally check if the root node has exactly 1 child, if yes don't return the
  // root node but its only child to keep the size of the parse tree minimal:
  let nodeToReturn = rootNode;
  // Fix original string
  let fixedOriginalString = nodeToReturn.originalString;
  if (earlyExitBecausePluginClosed) {
    //console.log(
    //  `Rename original string because of early exit from '${
    //    nodeToReturn.originalString
    //  }' to '${messageString.slice(0, lengthOfReadSubstring - 1)}'`
    //);
    fixedOriginalString = messageString.slice(0, lengthOfReadSubstring - 1);
  }
  if (rootNode.children?.length === 1) {
    nodeToReturn = rootNode.children[0];
  }
  nodeToReturn.originalString = fixedOriginalString;
  return nodeToReturn;
};

// A plugin can have a scope in which special plugins can be defined
// They output a tuple list of macro value and macro output or just a string
export type PluginFunc = (
  logger: Logger,
  value?: string
) => Promise<MacroDictionaryEntry[] | string> | MacroDictionaryEntry[] | string;
export type Plugins = Map<string, PluginFunc>;
// A macro is a simple text replace dictionary
export type MacroDictionaryEntry = [string, string];
export type MacroDictionary = Map<string, string>;
export type Macros = Map<string, MacroDictionary>;

const replaceMacros = (text: string, macros: Macros) => {
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
  plugins: Plugins,
  macros: Macros,
  logger: Logger
): Promise<string> => {
  const logMessageParser = createLogFunc(logger, LOG_ID_MODULE_MESSAGE_PARSER, {
    subsection: "parse_tree_node",
  });

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
          `Parse tree node '${treeNode.type}' plugin name was not found ('${
            treeNode.originalString
          }',[${Array.from(plugins.entries())
            .map((a) => a[0])
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
        throw Error(
          `Parse tree node '${
            treeNode.type
          }' could not produce plugin value string ('${
            treeNode.originalString
          }',${(err as Error).message})`
        );
      }
      // eslint-disable-next-line no-case-declarations
      let pluginOutput;
      try {
        // TODO Think about a cache implementation
        pluginOutput = await plugin(logger, pluginValueString);
      } catch (err) {
        logMessageParser.error(err as Error);
        throw Error(
          `Parse tree node '${
            treeNode.type
          }' could not produce plugin output (${treeNode.originalString},${
            (err as Error).message
          })`
        );
      }
      if (Array.isArray(pluginOutput)) {
        for (const macro of pluginOutput) {
          if (!macros.has(pluginName)) {
            macros.set(pluginName, new Map());
          }
          macros.get(pluginName)?.set(macro[0], macro[1]);
        }
        const pluginContentNode = treeNode.pluginContent;
        if (pluginContentNode === undefined) {
          throw Error(
            `Parse tree node '${treeNode.type}' had no plugin content (${treeNode.originalString})`
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parseTreeNode(pluginContentNode, plugins, macros, logger);
      } else {
        return pluginOutput;
      }
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

export const messageParser = async (
  messageString: undefined | string,
  strings: Strings = new Map(),
  plugins: Plugins = new Map(),
  macros: Macros = new Map(),
  logger: Logger
) => {
  const logMessageParser = createLogFunc(logger, LOG_ID_MODULE_MESSAGE_PARSER);

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
    throw Error(
      `There was an error parsing the message string '${messageString}': ${
        (err as Error).message
      }`
    );
  }
};

export const messageParserById = async (
  stringId: string,
  strings: Strings,
  plugins: Plugins = new Map(),
  macros: Macros = new Map(),
  logger: Logger
) => {
  const stringFromId = strings.get(stringId);
  if (stringFromId === undefined) {
    throw Error(`Message string could not be found via its ID '${stringId}'`);
  }
  return await messageParser(stringFromId, strings, plugins, macros, logger);
};

export const generatePluginsAndMacrosMap = (
  plugins: MessageParserPlugin[],
  macros: MessageParserMacro[]
) => {
  const pluginsMap: Plugins = new Map();
  for (const plugin of plugins) {
    pluginsMap.set(plugin.id, plugin.func);
  }
  const macrosMap: Macros = new Map();
  for (const macro of macros) {
    macrosMap.set(macro.id, macro.values);
  }
  return {
    pluginsMap,
    macrosMap,
  };
};

export const generatePluginAndMacroDocumentation = async (
  strings: Strings,
  plugins: MessageParserPlugin[],
  macros: MessageParserMacro[],
  logger: Logger
) => {
  const maps = generatePluginsAndMacrosMap(plugins, macros);
  const pluginsMap = maps.pluginsMap;
  const macrosMap = maps.macrosMap;
  const output: FileDocumentationParts[] = [];
  output.push({
    type: FileDocumentationPartType.HEADING,
    title: "Supported Plugins",
  });
  if (plugins.length === 0) {
    output.push({
      type: FileDocumentationPartType.TEXT,
      content: "None",
    });
  }
  const pluginEntries: FileDocumentationPartValue[] = [];
  for (const plugin of plugins) {
    const pluginEntry: FileDocumentationPartValue = {
      type: FileDocumentationPartType.VALUE,
      prefix: ">",
      description: plugin.description,
      title: `$(${plugin.id})`,
    };
    if (plugin.examples && plugin.examples.length > 0) {
      pluginEntry.lists = [];
      const pluginListExamples = [];
      for (const example of plugin.examples) {
        let exampleString = "";
        if (example.before) {
          exampleString += example.before;
        }
        exampleString += `$(${plugin.id}`;
        if (example.argument) {
          exampleString += `=${example.argument}`;
        }
        if (example.scope) {
          exampleString += `|${example.scope}`;
        }
        exampleString += ")";
        if (example.after) {
          exampleString += example.after;
        }
        const exampleStringOutput = await messageParser(
          exampleString,
          strings,
          pluginsMap,
          macrosMap,
          logger
        );
        pluginListExamples.push(
          `"${exampleString}" => "${exampleStringOutput}"`
        );
      }
      pluginEntry.lists.push(["Examples", pluginListExamples]);
    }
    pluginEntries.push(pluginEntry);
  }
  output.push(
    ...pluginEntries.sort((a, b) => genericStringSorter(a.title, b.title))
  );
  output.push({
    type: FileDocumentationPartType.NEWLINE,
    count: 1,
  });
  output.push({
    type: FileDocumentationPartType.HEADING,
    title: "Supported Macros",
  });
  if (macros.length === 0) {
    output.push({
      type: FileDocumentationPartType.TEXT,
      content: "None",
    });
  }
  const macroEntries: FileDocumentationPartValue[] = [];
  for (const macro of macros) {
    const macroEntry: FileDocumentationPartValue = {
      type: FileDocumentationPartType.VALUE,
      prefix: ">",
      description: macro.description,
      title: `%${macro.id}:KEY%`,
    };
    macroEntry.lists = [];
    const macroListKeys = [];
    for (const [key] of macro.values.entries()) {
      const macroString = `%${macro.id}:${key}%`;
      const macroStringOutput = await messageParser(
        macroString,
        strings,
        pluginsMap,
        macrosMap,
        logger
      );
      macroListKeys.push(`"${macroString}" => "${macroStringOutput}"`);
    }
    macroEntry.lists.push(["Keys", macroListKeys]);
    macroEntries.push(macroEntry);
  }
  output.push(
    ...macroEntries.sort((a, b) => genericStringSorter(a.title, b.title))
  );

  return output;
};
