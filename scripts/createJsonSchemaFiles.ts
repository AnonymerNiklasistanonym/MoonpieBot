// Package imports
import * as tsj from "ts-json-schema-generator";
import path from "path";
// Local imports
import {
  fileNameCustomCommandsSchema,
  fileNameCustomTimersSchema,
} from "../src/info/fileNames";
import { createCustomCommandTimerExampleFiles } from "../src/customCommandsTimers/createExampleFiles";
import { writeJsonFile } from "../src/other/fileOperations";

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
    outputPath: path.join(rootPath, fileNameCustomCommandsSchema),
    inputPath: path.join(rootPath, "src", "other", "customCommand.ts"),
    tsConfigPath: path.join(rootPath, "tsconfig.json"),
  },
  {
    type: "CustomTimersJson",
    outputPath: path.join(rootPath, fileNameCustomTimersSchema),
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

  writeJsonFile(config.outputPath, schema).catch(console.error);
};

configs.forEach(createJsonSchemaFile);
const configDir = path.join(__dirname, "..");
createCustomCommandTimerExampleFiles(configDir).catch(console.error);
