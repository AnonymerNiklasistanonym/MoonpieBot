import { MOONPIE_STRING_ID } from "../moonpie";

export const MOONPIE_COMMANDS_STRING_ID = `${MOONPIE_STRING_ID}_COMMANDS`;

export const moonpieCommandsClaim = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_CLAIM`,
  default: "!moonpie [claim one moonepie per day]",
};
export const moonpieCommandsLeaderboard = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_LEADERBOARD`,
  default: "!moonpie leaderboard [get the top moonpie holder]",
};
export const moonpieCommandsGet = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_GET`,
  default: "!moonpie get $USER [get the moonpie count of a user]",
};
export const moonpieCommandsSet = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_SET`,
  default: "!moonpie set $USER $COUNT [set moonpies of a user]",
};
export const moonpieCommandsAdd = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_ADD`,
  default: "!moonpie add $USER $COUNT [add moonpies to a user]",
};
export const moonpieCommandsRemove = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_REMOVE`,
  default: "!moonpie remove $USER $COUNT [remove moonpies of a user]",
};
export const moonpieCommandsDelete = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_DELETE`,
  default: "!moonpie delete $USER [remove a user from the database]",
};
export const moonpieCommandsAbout = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_ABOUT`,
  default: "!moonpie about [get version and source code]",
};
export const moonpieCommandsNone = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_NONE`,
  default: "None",
};
export const moonpieCommandsPrefix = {
  id: `${MOONPIE_COMMANDS_STRING_ID}_PREFIX`,
  default: "@$(USER) The following commands are supported:",
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
