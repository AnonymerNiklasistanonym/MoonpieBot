import {
  author,
  bugTrackerUrl,
  description,
  license,
  name,
  sourceCodeUrl,
} from "../../info/general";
import { getVersionFromObject } from "../../version";
import { version } from "../../info/version";
// Type imports
import type { MessageParserMacro } from "../macros";

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
  values: new Map([
    [MacroMoonpieBot.NAME, name],
    [MacroMoonpieBot.VERSION, getVersionFromObject(version)],
    [MacroMoonpieBot.AUTHOR, author],
    [MacroMoonpieBot.DESCRIPTION, description],
    [MacroMoonpieBot.URL, sourceCodeUrl],
    [MacroMoonpieBot.LICENSE, license],
    [MacroMoonpieBot.BUG_TRACKER, bugTrackerUrl],
  ]),
};
