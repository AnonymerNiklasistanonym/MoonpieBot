/**
 * Errorcodes that can be attached to {@link ParseTreeNodeError}.
 */
export enum ParseTreeNodeErrorCode {
  MACRO_ERROR = "MACRO_ERROR",
  MACRO_NOT_FOUND = "MACRO_NOT_FOUND",
  NO_CHILDREN = "NO_CHILDREN",
  NO_CONTENT = "NO_CONTENT",
  NO_PLUGIN_CONTENT = "NO_PLUGIN_CONTENT",
  NO_PLUGIN_CONTENT_AND_VALUE = "NO_PLUGIN_CONTENT_AND_VALUE",
  NO_PLUGIN_NAME = "NO_PLUGIN_NAME",
  PLUGIN_ERROR = "PLUGIN_ERROR",
  PLUGIN_NOT_FOUND = "PLUGIN_NOT_FOUND",
}

/**
 * An error that should be thrown if there if a logic or internal error was
 * detected when parsing a tree node.
 */
export class ParseTreeNodeError extends Error {
  public code: ParseTreeNodeErrorCode;
  public pluginError?: string;
  public macroError?: string;
  constructor(
    message: string,
    code: ParseTreeNodeErrorCode,
    pluginError?: string,
    macroError?: string,
  ) {
    super(message);
    this.code = code;
    this.pluginError = pluginError;
    this.macroError = macroError;
  }
}
