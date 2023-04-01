// Type imports
import type { DeepReadonly, EMPTY_OBJECT, OrPromise } from "./other/types.mjs";
import type { ChatCommand } from "./chatCommand.mjs";
import type { Logger } from "winston";

export type GetFeatures<FEATURE, CONFIG extends EMPTY_OBJECT = EMPTY_OBJECT> = (
  config: DeepReadonly<CONFIG>,
  logger: Readonly<Logger>
) => OrPromise<DeepReadonly<FEATURE>>;

export interface FeatureInfo<
  FEATURE_ENUM = string,
  FEATURE_DATA extends EMPTY_OBJECT = EMPTY_OBJECT
> {
  /** The chat commands that this feature provides. */
  chatCommands: ChatCommand[];
  /** The data that this feature can provide. */
  data: FEATURE_DATA;
  /** What does this feature enable. */
  description: string;
  /** Unique feature ID. */
  id: FEATURE_ENUM;
}
