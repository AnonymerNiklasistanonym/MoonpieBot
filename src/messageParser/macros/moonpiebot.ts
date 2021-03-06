import { name, sourceCodeUrl } from "../../info";
import { getVersion } from "../../version";
import type { MessageParserMacro } from "../macros";

export const macroMoonpieBot: MessageParserMacro = {
  id: "MOONPIEBOT",
  values: new Map([
    ["NAME", name],
    ["VERSION", getVersion()],
    ["URL", sourceCodeUrl],
  ]),
};
