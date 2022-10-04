// Local imports
// TODO Move that function to a separate file
import { createMessageForMessageParser } from "../documentation/messageParser";
import { pluginRandomNumber } from "../messageParser/plugins/general";
// Type imports
import type { CustomTimer } from "../customCommandsTimers/customTimer";

const channels = ["salk1n616"];

export const customTimersInformation: CustomTimer[] = [
  {
    channels,
    cronString: "*/30 * * * * *",
    id: "Custom timer 1",
    message: createMessageForMessageParser([
      "Test every 30 seconds: ",
      { name: pluginRandomNumber.id, type: "plugin" },
      "%",
    ]),
  },
  {
    channels,
    cronString: "*/15 * * * *",
    id: "Custom timer 2",
    message: createMessageForMessageParser(["Test every 15 minutes"]),
  },
  {
    channels,
    cronString: "0 */1 * * *",
    id: "Custom timer 3",
    message: createMessageForMessageParser(["Test every hour"]),
  },
];
