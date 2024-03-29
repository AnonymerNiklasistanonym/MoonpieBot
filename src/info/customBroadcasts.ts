// Local imports
import { createMessageParserMessage } from "../messageParser";
import { pluginRandomNumber } from "./plugins/general";
// Type imports
import type { CustomBroadcast } from "../customCommandsBroadcasts/customBroadcast";
import type { DeepReadonlyArray } from "../other/types";

export const customBroadcastsInformation: DeepReadonlyArray<CustomBroadcast> = [
  {
    cronString: "*/30 * * * * *",
    id: "Custom timer 1",
    message: createMessageParserMessage([
      "Test every 30 seconds: ",
      { name: pluginRandomNumber.id, type: "plugin" },
      "%",
    ]),
  },
  {
    cronString: "*/15 * * * *",
    id: "Custom timer 2",
    message: createMessageParserMessage(["Test every 15 minutes"]),
  },
  {
    cronString: "0 */1 * * *",
    id: "Custom timer 3",
    message: createMessageParserMessage(["Test every hour"]),
  },
];
