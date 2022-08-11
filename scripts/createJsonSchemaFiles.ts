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
  inputPath: string;
  outputPath: string;
  tsConfigPath: string;
  type: string;
}

const configs = [
  {
    inputPath: path.join(rootPath, "src", "other", "customCommand.ts"),
    outputPath: path.join(rootPath, fileNameCustomCommandsSchema),
    tsConfigPath: path.join(rootPath, "tsconfig.json"),
    type: "CustomCommandsJson",
  },
  {
    inputPath: path.join(rootPath, "src", "other", "customTimer.ts"),
    outputPath: path.join(rootPath, fileNameCustomTimersSchema),
    tsConfigPath: path.join(rootPath, "tsconfig.json"),
    type: "CustomTimersJson",
  },
];

const createJsonSchemaFile = (config: Config) => {
  // eslint-disable-next-line no-console
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

  // eslint-disable-next-line no-console
  writeJsonFile(config.outputPath, schema).catch(console.error);
};

configs.forEach(createJsonSchemaFile);
const configDir = path.join(__dirname, "..");
// eslint-disable-next-line no-console
createCustomCommandTimerExampleFiles(configDir).catch(console.error);
