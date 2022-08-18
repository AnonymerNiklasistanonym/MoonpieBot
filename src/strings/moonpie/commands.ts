// Local imports
import { createMessageForMessageParser } from "../../messageParser";
import { MOONPIE_STRING_ID } from "../moonpie";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";
// Type imports
import type { StringEntry } from "../../strings";

const MOONPIE_COMMANDS_STRING_ID = `${MOONPIE_STRING_ID}_COMMANDS`;

export const moonpieCommandsCommands: StringEntry = {
  default: createMessageForMessageParser(["!moonpie commands"], true),
  id: `${MOONPIE_COMMANDS_STRING_ID}_COMMANDS`,
};
export const moonpieCommandsClaim: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie [claim one moonpie per day]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_CLAIM`,
};
export const moonpieCommandsLeaderboard: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie leaderboard ($STARTING_RANK)"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_LEADERBOARD`,
};
export const moonpieCommandsGet: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie get $USER [get moonpies of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_GET`,
};
export const moonpieCommandsSet: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie set $USER $COUNT [set moonpies of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_SET`,
};
export const moonpieCommandsAdd: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie add $USER $COUNT [add moonpies to a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_ADD`,
};
export const moonpieCommandsRemove: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie remove $USER $COUNT [remove moonpies of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_REMOVE`,
};
export const moonpieCommandsDelete: StringEntry = {
  default: createMessageForMessageParser(
    ["!moonpie delete $USER [remove a user from the database]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_DELETE`,
};
export const moonpieCommandsAbout: StringEntry = {
  default: createMessageForMessageParser(["!moonpie about"], true),
  id: `${MOONPIE_COMMANDS_STRING_ID}_ABOUT`,
};
export const moonpieCommandsNone: StringEntry = {
  default: createMessageForMessageParser(["None"], true),
  id: `${MOONPIE_COMMANDS_STRING_ID}_NONE`,
};
export const moonpieCommandsPrefix: StringEntry = {
  default: createMessageForMessageParser(
    [
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The following moonpie commands are supported: ",
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_PREFIX`,
};

export const moonpieCommands: StringEntry[] = [
  moonpieCommandsClaim,
  moonpieCommandsCommands,
  moonpieCommandsLeaderboard,
  moonpieCommandsGet,
  moonpieCommandsSet,
  moonpieCommandsAdd,
  moonpieCommandsRemove,
  moonpieCommandsDelete,
  moonpieCommandsAbout,
  moonpieCommandsNone,
  moonpieCommandsPrefix,
];
