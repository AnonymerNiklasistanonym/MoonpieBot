import { createMessageForMessageParser } from "../../messageParser";
import { MOONPIE_STRING_ID } from "../moonpie";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";

export const MOONPIE_COMMANDS_STRING_ID = `${MOONPIE_STRING_ID}_COMMANDS`;

export const moonpieCommandsClaim = {
  default: createMessageForMessageParser(
    ["!moonpie [claim one moonpie per day]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_CLAIM`,
};
export const moonpieCommandsLeaderboard = {
  default: createMessageForMessageParser(
    ["!moonpie leaderboard [get the top moonpie holder]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_LEADERBOARD`,
};
export const moonpieCommandsGet = {
  default: createMessageForMessageParser(
    ["!moonpie get $USER [get the moonpie count of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_GET`,
};
export const moonpieCommandsSet = {
  default: createMessageForMessageParser(
    ["!moonpie set $USER $COUNT [set moonpies of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_SET`,
};
export const moonpieCommandsAdd = {
  default: createMessageForMessageParser(
    ["!moonpie add $USER $COUNT [add moonpies to a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_ADD`,
};
export const moonpieCommandsRemove = {
  default: createMessageForMessageParser(
    ["!moonpie remove $USER $COUNT [remove moonpies of a user]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_REMOVE`,
};
export const moonpieCommandsDelete = {
  default: createMessageForMessageParser(
    ["!moonpie delete $USER [remove a user from the database]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_DELETE`,
};
export const moonpieCommandsAbout = {
  default: createMessageForMessageParser(
    ["!moonpie about [get version and source code]"],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_ABOUT`,
};
export const moonpieCommandsNone = {
  default: createMessageForMessageParser(["None"], true),
  id: `${MOONPIE_COMMANDS_STRING_ID}_NONE`,
};
export const moonpieCommandsPrefix = {
  default: createMessageForMessageParser(
    [
      "@",
      { name: PluginTwitchChat.USER, type: "plugin" },
      " The following commands are supported:",
    ],
    true
  ),
  id: `${MOONPIE_COMMANDS_STRING_ID}_PREFIX`,
};

export const moonpieCommands = [
  moonpieCommandsClaim,
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
