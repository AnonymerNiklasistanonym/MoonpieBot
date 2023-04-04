// Type imports
import type { DeepReadonly, EMPTY_OBJECT, OrPromise } from "./other/types.mjs";

export type ExportData<CUSTOM_DATA extends EMPTY_OBJECT = EMPTY_OBJECT> = (
  configDir: string,
  json?: boolean,
  customData?: DeepReadonly<CUSTOM_DATA>,
) => OrPromise<string>;
