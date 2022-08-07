import {
  author,
  bugTrackerUrl,
  description,
  license,
  name,
  sourceCodeUrl,
} from "../../info/general";
import { getVersion } from "../../version";
// Type imports
import type { MessageParserMacro } from "../macros";

export enum MacroMoonpieBot {
  NAME = "NAME",
  VERSION = "VERSION",
  AUTHOR = "AUTHOR",
  DESCRIPTION = "DESCRIPTION",
  URL = "URL",
  LICENSE = "LICENSE",
  BUG_TRACKER = "BUG_TRACKER",
}

export const macroMoonpieBot: MessageParserMacro = {
  id: "MOONPIEBOT",
  values: new Map([
    [MacroMoonpieBot.NAME, name],
    [MacroMoonpieBot.VERSION, getVersion()],
    [MacroMoonpieBot.AUTHOR, author],
    [MacroMoonpieBot.DESCRIPTION, description],
    [MacroMoonpieBot.URL, sourceCodeUrl],
    [MacroMoonpieBot.LICENSE, license],
    [MacroMoonpieBot.BUG_TRACKER, bugTrackerUrl],
  ]),
};
