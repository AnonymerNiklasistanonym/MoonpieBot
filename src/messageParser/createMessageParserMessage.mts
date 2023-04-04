// Type imports
import type {
  MessageParserMacro,
  MessageParserMacroDocumentation,
} from "./macros.mjs";
import type { StringEntry } from "./strings.mjs";

interface MessageForParserMessageElement {
  type: string;
}
export type MessageForParserMessageElements<
  MACRO_ENUM extends string = string,
> =
  | string
  | MessageForParserMessageMacro<MACRO_ENUM>
  | MessageForParserMessagePlugin
  | MessageForParserMessageReference;

export interface MessageForParserMessagePlugin<
  MACRO_ENUM extends string = string,
> extends MessageForParserMessageElement {
  args?:
    | MessageForParserMessageElements<MACRO_ENUM>[]
    | MessageForParserMessageElements<MACRO_ENUM>;
  name: string;
  scope?:
    | MessageForParserMessageElements<MACRO_ENUM>[]
    | MessageForParserMessageElements<MACRO_ENUM>;
  type: "plugin";
}

export interface MessageForParserMessageMacro<
  MACRO_ENUM extends string = string,
> extends MessageForParserMessageElement {
  key: MACRO_ENUM;
  name: string;
  type: "macro";
}

export interface MessageForParserMessageReference
  extends MessageForParserMessageElement {
  name: string;
  type: "reference";
}

export const generateMessageParserMessageMacro = <MACRO_ENUM extends string>(
  macro:
    | MessageParserMacro<MACRO_ENUM>
    | MessageParserMacroDocumentation<MACRO_ENUM>,
  key: MACRO_ENUM,
): MessageForParserMessageMacro<MACRO_ENUM> => ({
  key,
  name: macro.id,
  type: "macro",
});

export const generateMessageParserMessageReference = (
  stringEntry: StringEntry,
): MessageForParserMessageReference => ({
  name: stringEntry.id,
  type: "reference",
});

/**
 * Create a message string for the message parser.
 *
 * @param message The message represented by an array of elements to be parsed to a string.
 * @param insidePlugin Set this to true so it can be used inside a plugin (so characters get correctly escaped).
 * @template MACRO_ENUM Represents for type safety all supported macros.
 * @returns The message parser message string.
 */
export const createMessageParserMessage = <MACRO_ENUM extends string = string>(
  message: MessageForParserMessageElements<MACRO_ENUM>[],
  insidePlugin = false,
): string =>
  message
    .map((a) => {
      if (typeof a === "string") {
        if (insidePlugin) {
          return a.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
        }
        return a;
      }
      switch (a.type) {
        case "macro":
          if (a.name === undefined || a.key === undefined) {
            throw Error(
              `Macro name/key was undefined (${JSON.stringify({
                a,
                message,
              })})`,
            );
          }
          return `%${a.name}:${a.key}%`;
        case "reference":
          if (a.name === undefined) {
            throw Error(
              `Reference name was undefined (${JSON.stringify({
                a,
                message,
              })})`,
            );
          }
          return `$[${a.name}]`;
        case "plugin":
          if (a.name === undefined) {
            throw Error(
              `Plugin name was undefined (${JSON.stringify({ a, message })})`,
            );
          }
          // eslint-disable-next-line no-case-declarations
          let pluginText = `$(${a.name}`;
          if (a.args !== undefined) {
            pluginText += `=${createMessageParserMessage(
              Array.isArray(a.args) ? a.args : [a.args],
              true,
            )}`;
          }
          if (a.scope !== undefined) {
            pluginText += `|${createMessageParserMessage(
              Array.isArray(a.scope) ? a.scope : [a.scope],
              true,
            )}`;
          }
          pluginText += ")";
          return pluginText;
        default:
          return "ERROR";
      }
    })
    .join("");
