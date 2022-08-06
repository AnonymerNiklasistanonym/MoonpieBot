// Package imports
import path from "path";
// Local imports
import { createEnvVariableDocumentation } from "../src/env";
import {
  createStringsVariableDocumentation,
  defaultStrings,
} from "../src/strings";

const configDir = path.join(__dirname, "..");
createEnvVariableDocumentation(
  path.join(configDir, ".env.example"),
  configDir
).catch(console.error);
createStringsVariableDocumentation(
  path.join(configDir, ".env.strings.example"),
  defaultStrings,
).catch(console.error);
