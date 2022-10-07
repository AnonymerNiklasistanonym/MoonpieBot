import {
  author,
  bugTrackerUrl,
  description,
  license,
  name,
  sourceCodeUrl,
} from "../general";
import { getVersionFromObject } from "../../version";
import { version } from "../version";
// Type imports
import type { MessageParserMacro } from "../../messageParser";

export enum MacroMoonpieBot {
  AUTHOR = "AUTHOR",
  BUG_TRACKER = "BUG_TRACKER",
  DESCRIPTION = "DESCRIPTION",
  LICENSE = "LICENSE",
  NAME = "NAME",
  URL = "URL",
  VERSION = "VERSION",
}
export const macroMoonpieBot: MessageParserMacro = {
  id: "MOONPIEBOT",
  values: new Map(
    Object.values(MacroMoonpieBot).map<[MacroMoonpieBot, string]>((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroMoonpieBot.NAME:
          macroValue = name;
          break;
        case MacroMoonpieBot.VERSION:
          macroValue = getVersionFromObject(version);
          break;
        case MacroMoonpieBot.AUTHOR:
          macroValue = author;
          break;
        case MacroMoonpieBot.DESCRIPTION:
          macroValue = description;
          break;
        case MacroMoonpieBot.URL:
          macroValue = sourceCodeUrl;
          break;
        case MacroMoonpieBot.LICENSE:
          macroValue = license;
          break;
        case MacroMoonpieBot.BUG_TRACKER:
          macroValue = bugTrackerUrl;
          break;
      }
      return [macroId, macroValue];
    })
  ),
};
