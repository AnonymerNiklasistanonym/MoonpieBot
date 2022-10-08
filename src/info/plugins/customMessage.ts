// Type imports
import {
  createMessageParserMessage,
  MessageForParserMessageElements,
  MessageParserPluginGenerator,
} from "../../messageParser";

export interface PluginCustomMessageData {
  messageParserInput: MessageForParserMessageElements[];
}

export const pluginCustomMessageGenerator: MessageParserPluginGenerator<PluginCustomMessageData> =
  {
    description: "Set a global custom command data value",
    generate: (data) => () =>
      createMessageParserMessage(data.messageParserInput, true),
    id: "CUSTOM_MESSAGE",
    signature: {
      type: "signature",
    },
  };
