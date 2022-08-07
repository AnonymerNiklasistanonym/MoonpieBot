// Package imports
import path from "path";
// Local imports
import {
  createStringsVariableDocumentation,
  defaultStrings,
} from "../src/strings";
import { createEnvVariableDocumentation } from "../src/env";

const configDir = path.join(__dirname, "..");
createEnvVariableDocumentation(
  path.join(configDir, ".env.example"),
  configDir
).catch(console.error);
createStringsVariableDocumentation(
  path.join(configDir, ".env.strings.example"),
  defaultStrings
).catch(console.error);
