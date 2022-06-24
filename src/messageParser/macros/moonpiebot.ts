import { name, sourceCodeUrl } from "../../info";
import { getVersion } from "../../version";
import { MessageParserMacro } from "../macros";

export const macroMoonpieBot: MessageParserMacro = {
  name: "MOONPIEBOT",
  values: new Map([
    ["NAME", name],
    ["VERSION", getVersion()],
    ["URL", sourceCodeUrl],
  ]),
};
