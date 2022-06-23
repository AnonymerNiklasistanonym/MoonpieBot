import { PluginFunc } from "../messageParser";

export interface MessageParserPlugin {
  name: string;
  func: PluginFunc;
}
