import { createMessageForMessageParser } from "../../messageParser";
import { MOONPIE_STRING_ID } from "../moonpie";
import { PluginTwitchChat } from "../../messageParser/plugins/twitchChat";

export const MOONPIE_COMMANDS_STRING_ID = `${MOONPIE_STRING_ID}_COMMANDS`;

export const moonpieCommandsClaim = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_CLAIM`,
  default: createMessageForMessageParser(
    ["!moonpie [claim one moonepie per day]"],
    true
  ),
};
export const moonpieCommandsLeaderboard = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_LEADERBOARD`,
  default: createMessageForMessageParser(
    ["!moonpie leaderboard [get the top moonpie holder]"],
    true
  ),
};
export const moonpieCommandsGet = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_GET`,
  default: createMessageForMessageParser(
    ["!moonpie get $USER [get the moonpie count of a user]"],
    true
  ),
};
export const moonpieCommandsSet = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_SET`,
  default: createMessageForMessageParser(
    ["!moonpie set $USER $COUNT [set moonpies of a user]"],
    true
  ),
};
export const moonpieCommandsAdd = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_ADD`,
  default: createMessageForMessageParser(
    ["!moonpie add $USER $COUNT [add moonpies to a user]"],
    true
  ),
};
export const moonpieCommandsRemove = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_REMOVE`,
  default: createMessageForMessageParser(
    ["!moonpie remove $USER $COUNT [remove moonpies of a user]"],
    true
  ),
};
export const moonpieCommandsDelete = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_DELETE`,
  default: createMessageForMessageParser(
    ["!moonpie delete $USER [remove a user from the database]"],
    true
  ),
};
export const moonpieCommandsAbout = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_ABOUT`,
  default: createMessageForMessageParser(
    ["!moonpie about [get version and source code]"],
    true
  ),
};
export const moonpieCommandsNone = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_NONE`,
  default: createMessageForMessageParser(["None"], true),
};
export const moonpieCommandsPrefix = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_PREFIX`,
  default: createMessageForMessageParser(
    [
      "@",
      { type: "plugin", name: PluginTwitchChat.USER },
      " The following commands are supported:",
    ],
    true
  ),
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
