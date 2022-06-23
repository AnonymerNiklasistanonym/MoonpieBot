import { name, sourceCodeUrl } from "src/info";
import { getVersion } from "src/version";
import { MessageParserMacro } from "../macros";

export const macroMoonpieBot: MessageParserMacro = {
  name: "MOONPIEBOT",
  values: new Map([
    ["NAME", name],
    ["VERSION", getVersion()],
    ["URL", sourceCodeUrl],
  ]),
};
