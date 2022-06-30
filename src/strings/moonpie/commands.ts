import { MOONPIE_STRING_ID } from "../moonpie";

export const MOONPIE_COMMAND_STRING_ID = `${MOONPIE_STRING_ID}_COMMANDS`;

export const moonpieCommandClaim = {
  id: `${MOONPIE_COMMAND_STRING_ID}_CLAIM`,
  default: "!moonpie [claim one moonepie per day]",
};
export const moonpieCommandLeaderboard = {
  id: `${MOONPIE_COMMAND_STRING_ID}_LEADERBOARD`,
  default: "!moonpie leaderboard [get the top moonpie holder]",
};
export const moonpieCommandGet = {
  id: `${MOONPIE_COMMAND_STRING_ID}_GET`,
  default: "!moonpie get $USER [get the moonpie count of a user]",
};
export const moonpieCommandSet = {
  id: `${MOONPIE_COMMAND_STRING_ID}_SET`,
  default: "!moonpie set $USER $COUNT [set moonpies of a user]",
};
export const moonpieCommandAdd = {
  id: `${MOONPIE_COMMAND_STRING_ID}_ADD`,
  default: "!moonpie add $USER $COUNT [add moonpies to a user]",
};
export const moonpieCommandRemove = {
  id: `${MOONPIE_COMMAND_STRING_ID}_REMOVE`,
  default: "!moonpie remove $USER $COUNT [remove moonpies of a user]",
};
export const moonpieCommandDelete = {
  id: `${MOONPIE_COMMAND_STRING_ID}_DELETE`,
  default: "!moonpie delete $USER [remove a user from the database]",
};
export const moonpieCommandAbout = {
  id: `${MOONPIE_COMMAND_STRING_ID}_ABOUT`,
  default: "!moonpie about [get version and source code]",
};
export const moonpieCommandNone = {
  id: `${MOONPIE_COMMAND_STRING_ID}_NONE`,
  default: "None",
};
export const moonpieCommandPrefix = {
  id: `${MOONPIE_COMMAND_STRING_ID}_PREFIX`,
  default: "@$(USER) The following commands are supported:",
};

export const moonpieCommand = [
  moonpieCommandClaim,
  moonpieCommandLeaderboard,
  moonpieCommandGet,
  moonpieCommandSet,
  moonpieCommandAdd,
  moonpieCommandRemove,
  moonpieCommandDelete,
  moonpieCommandAbout,
  moonpieCommandNone,
  moonpieCommandPrefix,
];
