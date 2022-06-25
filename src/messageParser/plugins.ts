import { PluginFunc } from "../messageParser";

export interface MessageParserPluginExample {
  before?: string;
  argument?: string;
  scope?: string;
  after?: string;
}

export interface MessageParserPlugin {
  id: string;
  description?: string;
  examples?: MessageParserPluginExample[];
  func: PluginFunc;
}
