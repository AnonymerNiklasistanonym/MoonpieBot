// Type imports
import type { DeepReadonly, EMPTY_OBJECT, OrPromise } from "./other/types";
import type { ChatCommand } from "./chatCommand";
import type { Logger } from "winston";

export type GetFeatures<T, CONFIG extends EMPTY_OBJECT = EMPTY_OBJECT> = (
  config: CONFIG,
  logger: Logger
) => OrPromise<DeepReadonly<T>>;

export interface FeatureInfo<
  FEATURE_ENUM = string,
  FEATURE_DATA extends EMPTY_OBJECT = EMPTY_OBJECT
> {
  /** The chat commands that this feature provides. */
  chatCommands: Readonly<ChatCommand[]>;
  /** The data that this feature can provide. */
  data: FEATURE_DATA;
  /** What does this feature enable. */
  description: string;
  /** Unique feature ID. */
  id: FEATURE_ENUM;
}
