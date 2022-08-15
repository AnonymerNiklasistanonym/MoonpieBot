/* eslint-disable no-console */

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

interface TypescriptTypeToJsonSchemaConfig {
  jsonSchemaOutputFilePath: string;
  tsConfigFilePath: string;
  typescriptTypeName: string;
}

const createJsonSchemaFile = (config: TypescriptTypeToJsonSchemaConfig) => {
  console.log(
    `Create JSON schema file '${config.jsonSchemaOutputFilePath}' of type '${config.typescriptTypeName}'...`
  );

  const schema = tsj
    .createGenerator({
      tsconfig: config.tsConfigFilePath,
      type: config.typescriptTypeName,
    })
    .createSchema(config.typescriptTypeName);

  writeJsonFile(config.jsonSchemaOutputFilePath, schema).catch(console.error);
};

const configs: TypescriptTypeToJsonSchemaConfig[] = [
  {
    jsonSchemaOutputFilePath: path.join(rootPath, fileNameCustomCommandsSchema),
    tsConfigFilePath: path.join(rootPath, "tsconfig.json"),
    typescriptTypeName: "CustomCommandsJson",
  },
  {
    jsonSchemaOutputFilePath: path.join(rootPath, fileNameCustomTimersSchema),
    tsConfigFilePath: path.join(rootPath, "tsconfig.json"),
    typescriptTypeName: "CustomTimersJson",
  },
];

configs.forEach(createJsonSchemaFile);
createCustomCommandTimerExampleFiles(rootPath).catch(console.error);
