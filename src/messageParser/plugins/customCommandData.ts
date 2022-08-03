import type { MessageParserPlugin } from "../plugins";

import type { CustomCommandsJson } from "../../other/customCommand";

const customCommandGlobalDataLogic = (
  content: undefined | string,
  type: "==" | "<>" | "+=" | "-=",
  customCommands: CustomCommandsJson
): string => {
  // Check if the content string has two elements, otherwise throw error
  if (content === undefined || content.trim().length === 0) {
    throw Error("Plugin argument was empty");
  }
  const args = content
    .trim()
    .split(type)
    .map((a) => a.trim());
  if (args.length !== 2) {
    throw Error(
      `Plugin argument format incorrect (it should be 'name${type}value')`
    );
  }
  let value: string | number = args[1];
  try {
    const numberValue = parseInt(args[1]);
    value = numberValue;
  } catch (err) {
    // Ignore error if the operation doesn't require a number
    if (type === "+=" || type === "-=") {
      throw Error(`Plugin argument should '${args[1]}' is not a number`);
    }
  }
  if (customCommands.globalData === undefined) {
    customCommands.globalData = [];
  }
  const indexGlobalData = customCommands.globalData.findIndex(
    (a) => a.id === args[0]
  );
  switch (type) {
    case "==":
      if (indexGlobalData > -1) {
        // eslint-disable-next-line security/detect-object-injection
        customCommands.globalData[indexGlobalData].value = value;
      } else {
        customCommands.globalData.push({
          id: args[0],
          value,
        });
      }
      return args[1];
    case "<>":
      if (indexGlobalData > -1) {
        // eslint-disable-next-line security/detect-object-injection
        return `${customCommands.globalData[indexGlobalData].value}`;
      }
      customCommands.globalData.push({
        id: args[0],
        value,
      });
      return `${value}`;
    case "+=":
    case "-=":
      if (indexGlobalData > -1) {
        // eslint-disable-next-line no-case-declarations, security/detect-object-injection
        const existingNumber = customCommands.globalData[indexGlobalData].value;
        if (typeof existingNumber !== "number") {
          throw Error(
            `Global custom command data with id='${args[0]}' (value='${existingNumber}') is not a number`
          );
        }
        if (typeof value !== "number") {
          throw Error(
            `Global custom command data argument with id='${args[0]}' (value='${value}') is not a number`
          );
        }
        if (type === "+=") {
          // eslint-disable-next-line security/detect-object-injection
          customCommands.globalData[indexGlobalData].value =
            existingNumber + value;
        } else if (type === "-=") {
          // eslint-disable-next-line security/detect-object-injection
          customCommands.globalData[indexGlobalData].value =
            existingNumber - value;
        }
        // eslint-disable-next-line security/detect-object-injection
        return `${customCommands.globalData[indexGlobalData].value}`;
      }
      if (type === "+=") {
        customCommands.globalData.push({
          id: args[0],
          value,
        });
        return `${value}`;
      } else if (type === "-=") {
        customCommands.globalData.push({
          id: args[0],
          value: -value,
        });
        return `${-value}`;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw Error(`Unknown type: '${type}'`);
  }
};

export const customCommandDataPlugins = (
  customCommands: CustomCommandsJson
): MessageParserPlugin[] => {
  const plugins: MessageParserPlugin[] = [];

  plugins.push({
    id: "SET_CUSTOM_COMMAND_DATA",
    description: "Set a global custom command data value",
    func: (_logger, content?: string) =>
      customCommandGlobalDataLogic(content, "==", customCommands),
  });
  plugins.push({
    id: "GET_CUSTOM_COMMAND_DATA",
    description: "Get a global custom command data value",
    func: (_logger, content?: string) =>
      customCommandGlobalDataLogic(content, "<>", customCommands),
  });
  plugins.push({
    id: "ADD_CUSTOM_COMMAND_DATA",
    description: "Add a global custom command data value if its a number",
    func: (_logger, content?: string) =>
      customCommandGlobalDataLogic(content, "+=", customCommands),
  });
  plugins.push({
    id: "REMOVE_CUSTOM_COMMAND_DATA",
    description: "Remove a global custom command data value if its a number",
    func: (_logger, content?: string) =>
      customCommandGlobalDataLogic(content, "-=", customCommands),
  });

  return plugins;
};
