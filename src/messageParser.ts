import type { Logger } from "winston";

/**
 * The logging ID of this module.
 */
const LOG_ID_MODULE_MESSAGE_PARSER = "message_parser";

interface ParseTreeNode {
  originalString: string;
  content: undefined | string;
  children: ParseTreeNode[];
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
  ESCAPE_SYMBOL = "ESCAPE_SYMBOL",
  UNESCAPED_DOLLAR = "UNESCAPED_DOLLAR",
  MACRO_NAME = "MACRO_NAME",
  MACRO_VALUE = "MACRO_VALUE",
  MACRO_CONTENT = "MACRO_CONTENT",
}

export const createParseTree = (messageString: string) => {
  const currentParseTreeNode: ParseTreeNode = {
    content: "",
    children: [],
    originalString: messageString,
  };
  // Keep track of the current macro
  let macroName = "";
  let macroValue = "";
  let macroContent = "";
  // Keep track of macros in macros
  let macroDepth = 0;
  let parseState: ParseState = ParseState.TEXT;
  for (const character of messageString) {
    switch (parseState) {
      case ParseState.TEXT:
        if (character === "$") {
          parseState = ParseState.UNESCAPED_DOLLAR;
        } else if (character === "\\") {
          parseState = ParseState.ESCAPE_SYMBOL;
        } else {
          currentParseTreeNode.content += character;
        }
        break;
      case ParseState.ESCAPE_SYMBOL:
        currentParseTreeNode.content += character;
        parseState = ParseState.TEXT;
        break;
      case ParseState.UNESCAPED_DOLLAR:
        if (character === "(") {
          parseState = ParseState.MACRO_NAME;
          macroName = "";
        } else {
          currentParseTreeNode.content += character;
          parseState = ParseState.TEXT;
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
          parseState = ParseState.TEXT;
          // TODO Do sth with the macro
        } else {
          macroName += character;
        }
        break;
      case ParseState.MACRO_VALUE:
        if (character === "|") {
          parseState = ParseState.MACRO_CONTENT;
          macroContent = "";
        } else if (character === ")") {
          parseState = ParseState.TEXT;
          // TODO Do sth with the macro
        } else {
          macroValue += character;
        }
        break;
      case ParseState.MACRO_CONTENT:
        if (character === ")") {
          parseState = ParseState.TEXT;
          // TODO Do sth with the macro
        } else {
          macroContent += character;
        }
        break;
    }
  }
};

export const messageParser = async (
  messageString: string,
  plugins: Map<string, (value?: string) => Promise<string>>,
  logger: Logger
) => {
  // 1. Create parse tree
  const root: ParseTreeNode = {
    originalString: messageString,
  };
  // 2. Parse parse tree from top down
};
