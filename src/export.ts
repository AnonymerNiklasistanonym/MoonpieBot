// Type imports
import type { EMPTY_OBJECT, OrPromise } from "./other/types";

export type ExportData<CUSTOM_DATA extends EMPTY_OBJECT = EMPTY_OBJECT> = (
  configDir: string,
  json?: boolean,
  customData?: CUSTOM_DATA
) => OrPromise<string>;
