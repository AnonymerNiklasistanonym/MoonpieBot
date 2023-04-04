// Relative imports
import {
  author,
  bugTrackerUrl,
  description,
  displayName,
  license,
  version,
  websiteUrl,
} from "../general.mjs";
import { createMessageParserMacro } from "../../messageParser/macros.mjs";

export enum MacroMoonpieBot {
  AUTHOR = "AUTHOR",
  BUG_TRACKER = "BUG_TRACKER",
  DESCRIPTION = "DESCRIPTION",
  LICENSE = "LICENSE",
  NAME = "NAME",
  URL = "URL",
  VERSION = "VERSION",
}

export const macroMoonpieBot = createMessageParserMacro(
  {
    description: "MoonpieBot information",
    id: "MOONPIEBOT",
  },
  Object.values(MacroMoonpieBot),
  (macroId) => {
    switch (macroId) {
      case MacroMoonpieBot.NAME:
        return displayName;
      case MacroMoonpieBot.VERSION:
        return version;
      case MacroMoonpieBot.AUTHOR:
        return author;
      case MacroMoonpieBot.DESCRIPTION:
        return description;
      case MacroMoonpieBot.URL:
        return websiteUrl;
      case MacroMoonpieBot.LICENSE:
        return license;
      case MacroMoonpieBot.BUG_TRACKER:
        return bugTrackerUrl;
    }
  },
);
