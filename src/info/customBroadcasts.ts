// Local imports
import { createMessageForMessageParser } from "../documentation/messageParser";
import { pluginRandomNumber } from "../messageParser/plugins/general";
// Type imports
import type { CustomBroadcast } from "../customCommandsBroadcasts/customBroadcast";

export const customBroadcastsInformation: CustomBroadcast[] = [
  {
    cronString: "*/30 * * * * *",
    id: "Custom timer 1",
    message: createMessageForMessageParser([
      "Test every 30 seconds: ",
      { name: pluginRandomNumber.id, type: "plugin" },
      "%",
    ]),
  },
  {
    cronString: "*/15 * * * *",
    id: "Custom timer 2",
    message: createMessageForMessageParser(["Test every 15 minutes"]),
  },
  {
    cronString: "0 */1 * * *",
    id: "Custom timer 3",
    message: createMessageForMessageParser(["Test every hour"]),
  },
];
