interface ParseTreeNode {
  originalString: string;
  type: "text" | "children" | "macro";
  content?: string;
  macroName?: string;
  macroValue?: string;
  macroContent?: ParseTreeNode;
  children?: ParseTreeNode[];
}

/**
 * There are multiple parse states.
 *
 * @example ```
 * this is text \$ with an escaped dollar
 * ```
 * @example ```
 * $(macro_name)
 * ```
 * @example ```
 * $(macro_name|macro content)
 * ```
 * @example ```
 * $(macro_name=macro_value|a $(macro_name) in a macro)
 * ```
 */
enum ParseState {
  TEXT = "TEXT",
  TEXT_ESCAPE_SYMBOL = "TEXT_ESCAPE_SYMBOL",
  TEXT_UNESCAPED_DOLLAR = "TEXT_UNESCAPED_DOLLAR",
  MACRO_NAME = "MACRO_NAME",
  MACRO_VALUE = "MACRO_VALUE",
  MACRO_CONTENT = "MACRO_CONTENT",
  MACRO_CONTENT_ESCAPE_SYMBOL = "MACRO_CONTENT_ESCAPE_SYMBOL",
  MACRO_CONTENT_UNESCAPED_DOLLAR = "MACRO_CONTENT_UNESCAPED_DOLLAR",
}
enum ParseStateHelper {
  NOTHING = "NOTHING",
  MACRO_WAS_OPENED = "MACRO_WAS_OPENED",
  MACRO_WAS_CLOSED = "MACRO_WAS_CLOSED",
}

export const createParseTree = (messageString: string) => {
  // Per default the root node is a text node
  const parseTreeNode: ParseTreeNode = {
    type: "text",
    content: "",
    originalString: messageString,
  };
  // Keep track of the current original string
  let originalString = "";
  // Keep track of the current text
  let content = "";
  // Keep track of the current macro
  let macroName = "";
  let macroValue = undefined;
  let macroContent = undefined;
  // Keep track of macros in macros
  let macroDepth = 0;
  let parseState: ParseState = ParseState.TEXT;
  let parseStateHelper: ParseStateHelper = ParseStateHelper.NOTHING;
  for (const character of messageString) {
    originalString += character;
    switch (parseState) {
      case ParseState.TEXT:
        if (character === "$") {
          parseState = ParseState.TEXT_UNESCAPED_DOLLAR;
        } else if (character === "\\") {
          parseState = ParseState.TEXT_ESCAPE_SYMBOL;
        } else {
          content += character;
        }
        break;
      case ParseState.TEXT_ESCAPE_SYMBOL:
        parseState = ParseState.TEXT;
        content += character;
        break;
      case ParseState.TEXT_UNESCAPED_DOLLAR:
        if (character === "(") {
          parseState = ParseState.MACRO_NAME;
          macroDepth++;
          parseStateHelper = ParseStateHelper.MACRO_WAS_OPENED;
        } else {
          parseState = ParseState.TEXT;
          content += "$" + character;
        }
        break;
      case ParseState.MACRO_NAME:
        if (character === "=") {
          parseState = ParseState.MACRO_VALUE;
          macroValue = "";
        } else if (character === "|") {
          parseState = ParseState.MACRO_CONTENT;
          macroContent = "";
        } else if (character === ")") {
          macroDepth--;
          parseStateHelper = ParseStateHelper.MACRO_WAS_CLOSED;
        } else {
          macroName += character;
        }
        break;
      case ParseState.MACRO_VALUE:
        if (character === "|") {
          parseState = ParseState.MACRO_CONTENT;
          macroContent = "";
        } else if (character === ")") {
          macroDepth--;
          parseStateHelper = ParseStateHelper.MACRO_WAS_CLOSED;
        } else {
          macroValue += character;
        }
        break;
      case ParseState.MACRO_CONTENT:
        if (character === "$") {
          parseState = ParseState.MACRO_CONTENT_UNESCAPED_DOLLAR;
        } else if (character === "\\") {
          parseState = ParseState.MACRO_CONTENT_ESCAPE_SYMBOL;
        } else if (character === ")") {
          macroDepth--;
          parseStateHelper = ParseStateHelper.MACRO_WAS_CLOSED;
        } else {
          macroContent += character;
        }
        break;
      case ParseState.MACRO_CONTENT_ESCAPE_SYMBOL:
        parseState = ParseState.MACRO_CONTENT;
        macroContent += character;
        break;
      case ParseState.MACRO_CONTENT_UNESCAPED_DOLLAR:
        if (character === "(") {
          parseState = ParseState.MACRO_NAME;
          macroName = "";
          // Increase macro depth
          macroDepth++;
        } else {
          parseState = ParseState.MACRO_CONTENT;
          macroContent += "$" + character;
        }
        break;
    }
    switch (parseStateHelper) {
      case ParseStateHelper.NOTHING:
        break;
      case ParseStateHelper.MACRO_WAS_OPENED:
        parseStateHelper = ParseStateHelper.NOTHING;
        // If a new macro is opened 2 things need to be done:
        // 1. Determine if the macro was opened on depth 0
        //    In that case we need to convert the root node to a children
        //    node if not already and add the current content as child node
        // 2. If the macro was not opened on depth 0 but higher
        //    In that case we collect all content as macro content text and then
        //    when we reach depth 0 again we recursively call this method with
        //    that string again.
        if (macroDepth === 1) {
          if (
            parseTreeNode.type === "text" &&
            parseTreeNode.content !== undefined &&
            parseTreeNode.content.length > 0
          ) {
            parseTreeNode.type = "children";
            parseTreeNode.children = [
              {
                type: "text",
                content: parseTreeNode.content,
                originalString: parseTreeNode.originalString,
              },
            ];
            parseTreeNode.content = undefined;
          }
          parseTreeNode.type = "children";
          parseTreeNode.content = undefined;
          if (parseTreeNode.children === undefined) {
            parseTreeNode.children = [];
          }
          if (content.length > 0) {
            parseTreeNode.children.push({
              type: "text",
              content,
              originalString: originalString.slice(0, -2),
            });
            originalString = "$(";
            content = "";
          }
        } else {
          macroName = "";
          macroValue = undefined;
        }
        break;
      case ParseStateHelper.MACRO_WAS_CLOSED:
        parseStateHelper = ParseStateHelper.NOTHING;
        // If a macro is closed 2 things need to be done:
        // 1. Determine if the macro was closed on depth 0
        //    In that case we need to convert the root node to a children
        //    node if not already and add the current macro as child node
        // 2. If the macro was not closed on depth 0 but higher
        //    In that case we collect all content as macro content text and then
        //    when we reach depth 0 again we recursively call this method with
        //    that string again.
        if (macroDepth === 0) {
          // If its not a macro inside macro content parse as text now
          parseState = ParseState.TEXT;
          // Add the current content as a child:
          if (
            parseTreeNode.type !== "children" &&
            parseTreeNode.content &&
            parseTreeNode.content.trim().length > 0
          ) {
            parseTreeNode.type = "children";
            parseTreeNode.children = [
              {
                type: parseTreeNode.type,
                content: parseTreeNode.content,
                macroName: parseTreeNode.macroName,
                macroValue: parseTreeNode.macroValue,
                macroContent: parseTreeNode.macroContent,
                originalString: parseTreeNode.originalString,
              },
            ];
            parseTreeNode.content = undefined;
            parseTreeNode.macroName = undefined;
            parseTreeNode.macroValue = undefined;
            parseTreeNode.macroContent = undefined;
          }
          // Since the macro scope is now closed add the macro:
          if (parseTreeNode.children === undefined) {
            parseTreeNode.children = [];
          }
          parseTreeNode.children.push({
            type: "macro",
            macroName,
            macroValue,
            macroContent:
              macroContent === undefined
                ? undefined
                : createParseTree(macroContent),
            originalString,
          });
          originalString = "";
        } else {
          // If its a macro inside macro content parse as macro content
          parseState = ParseState.MACRO_CONTENT;
        }
        break;
    }
  }
  if (parseState !== ParseState.TEXT) {
    throw Error(`Message is invalid! Final parse state was "${parseState}"`);
  }
  // If there is content that was not yet added to the node add it now
  if (content.trim().length > 0) {
    switch (parseTreeNode.type) {
      case "macro":
      case "children":
        if (parseTreeNode.children === undefined) {
          parseTreeNode.children = [];
        }
        parseTreeNode.children.push({
          type: "text",
          content: `${content}`,
          originalString: `${content}`,
          children: [],
        });
        break;
      case "text":
        parseTreeNode.content = content;
        break;
    }
  }
  return parseTreeNode;
};

// A plugin can have a scope in which special macros can be defined
// They output a tuple list of macro value and macro output or just a string
export type PluginFunc = (
  value?: string
) => Promise<[string, string][] | string>;
export type Plugins = Map<string, PluginFunc>;
// A macro is a simple text replace dictionary
export type MacroDictionary = Map<string, string>;
export type Macros = Map<string, MacroDictionary>;

export const parseTreeNode = async (
  treeNode: ParseTreeNode,
  plugins: Plugins,
  macros: Macros
): Promise<string> => {
  switch (treeNode.type) {
    case "text":
      if (treeNode.content === undefined) {
        throw Error("Macro text content was not found");
      }
      return treeNode.content.replace(
        /%([^:]+?):([^:]+?)%/g,
        (_fullMatch, macroName, macroValue) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const macro = macros.get(macroName);
          if (macro === undefined) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw Error(`Macro (${macroName}) was not found`);
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const macroOutput = macro.get(macroValue);
          if (macroOutput === undefined) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw Error(`Macro (${macroName}:${macroValue}) was not found`);
          }
          return macroOutput;
        }
      );
    case "macro":
      // Run macro
      // eslint-disable-next-line no-case-declarations
      const pluginName = treeNode.macroName;
      if (pluginName === undefined) {
        throw Error("Plugin name is undefined");
      }
      // eslint-disable-next-line no-case-declarations
      const plugin = plugins.get(pluginName);
      if (plugin === undefined) {
        throw Error(`Plugin (${pluginName}) was not found`);
      }
      // eslint-disable-next-line no-case-declarations
      const pluginOutput = await plugin(treeNode.macroValue);
      if (Array.isArray(pluginOutput)) {
        for (const macro of pluginOutput) {
          if (!macros.has(pluginName)) {
            macros.set(pluginName, new Map());
          }
          macros.get(pluginName)?.set(macro[0], macro[1]);
        }
        const macroContentNode = treeNode.macroContent;
        if (macroContentNode === undefined) {
          throw Error(`Macro content (${pluginName}) was undefined`);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parseTreeNode(macroContentNode, plugins, macros);
      } else {
        return pluginOutput;
      }
    case "children":
      if (treeNode.children === undefined) {
        throw Error(`Parse tree children were undefined`);
      }
      // eslint-disable-next-line no-case-declarations
      let output = "";
      for (const childNode of treeNode.children) {
        output += await parseTreeNode(childNode, plugins, macros);
      }
      return output;
  }
};

export const messageParser = async (
  messageString: string,
  plugins: Plugins,
  macros: Macros
) => {
  // 1. Create parse tree
  const parseTreeNodeRoot = createParseTree(messageString);
  console.log(JSON.stringify(parseTreeNodeRoot));
  // 2. Parse parse tree from top down
  return await parseTreeNode(parseTreeNodeRoot, plugins, macros);
};
