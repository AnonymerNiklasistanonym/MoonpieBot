// Package imports
import path from "path";
// Local imports
import {
  fileNameCustomCommandsExample,
  fileNameCustomCommandsSchema,
  fileNameCustomTimersExample,
  fileNameCustomTimersSchema,
} from "../info/fileNames";
import { writeJsonFile } from "../other/fileOperations";
import { customCommandsInformation } from "../info/customCommands";
import { customTimersInformation } from "../info/customTimers";
// Type imports
import type { CustomCommandsJson } from "./customCommand";
import type { CustomTimersJson } from "./customTimer";

export interface CustomJson {
  /**
   * Pointer to the schema against which this document should be
   * validated (Schema URL/path).
   */
  $schema?: string;
}

export const createCustomCommandTimerExampleFiles = async (
  configDir: string
) => {
  await writeJsonFile<CustomCommandsJson>(
    path.join(configDir, fileNameCustomCommandsExample),
    {
      $schema: `./${fileNameCustomCommandsSchema}`,
      commands: customCommandsInformation,
    }
  );
  await writeJsonFile<CustomTimersJson>(
    path.join(configDir, fileNameCustomTimersExample),
    {
      $schema: `./${fileNameCustomTimersSchema}`,
      timers: customTimersInformation,
    }
  );
};
