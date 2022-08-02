import {
  author,
  bugTrackerUrl,
  license,
  name,
  shortDescription,
  sourceCodeUrl,
} from "../../info";
import { getVersion } from "../../version";
import type { MessageParserMacro } from "../macros";

export const macroMoonpieBot: MessageParserMacro = {
  id: "MOONPIEBOT",
  values: new Map([
    ["NAME", name],
    ["VERSION", getVersion()],
    ["AUTHOR", author],
    ["DESCRIPTION", shortDescription],
    ["URL", sourceCodeUrl],
    ["LICENSE", license],
    ["BUG_TRACKER", bugTrackerUrl],
  ]),
};
