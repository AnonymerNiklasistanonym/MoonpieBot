import * as tsj from "ts-json-schema-generator";
import fs from "fs";
import path from "path";

const rootPath = path.join(__dirname, "..");

interface Config {
  type: string;
  outputPath: string;
  inputPath: string;
  tsConfigPath: string;
}

const configs = [
  {
    type: "CustomCommandDataJson",
    outputPath: path.join(rootPath, "customCommands.schema.json"),
    inputPath: path.join(rootPath, "src", "other", "customCommand.ts"),
    tsConfigPath: path.join(rootPath, "tsconfig.json"),
  },
  {
    type: "CustomTimerDataJson",
    outputPath: path.join(rootPath, "customTimers.schema.json"),
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
