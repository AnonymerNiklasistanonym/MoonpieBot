export const LOG_ID_CHAT_HANDLER_OSU = "osu_chat_handler";

export enum OsuCommands {
  COMMANDS = "commands",
  LAST_REQUEST = "last_request",
  NP = "np",
  PERMIT_REQUEST = "permit_request",
  PP = "pp",
  REQUESTS = "requests",
  RP = "rp",
  SCORE = "score",
}

export const LOG_ID_CHAT_HANDLER_SPOTIFY = "spotify_chat_handler";

export enum SpotifyCommands {
  COMMANDS = "commands",
  SONG = "song",
}

export const LOG_ID_CHAT_HANDLER_MOONPIE = "moonpie_chat_handler";

export enum MoonpieCommands {
  ABOUT = "about",
  ADD = "add",
  CLAIM = "claim",
  COMMANDS = "commands",
  DELETE = "delete",
  GET = "get",
  LEADERBOARD = "leaderboard",
  REMOVE = "remove",
  SET = "set",
}

export const LOG_ID_CHAT_HANDLER_CUSTOM_COMMANDS_BROADCASTS =
  "custom_commands_broadcasts_chat_handler";

export enum CustomCommandsBroadcastsCommands {
  ADD_CUSTOM_BROADCAST = "add_broadcast",
  ADD_CUSTOM_COMMAND = "add_command",
  COMMANDS = "commands",
  DELETE_CUSTOM_BROADCAST = "delete_broadcast",
  DELETE_CUSTOM_COMMAND = "delete_command",
  EDIT_CUSTOM_BROADCAST = "edit_broadcast",
  EDIT_CUSTOM_COMMAND = "edit_command",
  LIST_CUSTOM_BROADCASTS = "list_broadcasts",
  LIST_CUSTOM_COMMANDS = "list_commands",
}

export const LOG_ID_CHAT_HANDLER_LURK = "lurk_chat_handler";

export enum LurkCommands {
  LURK = "lurk",
}
