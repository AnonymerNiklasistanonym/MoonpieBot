import type { MessageParserPlugin } from "../plugins";

import type { CustomCommandDataJson } from "../../other/customCommand";

export const customCommandDataPlugins = (
  customCommands: CustomCommandDataJson
): MessageParserPlugin[] => {
  const plugins: MessageParserPlugin[] = [];

  plugins.push({
    id: "SET_CUSTOM_COMMAND_DATA",
    description: "Set a global custom command data value",
    func: (_logger, content?: string) => {
      // Check if the content string has two elements, otherwise throw error
      if (content === undefined || content.trim().length === 0) {
        throw Error("Argument was empty");
      }
      const argumentsSet = content.trim().split("==");
      if (argumentsSet.length !== 2) {
        throw Error("Argument format incorrect (it should be 'name==value')");
      }
      let value: string | number = argumentsSet[1];
      try {
        const numberValue = parseInt(argumentsSet[1]);
        value = numberValue;
      } catch (err) {
        // ignore error, its a string
      }
      if (customCommands.commandGlobalData === undefined) {
        customCommands.commandGlobalData = [];
      }
      const index = customCommands.commandGlobalData.findIndex(
        (a) => a.id === argumentsSet[0]
      );
      if (index > -1) {
        // eslint-disable-next-line security/detect-object-injection
        customCommands.commandGlobalData[index].value = value;
      } else {
        customCommands.commandGlobalData.push({
          id: argumentsSet[0],
          value,
        });
      }
      return argumentsSet[1];
    },
  });
  plugins.push({
    id: "GET_CUSTOM_COMMAND_DATA",
    description: "Get a global custom command data value",
    func: (_logger, content?: string) => {
      // Check if the content string has two elements, otherwise throw error
      if (content === undefined || content.trim().length === 0) {
        throw Error("Argument was empty");
      }
      const argumentsSet = content.trim().split("<>");
      if (argumentsSet.length !== 2) {
        throw Error("Argument format incorrect (it should be 'name<>value')");
      }
      let value: string | number = argumentsSet[1];
      try {
        const numberValue = parseInt(argumentsSet[1]);
        value = numberValue;
      } catch (err) {
        // ignore error, its a string
      }
      if (customCommands.commandGlobalData === undefined) {
        customCommands.commandGlobalData = [];
        customCommands.commandGlobalData.push({
          id: argumentsSet[0].trim(),
          value,
        });
        return argumentsSet[1];
      }
      const index = customCommands.commandGlobalData.findIndex(
        (a) => a.id === argumentsSet[0].trim()
      );
      if (index > -1) {
        // eslint-disable-next-line security/detect-object-injection
        return `${customCommands.commandGlobalData[index].value}`;
      }
      customCommands.commandGlobalData.push({
        id: argumentsSet[0].trim(),
        value,
      });
      return argumentsSet[1].trim();
    },
  });
  plugins.push({
    id: "ADD_CUSTOM_COMMAND_DATA",
    description: "Add a global custom command data value if its a number",
    func: (_logger, content?: string) => {
      // Check if the content string has two elements, otherwise throw error
      if (content === undefined || content.trim().length === 0) {
        throw Error("Argument was empty");
      }
      const argumentsSet = content.trim().split("+=");
      if (argumentsSet.length !== 2) {
        throw Error("Argument format incorrect (it should be 'name+=value')");
      }
      const numberValue = parseInt(argumentsSet[1]);
      if (customCommands.commandGlobalData === undefined) {
        customCommands.commandGlobalData = [];
      }
      const index = customCommands.commandGlobalData.findIndex(
        (a) => a.id === argumentsSet[0]
      );
      if (index > -1) {
        // eslint-disable-next-line security/detect-object-injection
        const existingNumber = customCommands.commandGlobalData[index].value;
        if (typeof existingNumber !== "number") {
          throw Error(
            `Global custom command data with id='${argumentsSet[0]}' (value='${existingNumber}') is not a number`
          );
        }
        // eslint-disable-next-line security/detect-object-injection
        customCommands.commandGlobalData[index].value =
          existingNumber + numberValue;
        return `${existingNumber + numberValue}`;
      } else {
        customCommands.commandGlobalData.push({
          id: argumentsSet[0],
          value: numberValue,
        });
      }
      return argumentsSet[1];
    },
  });
  plugins.push({
    id: "REMOVE_CUSTOM_COMMAND_DATA",
    description: "Remove a global custom command data value if its a number",
    func: (_logger, content?: string) => {
      // Check if the content string has two elements, otherwise throw error
      if (content === undefined || content.trim().length === 0) {
        throw Error("Argument was empty");
      }
      const argumentsSet = content.trim().split("-=");
      if (argumentsSet.length !== 2) {
        throw Error("Argument format incorrect (it should be 'name-=value')");
      }
      const numberValue = parseInt(argumentsSet[1]);
      if (customCommands.commandGlobalData === undefined) {
        customCommands.commandGlobalData = [];
      }
      const index = customCommands.commandGlobalData.findIndex(
        (a) => a.id === argumentsSet[0]
      );
      if (index > -1) {
        // eslint-disable-next-line security/detect-object-injection
        const existingNumber = customCommands.commandGlobalData[index].value;
        if (typeof existingNumber !== "number") {
          throw Error(
            `Global custom command data with id='${argumentsSet[0]}' (value='${existingNumber}') is not a number`
          );
        }
        // eslint-disable-next-line security/detect-object-injection
        customCommands.commandGlobalData[index].value =
          existingNumber - numberValue;
        return `${existingNumber - numberValue}`;
      } else {
        customCommands.commandGlobalData.push({
          id: argumentsSet[0],
          value: -numberValue,
        });
      }
      return "-" + argumentsSet[1];
    },
  });

  return plugins;
};
