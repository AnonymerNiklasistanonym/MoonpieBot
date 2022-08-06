// Package imports
import path from "path";
// Local imports
import { writeJsonFile } from "../other/fileOperations";
import { customCommandsInformation } from "../info/customCommands";
import { customTimersInformation } from "../info/customTimers";
import { outputNameCustomCommands } from "./customCommand";
import { outputNameCustomTimers } from "./customTimer";
// Type imports
import type { CustomCommandsJson } from "./customCommand";
import type { CustomTimersJson } from "./customTimer";

export const createExampleFiles = async (configDir: string) => {
  await writeJsonFile<CustomCommandsJson>(
    path.join(configDir, `${outputNameCustomCommands}.example.json`),
    {
      $schema: `./${outputNameCustomCommands}.schema.json`,
      commands: customCommandsInformation,
    }
  );

  await writeJsonFile<CustomTimersJson>(
    path.join(configDir, `${outputNameCustomTimers}.example.json`),
    {
      $schema: `./${outputNameCustomTimers}.schema.json`,
      timers: customTimersInformation,
    }
  );
};
