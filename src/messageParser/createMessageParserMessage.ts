interface MessageForMessageElement {
  type: string;
}
export type MessageForMessageElements =
  | string
  | MessageForMessageElementMacro
  | MessageForMessageElementPlugin
  | MessageForMessageElementReference;

export interface MessageForMessageElementPlugin
  extends MessageForMessageElement {
  args?: MessageForMessageElements[] | MessageForMessageElements;
  name: string;
  scope?: MessageForMessageElements[] | MessageForMessageElements;
  type: "plugin";
}

export interface MessageForMessageElementMacro
  extends MessageForMessageElement {
  key: string;
  name: string;
  type: "macro";
}

export interface MessageForMessageElementReference
  extends MessageForMessageElement {
  name: string;
  type: "reference";
}

export const createMessageParserMessage = (
  message: MessageForMessageElements[],
  insidePlugin = false
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
              `Macro name/key was undefined (${JSON.stringify({ a, message })})`
            );
          }
          return `%${a.name}:${a.key}%`;
        case "reference":
          if (a.name === undefined) {
            throw Error(
              `Reference name was undefined (${JSON.stringify({ a, message })})`
            );
          }
          return `$[${a.name}]`;
        case "plugin":
          if (a.name === undefined) {
            throw Error(
              `Plugin name was undefined (${JSON.stringify({ a, message })})`
            );
          }
          // eslint-disable-next-line no-case-declarations
          let pluginText = `$(${a.name}`;
          if (a.args !== undefined) {
            pluginText += `=${createMessageParserMessage(
              Array.isArray(a.args) ? a.args : [a.args],
              true
            )}`;
          }
          if (a.scope !== undefined) {
            pluginText += `|${createMessageParserMessage(
              Array.isArray(a.scope) ? a.scope : [a.scope],
              true
            )}`;
          }
          pluginText += ")";
          return pluginText;
        default:
          return "ERROR";
      }
    })
    .join("");
