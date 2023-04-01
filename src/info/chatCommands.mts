// Relative imports
import {
  CustomBroadcastValueOptions,
  CustomCommandValueOptions,
} from "../commands/customCommandsBroadcasts/valueOptions.mjs";
import {
  regexCustomBroadcastAdd,
  regexCustomBroadcastDelete,
  regexCustomBroadcastEdit,
  regexCustomBroadcastList,
  regexCustomCommandAdd,
  regexCustomCommandDelete,
  regexCustomCommandEdit,
  regexCustomCommandList,
  regexCustomCommandsBroadcastsCommands,
  regexLurkChatHandlerCommandLurk,
  regexMoonpieChatHandlerCommandAbout,
  regexMoonpieChatHandlerCommandClaim,
  regexMoonpieChatHandlerCommandCommands,
  regexMoonpieChatHandlerCommandLeaderboard,
  regexMoonpieChatHandlerCommandUserAdd,
  regexMoonpieChatHandlerCommandUserDelete,
  regexMoonpieChatHandlerCommandUserGet,
  regexMoonpieChatHandlerCommandUserRemove,
  regexMoonpieChatHandlerCommandUserSet,
  regexOsuChatHandlerCommandCommands,
  regexOsuChatHandlerCommandLastRequest,
  regexOsuChatHandlerCommandNp,
  regexOsuChatHandlerCommandPermitRequest,
  regexOsuChatHandlerCommandPp,
  regexOsuChatHandlerCommandRequests,
  regexOsuChatHandlerCommandRequestsSet,
  regexOsuChatHandlerCommandRequestsUnset,
  regexOsuChatHandlerCommandRp,
  regexOsuChatHandlerCommandScore,
  regexSpotifyChatHandlerCommandCommands,
  regexSpotifyChatHandlerCommandSong,
} from "./regex.mjs";
import { OsuRequestsConfig } from "./databases/osuRequestsDb.mjs";
// Type imports
import type { ChatCommand, GetChatCommand } from "../chatCommand.mjs";

enum ChatCommandPermission {
  BROADCASTER = "broadcaster",
  EVERYONE = "everyone",
  MOD = "mod",
}

export const LOG_ID_CHAT_HANDLER_OSU = "osu_chat_handler";

const ENABLE_COMMANDS_DEFAULT_DESCRIPTION_COMMAND_COMMANDS =
  "List all enabled Commands.mjs";

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

export const getChatCommandsOsu: GetChatCommand<OsuCommands> = (id) => {
  const chatCommands: ChatCommand<OsuCommands>[] = [];
  switch (id) {
    case OsuCommands.COMMANDS:
      chatCommands.push({
        command: regexOsuChatHandlerCommandCommands,
        description: ENABLE_COMMANDS_DEFAULT_DESCRIPTION_COMMAND_COMMANDS,
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case OsuCommands.LAST_REQUEST:
      chatCommands.push({
        command: regexOsuChatHandlerCommandLastRequest,
        description:
          "Resend the last request (or requests if a custom count is provided) in case of a osu! client restart",
        descriptionShort: "Resend last request",
        id,
        permission: ChatCommandPermission.MOD,
      });
      break;
    case OsuCommands.NP:
      chatCommands.push({
        command: regexOsuChatHandlerCommandNp,
        description:
          "Get a link to the currently selected map (if an optional StreamCompanion URL/directory path is provided this information will be used to get the current map information, otherwise the osu! window text will be used and searched for using the given osu! credentials [very slow and only works if the map is being played plus no detailed runtime information like mods and not all map information will be correct especially if it's not a ranked map])",
        descriptionShort: "Get current beatmap",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case OsuCommands.PERMIT_REQUEST:
      chatCommands.push({
        command: regexOsuChatHandlerCommandPermitRequest,
        description: "Permit last blocked request",
        id,
        permission: ChatCommandPermission.MOD,
      });
      break;
    case OsuCommands.PP:
      chatCommands.push({
        command: regexOsuChatHandlerCommandPp,
        description:
          "Get general account information (pp, rank, country, ...) of the account or of the given osu! player",
        descriptionShort: "Get account information",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case OsuCommands.RP:
      chatCommands.push({
        command: regexOsuChatHandlerCommandRp,
        description:
          "Get the most recent play of the account or of the given osu! player",
        descriptionShort: "Get most recent play",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case OsuCommands.SCORE:
      chatCommands.push({
        command: regexOsuChatHandlerCommandScore,
        description: `Get the top score of the given osu! player on the most recently mentioned map in chat (from a beatmap request, ${OsuCommands.RP}, ${OsuCommands.NP})`,
        descriptionShort: "Get top score of last mentioned beatmap",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case OsuCommands.REQUESTS:
      chatCommands.push(
        {
          command: "osuBeatmapUrl[ comment]",
          description:
            "Request a beatmap requests using an osu! URL and optional comment",
          descriptionShort: "Request beatmap",
          id,
          permission: ChatCommandPermission.EVERYONE,
        },
        {
          command: regexOsuChatHandlerCommandRequests,
          description:
            "Get if beatmap requests are currently enabled and with which demands if there are any, Turn beatmap requests on or off with an optional message",
          descriptionShort: "Get/Toggle beatmap requests",
          id,
          permission: `get=${ChatCommandPermission.EVERYONE} on/off=${ChatCommandPermission.MOD}`,
        },
        {
          command: regexOsuChatHandlerCommandRequestsSet,
          description: `Set beatmap demands/options (${Object.values(
            OsuRequestsConfig
          ).join(", ")})`,
          descriptionShort: "Set beatmap demands",
          id,
          permission: ChatCommandPermission.MOD,
        },
        {
          command: regexOsuChatHandlerCommandRequestsUnset,
          description: `Reset beatmap request demands/options (${Object.values(
            OsuRequestsConfig
          ).join(", ")}) back to their default value`,
          descriptionShort: "Reset beatmap demands",
          id,
          permission: ChatCommandPermission.MOD,
        }
      );
      break;
  }
  return chatCommands;
};

export const LOG_ID_CHAT_HANDLER_SPOTIFY = "spotify_chat_handler";

export enum SpotifyCommands {
  COMMANDS = "commands",
  SONG = "song",
}

export const getChatCommandsSpotify: GetChatCommand<SpotifyCommands> = (id) => {
  const chatCommands: ChatCommand<SpotifyCommands>[] = [];
  let command;
  const permission = ChatCommandPermission.EVERYONE;
  let description;
  let descriptionShort;
  switch (id) {
    case SpotifyCommands.COMMANDS:
      command = regexSpotifyChatHandlerCommandCommands;
      description = ENABLE_COMMANDS_DEFAULT_DESCRIPTION_COMMAND_COMMANDS;
      break;
    case SpotifyCommands.SONG:
      command = regexSpotifyChatHandlerCommandSong;
      description =
        "Get the currently playing (and most recently played) song on the connected Spotify account";
      break;
  }
  chatCommands.push({ command, description, descriptionShort, id, permission });
  return chatCommands;
};

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

export const getChatCommandsMoonpie: GetChatCommand<MoonpieCommands> = (id) => {
  const chatCommands: ChatCommand<MoonpieCommands>[] = [];
  switch (id) {
    case MoonpieCommands.COMMANDS:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandCommands,
        description: ENABLE_COMMANDS_DEFAULT_DESCRIPTION_COMMAND_COMMANDS,
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case MoonpieCommands.ABOUT:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandAbout,
        description: "Get version information of the bot",
        descriptionShort: "Version information",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case MoonpieCommands.ADD:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandUserAdd,
        description: "Add moonpies to a user",
        id,
        permission: ChatCommandPermission.BROADCASTER,
      });
      break;
    case MoonpieCommands.DELETE:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandUserDelete,
        description: "Delete moonpies of a user",
        id,
        permission: ChatCommandPermission.BROADCASTER,
      });
      break;
    case MoonpieCommands.GET:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandUserGet,
        description: "Get moonpies of a user",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case MoonpieCommands.REMOVE:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandUserRemove,
        description: "Remove moonpies from a user",
        id,
        permission: ChatCommandPermission.BROADCASTER,
      });
      break;
    case MoonpieCommands.SET:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandUserSet,
        description: "Set moonpies of a user",
        id,
        permission: ChatCommandPermission.BROADCASTER,
      });
      break;
    case MoonpieCommands.LEADERBOARD:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandLeaderboard,
        description: "List the top moonpie holders",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
    case MoonpieCommands.CLAIM:
      chatCommands.push({
        command: regexMoonpieChatHandlerCommandClaim,
        description:
          "(If not already claimed) Claim a moonpie once every set hours and return the current count and the leaderboard position",
        descriptionShort: "Claim a moonpie",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
  }
  return chatCommands;
};

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

export const getChatCommandsCustomCommandsBroadcasts: GetChatCommand<
  CustomCommandsBroadcastsCommands
> = (id) => {
  const chatCommands: ChatCommand<CustomCommandsBroadcastsCommands>[] = [];
  let command;
  let description;
  let descriptionShort;
  let permission = ChatCommandPermission.MOD;
  switch (id) {
    case CustomCommandsBroadcastsCommands.ADD_CUSTOM_BROADCAST:
      command = regexCustomBroadcastAdd;
      descriptionShort = "Add a broadcast";
      description =
        "Add a broadcast with an ID, a cron expression to determine when the broadcast should be sent ([crontab.cronhub.io](https://crontab.cronhub.io/)) and a message";
      break;
    case CustomCommandsBroadcastsCommands.ADD_CUSTOM_COMMAND:
      command = regexCustomCommandAdd;
      descriptionShort = "Add a command";
      description =
        "Add a command with an ID, a RegEx expression to detect it and capture contents of the match ([regex101.com](https://regex101.com/)) and a message - Optionally a cooldown (in s) and user level (broadcaster, mod, vip, none) are also supported";
      break;
    case CustomCommandsBroadcastsCommands.COMMANDS:
      command = regexCustomCommandsBroadcastsCommands;
      description = ENABLE_COMMANDS_DEFAULT_DESCRIPTION_COMMAND_COMMANDS;
      permission = ChatCommandPermission.EVERYONE;
      break;
    case CustomCommandsBroadcastsCommands.DELETE_CUSTOM_BROADCAST:
      command = regexCustomBroadcastDelete;
      description = "Delete a broadcast";
      break;
    case CustomCommandsBroadcastsCommands.DELETE_CUSTOM_COMMAND:
      command = regexCustomCommandDelete;
      description = "Delete a command";
      break;
    case CustomCommandsBroadcastsCommands.EDIT_CUSTOM_BROADCAST:
      command = regexCustomBroadcastEdit;
      descriptionShort = "Edit a broadcast";
      description = `A single property (${Object.values(
        CustomBroadcastValueOptions
      ).join(", ")}) can be edited of an existing broadcast`;
      break;
    case CustomCommandsBroadcastsCommands.EDIT_CUSTOM_COMMAND:
      command = regexCustomCommandEdit;
      descriptionShort = "Edit a command";
      description = `A single property (${Object.values(
        CustomCommandValueOptions
      ).join(", ")}) can be edited of an existing command`;
      break;
    case CustomCommandsBroadcastsCommands.LIST_CUSTOM_BROADCASTS:
      command = regexCustomCommandList;
      descriptionShort = "List all callbacks";
      description =
        descriptionShort +
        " (an offset number can be provided if multiple were added or an ID can be provided to only list one specific broadcast)";
      permission = ChatCommandPermission.EVERYONE;
      break;
    case CustomCommandsBroadcastsCommands.LIST_CUSTOM_COMMANDS:
      command = regexCustomBroadcastList;
      descriptionShort = "List all Commands.mjs";
      description =
        descriptionShort +
        " (an offset number can be provided if multiple were added or an ID can be provided to only list one specific command)";
      permission = ChatCommandPermission.EVERYONE;
      break;
  }
  chatCommands.push({ command, description, descriptionShort, id, permission });
  return chatCommands;
};

export const LOG_ID_CHAT_HANDLER_LURK = "lurk_chat_handler";

export enum LurkCommands {
  LURK = "lurk",
}

export const getChatCommandsLurk: GetChatCommand<LurkCommands> = (id) => {
  const chatCommands: ChatCommand<LurkCommands>[] = [];
  switch (id) {
    case LurkCommands.LURK:
      chatCommands.push({
        command: regexLurkChatHandlerCommandLurk,
        description:
          "Using this lurk command chatters are welcomed back after they come back",
        id,
        permission: ChatCommandPermission.EVERYONE,
      });
      break;
  }
  return chatCommands;
};
