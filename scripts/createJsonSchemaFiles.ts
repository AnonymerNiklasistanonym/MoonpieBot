// Package imports
import * as tsj from "ts-json-schema-generator";
import fs from "fs";
import path from "path";
// Local imports
import { createExampleFiles } from "../src/customCommandsTimers/createExampleFiles";
import { outputNameCustomCommands } from "../src/customCommandsTimers/customCommand";
import { outputNameCustomTimers } from "../src/customCommandsTimers/customTimer";

const rootPath = path.join(__dirname, "..");

interface Config {
  type: string;
  outputPath: string;
  inputPath: string;
  tsConfigPath: string;
}

const configs = [
  {
    type: "CustomCommandsJson",
    outputPath: path.join(rootPath, `${outputNameCustomCommands}.schema.json`),
    inputPath: path.join(rootPath, "src", "other", "customCommand.ts"),
    tsConfigPath: path.join(rootPath, "tsconfig.json"),
  },
  {
    type: "CustomTimersJson",
    outputPath: path.join(rootPath, `${outputNameCustomTimers}.schema.json`),
    inputPath: path.join(rootPath, "src", "other", "customTimer.ts"),
    tsConfigPath: path.join(rootPath, "tsconfig.json"),
  },
];

const createJsonSchemaFile = (config: Config) => {
  console.log(
    `Create JSON schema file '${config.outputPath}' of type '${config.type}'...`
  );

  const schema = tsj
    .createGenerator({
      path: config.inputPath,
      tsconfig: config.tsConfigPath,
      type: config.type,
    })
    .createSchema(config.type);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFile(config.outputPath, JSON.stringify(schema, null, 4), (err) => {
    if (err) throw err;
  });
};

configs.forEach(createJsonSchemaFile);
const configDir = path.join(__dirname, "..");
createExampleFiles(configDir).catch(console.error);
