// Local imports
import { createMessageForMessageParser } from "../messageParser";
import { pluginRandomNumber } from "../messageParser/plugins/general";
// Type imports
import type { CustomTimer } from "../customCommandsTimers/customTimer";

const channels = ["salk1n616"];

export const customTimersInformation: CustomTimer[] = [
  {
    id: "Custom timer 1",
    channels,
    message: createMessageForMessageParser([
      "Test every 30 seconds: ",
      { type: "plugin", name: pluginRandomNumber.id },
      "%",
    ]),
    cronString: "*/30 * * * * *",
  },
  {
    id: "Custom timer 2",
    channels,
    message: createMessageForMessageParser(["Test every 15 minutes"]),
    cronString: "*/15 * * * *",
  },
  {
    id: "Custom timer 3",
    channels,
    message: createMessageForMessageParser(["Test every hour"]),
    cronString: "0 */1 * * *",
  },
];
