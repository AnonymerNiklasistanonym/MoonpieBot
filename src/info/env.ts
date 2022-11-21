/**
 * ENV (Environment variable) information.
 */

// Package imports
import path from "path";
// Local imports
import {
  CustomCommandsBroadcastsCommands,
  getChatCommandsCustomCommandsBroadcasts,
  getChatCommandsLurk,
  getChatCommandsMoonpie,
  getChatCommandsOsu,
  getChatCommandsSpotify,
  LurkCommands,
  MoonpieCommands,
} from "./chatCommands";
import { fileNameEnv, fileNameEnvExample } from "./files";
import { convertRegexToHumanString } from "../other/regexToString";
import { LoggerLevel } from "../logging";
import { OsuCommands } from "./chatCommands";
import { regexOsuChatHandlerCommandRequestsSet } from "./regex";
import { SpotifyCommands } from "./chatCommands";
// Type imports
import type { CliEnvVariableInformation } from "../cli";
import type { EnvVariableStructureElement } from "../env";

/**
 * ENV prefix.
 */
export const ENV_PREFIX = "MOONPIE_CONFIG_";

/**
 * ENV prefix for custom strings.
 */
export const ENV_PREFIX_CUSTOM_STRINGS = "MOONPIE_CUSTOM_STRING_";

/**
 * Character to split list options of ENV values.
 */
export const ENV_LIST_SPLIT_CHARACTER = ",";

/**
 * ENV values for ON/OFF variables.
 */
export enum EnvVariableOnOff {
  OFF = "OFF",
  ON = "ON",
}

/**
 * ENV values for other list options.
 */
export enum EnvVariableOtherListOptions {
  /** Ignore all options and disable them if there are default ones.  */
  NONE = "none",
}

/**
 * Supported ENV (Environment Variables).
 */
export enum EnvVariable {
  CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH = "CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH",
  CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS = "CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS",
  LOGGING_CONSOLE_LOG_LEVEL = "LOGGING_CONSOLE_LOG_LEVEL",
  LOGGING_DIRECTORY_PATH = "LOGGING_DIRECTORY_PATH",
  LOGGING_FILE_LOG_LEVEL = "LOGGING_FILE_LOG_LEVEL",
  LURK_ENABLE_COMMANDS = "LURK_ENABLE_COMMANDS",
  MOONPIE_CLAIM_COOLDOWN_HOURS = "MOONPIE_CLAIM_COOLDOWN_HOURS",
  MOONPIE_DATABASE_PATH = "MOONPIE_DATABASE_PATH",
  MOONPIE_ENABLE_COMMANDS = "MOONPIE_ENABLE_COMMANDS",
  OSU_API_CLIENT_ID = "OSU_API_CLIENT_ID",
  OSU_API_CLIENT_SECRET = "OSU_API_CLIENT_SECRET",
  OSU_API_DEFAULT_ID = "OSU_API_DEFAULT_ID",
  OSU_API_REQUESTS_CONFIG_DATABASE_PATH = "OSU_API_REQUESTS_CONFIG_DATABASE_PATH",
  OSU_API_REQUESTS_DETAILED = "OSU_API_REQUESTS_DETAILED",
  OSU_API_REQUESTS_REDEEM_ID = "OSU_API_REQUESTS_REDEEM_ID",
  OSU_ENABLE_COMMANDS = "OSU_ENABLE_COMMANDS",
  OSU_IRC_PASSWORD = "OSU_IRC_PASSWORD",
  OSU_IRC_REQUEST_TARGET = "OSU_IRC_REQUEST_TARGET",
  OSU_IRC_USERNAME = "OSU_IRC_USERNAME",
  OSU_STREAM_COMPANION_DIR_PATH = "OSU_STREAM_COMPANION_DIR_PATH",
  OSU_STREAM_COMPANION_URL = "OSU_STREAM_COMPANION_URL",
  SPOTIFY_API_CLIENT_ID = "SPOTIFY_API_CLIENT_ID",
  SPOTIFY_API_CLIENT_SECRET = "SPOTIFY_API_CLIENT_SECRET",
  SPOTIFY_API_REFRESH_TOKEN = "SPOTIFY_API_REFRESH_TOKEN",
  SPOTIFY_DATABASE_PATH = "SPOTIFY_DATABASE_PATH",
  SPOTIFY_ENABLE_COMMANDS = "SPOTIFY_ENABLE_COMMANDS",
  TWITCH_API_ACCESS_TOKEN = "TWITCH_API_ACCESS_TOKEN",
  TWITCH_API_CLIENT_ID = "TWITCH_API_CLIENT_ID",
  TWITCH_CHANNELS = "TWITCH_CHANNELS",
  TWITCH_DEBUG = "TWITCH_DEBUG",
  TWITCH_NAME = "TWITCH_NAME",
  TWITCH_OAUTH_TOKEN = "TWITCH_OAUTH_TOKEN",
}

/**
 * ENV blocks to group {@link EnvVariable} values.
 */
export enum EnvVariableBlock {
  CUSTOM_COMMANDS_BROADCASTS = "CUSTOM_COMMANDS_BROADCASTS",
  LOGGING = "LOGGING",
  LURK = "LURK",
  MOONPIE = "MOONPIE",
  OSU = "OSU",
  OSU_API = "OSU_API",
  OSU_IRC = "OSU_IRC",
  OSU_STREAM_COMPANION = "OSU_STREAM_COMPANION",
  SPOTIFY = "SPOTIFY",
  SPOTIFY_API = "SPOTIFY_API",
  TWITCH = "TWITCH",
  TWITCH_API = "TWITCH_API",
}

const ENABLE_COMMANDS_DEFAULT_DESCRIPTION = `You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to '${EnvVariableOtherListOptions.NONE}' if no commands should be enabled).`;

/**
 * ENV variable information.
 */
export const envVariableInformation: CliEnvVariableInformation<
  EnvVariable,
  EnvVariableBlock
>[] = [
  {
    block: EnvVariableBlock.CUSTOM_COMMANDS_BROADCASTS,
    default: (configDir) =>
      path.relative(
        configDir,
        path.join(configDir, "customCommandsBroadcasts.db")
      ),
    defaultValue: (configDir) =>
      path.resolve(path.join(configDir, "customCommandsBroadcasts.db")),
    description:
      "The database file path that contains the persistent custom commands and broadcasts data.",
    name: EnvVariable.CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH,
  },
  {
    block: EnvVariableBlock.CUSTOM_COMMANDS_BROADCASTS,
    default: Object.values(CustomCommandsBroadcastsCommands)
      .sort()
      .join(ENV_LIST_SPLIT_CHARACTER),
    description: ENABLE_COMMANDS_DEFAULT_DESCRIPTION,
    name: EnvVariable.CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS,
    supportedValues: {
      canBeJoinedAsList: true,
      emptyListValue: EnvVariableOtherListOptions.NONE,
      values: Object.values(CustomCommandsBroadcastsCommands)
        .map((id) => getChatCommandsCustomCommandsBroadcasts(id))
        .flat(),
    },
  },
  {
    block: EnvVariableBlock.LOGGING,
    default: "info",
    description:
      "The log level of the log messages that are printed to the console.",
    name: EnvVariable.LOGGING_CONSOLE_LOG_LEVEL,
    supportedValues: { values: Object.values(LoggerLevel) },
  },
  {
    block: EnvVariableBlock.LOGGING,
    default: (configDir) =>
      path.relative(configDir, path.join(configDir, "logs")),
    defaultValue: (configDir) => path.resolve(configDir, "logs"),
    description: "The directory file path of the log files",
    legacyNames: ["DIR_LOGS"],
    name: EnvVariable.LOGGING_DIRECTORY_PATH,
  },
  {
    block: EnvVariableBlock.LOGGING,
    default: "debug",
    description:
      "The log level of the log messages that are written to the log files.",
    legacyNames: ["FILE_LOG_LEVEL"],
    name: EnvVariable.LOGGING_FILE_LOG_LEVEL,
    supportedValues: { values: Object.values(LoggerLevel) },
  },
  {
    block: EnvVariableBlock.TWITCH,
    description:
      "A with a space separated list of all the channels the bot should be active.",
    example: ["twitch_channel_name1", "twitch_channel_name2"].join(
      ENV_LIST_SPLIT_CHARACTER
    ),
    legacyNames: ["TWITCH_CHANNEL"],
    name: EnvVariable.TWITCH_CHANNELS,
    required: true,
  },
  {
    block: EnvVariableBlock.TWITCH,
    description:
      "The name of the twitch account/channel that should be imitated.",
    example: "twitch_account_name",
    name: EnvVariable.TWITCH_NAME,
    required: true,
  },
  {
    block: EnvVariableBlock.TWITCH,
    censor: true,
    description: `A Twitch OAuth token (get it from: https://twitchapps.com/tmi/) of the Twitch account specified in ${ENV_PREFIX}${EnvVariable.TWITCH_NAME}.`,
    example: "oauth:abcdefghijklmnop",
    name: EnvVariable.TWITCH_OAUTH_TOKEN,
    required: true,
  },
  {
    block: EnvVariableBlock.TWITCH,
    default: EnvVariableOnOff.OFF,
    description:
      "Turn on debug logs for the Twitch client to see all messages, joins, reconnects and more.",
    name: EnvVariable.TWITCH_DEBUG,
    supportedValues: { values: Object.values(EnvVariableOnOff) },
  },
  {
    block: EnvVariableBlock.LURK,
    default: EnvVariableOtherListOptions.NONE,
    description: ENABLE_COMMANDS_DEFAULT_DESCRIPTION,
    name: EnvVariable.LURK_ENABLE_COMMANDS,
    supportedValues: {
      canBeJoinedAsList: true,
      emptyListValue: EnvVariableOtherListOptions.NONE,
      values: Object.values(LurkCommands)
        .map((id) => getChatCommandsLurk(id))
        .flat(),
    },
  },
  {
    block: EnvVariableBlock.MOONPIE,
    default: [MoonpieCommands.ABOUT, MoonpieCommands.COMMANDS]
      .sort()
      .join(ENV_LIST_SPLIT_CHARACTER),
    description: ENABLE_COMMANDS_DEFAULT_DESCRIPTION,
    example: Object.values(MoonpieCommands)
      .sort()
      .join(ENV_LIST_SPLIT_CHARACTER),
    legacyNames: ["ENABLE_COMMANDS"],
    name: EnvVariable.MOONPIE_ENABLE_COMMANDS,
    supportedValues: {
      canBeJoinedAsList: true,
      emptyListValue: EnvVariableOtherListOptions.NONE,
      values: Object.values(MoonpieCommands)
        .map((id) => getChatCommandsMoonpie(id))
        .flat(),
    },
  },
  {
    block: EnvVariableBlock.MOONPIE,
    default: (configDir) =>
      path.relative(configDir, path.join(configDir, "moonpie.db")),
    defaultValue: (configDir) =>
      path.resolve(path.join(configDir, "moonpie.db")),
    description:
      "The database file path that contains the persistent moonpie data.",
    legacyNames: ["DB_FILEPATH"],
    name: EnvVariable.MOONPIE_DATABASE_PATH,
  },
  {
    block: EnvVariableBlock.MOONPIE,
    default: "18",
    description:
      "The number of hours for which a user is unable to claim a moonpie after claiming one (less than 24 in case of daily streams).",
    legacyNames: ["MOONPIE_COOLDOWN_HOURS"],
    name: EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS,
  },
  {
    block: EnvVariableBlock.OSU,
    default: Object.values(OsuCommands).sort().join(ENV_LIST_SPLIT_CHARACTER),
    description: `${ENABLE_COMMANDS_DEFAULT_DESCRIPTION} If you don't provide osu! API credentials and/or a StreamCompanion connection commands that need that won't be enabled!`,
    name: EnvVariable.OSU_ENABLE_COMMANDS,
    supportedValues: {
      canBeJoinedAsList: true,
      emptyListValue: EnvVariableOtherListOptions.NONE,
      values: Object.values(OsuCommands)
        .map((id) => getChatCommandsOsu(id))
        .flat(),
    },
  },
  {
    block: EnvVariableBlock.OSU_API,
    censor: true,
    description:
      "The osu! client ID (and client secret) to use the osu! API v2. To get it go to your account settings, Click 'New OAuth application' and add a custom name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that you can copy the client ID (and client secret).",
    example: "1234",
    legacyNames: ["OSU_CLIENT_ID"],
    name: EnvVariable.OSU_API_CLIENT_ID,
  },
  {
    block: EnvVariableBlock.OSU_API,
    censor: true,
    description: `Check the description of ${ENV_PREFIX}${EnvVariable.OSU_API_CLIENT_ID}.`,
    example: "dadasfsafsafdsadffasfsafasfa",
    legacyNames: ["OSU_CLIENT_SECRET"],
    name: EnvVariable.OSU_API_CLIENT_SECRET,
  },
  {
    block: EnvVariableBlock.OSU_API,
    description:
      "The default osu! account ID used to check for recent play or a top play on a map.",
    example: "1185432",
    legacyNames: ["OSU_DEFAULT_ID"],
    name: EnvVariable.OSU_API_DEFAULT_ID,
  },
  {
    block: EnvVariableBlock.OSU_API,
    default: (configDir) =>
      path.relative(configDir, path.join(configDir, "osu_requests_config.db")),
    defaultValue: (configDir) =>
      path.resolve(path.join(configDir, "osu_requests_config.db")),
    description:
      "The database file path that contains the persistent osu! (beatmap) requests configuration.",
    legacyNames: ["OSU_API_RECOGNIZE_MAP_REQUESTS_DATABASE_PATH"],
    name: EnvVariable.OSU_API_REQUESTS_CONFIG_DATABASE_PATH,
  },
  {
    block: EnvVariableBlock.OSU_API,
    description: `If beatmap requests are enabled (${ENV_PREFIX}${
      EnvVariable.OSU_ENABLE_COMMANDS
    }=${
      OsuCommands.REQUESTS
    }) additionally output more detailed information about the map in the chat. This can also be set at runtime (${convertRegexToHumanString(
      regexOsuChatHandlerCommandRequestsSet
    )}) and stored persistently in a database (${ENV_PREFIX}${
      EnvVariable.OSU_API_REQUESTS_CONFIG_DATABASE_PATH
    }) but if provided will override the current value in the database on start of the bot.`,
    example: EnvVariableOnOff.ON,
    legacyNames: [
      "OSU_RECOGNIZE_MAP_REQUESTS_DETAILED",
      "OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED",
    ],
    name: EnvVariable.OSU_API_REQUESTS_DETAILED,
    supportedValues: { values: Object.values(EnvVariableOnOff) },
  },
  {
    block: EnvVariableBlock.OSU_API,
    description: `If beatmap requests are enabled (${ENV_PREFIX}${
      EnvVariable.OSU_ENABLE_COMMANDS
    }=${
      OsuCommands.REQUESTS
    }) make it that only messages that used a channel point redeem will be recognized. This can also be set at runtime (${convertRegexToHumanString(
      regexOsuChatHandlerCommandRequestsSet
    )}) and stored persistently in a database (${ENV_PREFIX}${
      EnvVariable.OSU_API_REQUESTS_CONFIG_DATABASE_PATH
    }) but if provided will override the current value in the database on start of the bot.`,
    example: "651f5474-07c2-4406-9e59-37d66fd34069",
    legacyNames: ["OSU_API_RECOGNIZE_MAP_REQUESTS_REDEEM_ID"],
    name: EnvVariable.OSU_API_REQUESTS_REDEEM_ID,
  },
  {
    block: EnvVariableBlock.OSU_IRC,
    censor: true,
    description:
      "The osu! irc server password and senderUserName. To get them go to https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email Verification' button does not reveal a text input refresh the page and click the button again -> this also means you get a new code!)",
    example: "senderServerPassword",
    name: EnvVariable.OSU_IRC_PASSWORD,
  },
  {
    block: EnvVariableBlock.OSU_IRC,
    description: `Check the description of ${ENV_PREFIX}${EnvVariable.OSU_IRC_PASSWORD}.`,
    example: "senderUserName",
    name: EnvVariable.OSU_IRC_USERNAME,
  },
  {
    block: EnvVariableBlock.OSU_IRC,
    description:
      "The osu! account name that should receive the requests (can be the same account as the sender!).",
    example: "receiverUserName",
    name: EnvVariable.OSU_IRC_REQUEST_TARGET,
  },
  {
    block: EnvVariableBlock.OSU_STREAM_COMPANION,
    description: `osu! StreamCompanion URL (websocket interface) to use a running StreamCompanion instance to get the currently being played beatmap, used mods and more (Providing a value will ignore ${ENV_PREFIX}${EnvVariable.OSU_STREAM_COMPANION_DIR_PATH}). Many users have problem with the websocket interface but the file interface worked for everyone so far.`,
    example: "localhost:20727",
    name: EnvVariable.OSU_STREAM_COMPANION_URL,
  },
  {
    block: EnvVariableBlock.OSU_STREAM_COMPANION,
    description: `osu! StreamCompanion directory (file interface) path to use a running StreamCompanion instance to always get the currently being played beatmap, used mods and more (This is ignored if ${ENV_PREFIX}${EnvVariable.OSU_STREAM_COMPANION_URL} is also provided). To configure the StreamCompanion output and for example update certain values like the download link even when not playing a map you need to open StreamCompanion. Go to the section 'Output Patterns' and then edit the used rows (like 'np_all') to change the format. You can also change the 'Save event' of a row like for the current mods or download link so both will be live updated even if no song is played.`,
    example: "C:\\Program Files (x86)\\StreamCompanion\\Files",
    name: EnvVariable.OSU_STREAM_COMPANION_DIR_PATH,
  },
  {
    block: EnvVariableBlock.SPOTIFY,
    default: Object.values(SpotifyCommands)
      .sort()
      .join(ENV_LIST_SPLIT_CHARACTER),
    description: `${ENABLE_COMMANDS_DEFAULT_DESCRIPTION} If you don't provide Spotify API credentials the commands won't be enabled!`,
    name: EnvVariable.SPOTIFY_ENABLE_COMMANDS,
    supportedValues: {
      canBeJoinedAsList: true,
      emptyListValue: EnvVariableOtherListOptions.NONE,
      values: Object.values(SpotifyCommands)
        .map((id) => getChatCommandsSpotify(id))
        .flat(),
    },
  },
  {
    block: EnvVariableBlock.SPOTIFY,
    default: (configDir) =>
      path.relative(configDir, path.join(configDir, "spotify.db")),
    defaultValue: (configDir) =>
      path.resolve(path.join(configDir, "spotify.db")),
    description:
      "The database file path that contains the persistent spotify data.",
    name: EnvVariable.SPOTIFY_DATABASE_PATH,
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
    description:
      "Provide client id/secret to enable Spotify API calls or Spotify commands (get them by using https://developer.spotify.com/dashboard/applications and creating an application - give the application the name 'MoonpieBot' and add the redirect URI 'http://localhost:9727' by clicking the button 'edit settings' after clicking on the application entry in the dashboard). At the first start a browser window will open where you need to successfully authenticate once.",
    example: "abcdefghijklmnop",
    name: EnvVariable.SPOTIFY_API_CLIENT_ID,
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
    description: `Check the description of ${ENV_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_ID}.`,
    example: "abcdefghijklmnop",
    name: EnvVariable.SPOTIFY_API_CLIENT_SECRET,
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
    description: `Providing this token is not necessary but optional. You can get this token by authenticating once successfully using the ${ENV_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_ID} and ${ENV_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_SECRET}. This will be done automatically by this program if both values are provided (the browser window will open after starting). After a successful authentication via this website the refresh token can be copied from there but since it will be automatically stored in a database this variable does not need to be provided. If a value is found it is automatically written into the database and does not need to be provided after that.`,
    example: "abcdefghijklmnop",
    name: EnvVariable.SPOTIFY_API_REFRESH_TOKEN,
  },
  {
    block: EnvVariableBlock.TWITCH_API,
    censor: true,
    description:
      "Provide client id/access token to enable Twitch API calls in commands (get them by using https://twitchtokengenerator.com with the scopes you want to have). The recommended scopes are: `user:edit:broadcast` to edit stream title/game, `user:read:broadcast`, `chat:read`, `chat:edit`.",
    example: "abcdefghijklmnop",
    name: EnvVariable.TWITCH_API_ACCESS_TOKEN,
  },
  {
    block: EnvVariableBlock.TWITCH_API,
    censor: true,
    description: `Check the description of ${ENV_PREFIX}${EnvVariable.TWITCH_API_ACCESS_TOKEN}.`,
    example: "abcdefghijklmnop",
    name: EnvVariable.TWITCH_API_CLIENT_ID,
  },
];

export const envVariableStructure: EnvVariableStructureElement<EnvVariableBlock>[] =
  [
    {
      content:
        "This is an example config file for the MoonpieBot that contains all environment variables that the bot uses.",
      exampleFile: true,
      name: "File description",
    },
    {
      content: `You can either set the variables yourself or copy this file, rename it from \`${fileNameEnvExample}\` to \`${fileNameEnv}\` and edit it with your own values since this is just an example to show how it should look.`,
      exampleFile: true,
      name: "File purpose",
    },
    {
      content: `If a line that starts with '${ENV_PREFIX}' has the symbol '#' in front of it that means it will be ignored as a comment. This means you can add custom comments and easily enable/disable any '${ENV_PREFIX}' option by adding or removing that symbol.`,
      name: "How to edit file",
    },
    {
      block: EnvVariableBlock.LOGGING,
      content: "Customize how much and where should be logged.",
      name: "LOGGING",
    },
    {
      block: EnvVariableBlock.TWITCH,
      content:
        "REQUIRED variables that need to be set for ANY configuration to connect to Twitch chat.",
      name: "TWITCH",
    },
    {
      block: EnvVariableBlock.MOONPIE,
      content:
        "Every day a user can claim a moonpie and the count is saved in a persistent database.",
      name: "MOONPIE",
    },
    {
      block: EnvVariableBlock.OSU,
      content:
        "Given a StreamCompanion connection osu! beatmap information (!np) can be provided or given an osu! OAuth client ID/secret and osu! ID plus an osu! IRC login the bot can enable beatmap requests or fetch other osu! related information.",
      name: "OSU",
    },
    {
      block: EnvVariableBlock.OSU_API,
      content:
        "A osu! API connection can be enabled to enable beatmap requests and other osu! commands.",
      name: "OSU API",
    },
    {
      block: EnvVariableBlock.OSU_STREAM_COMPANION,
      content:
        "A osu! StreamCompanion (https://github.com/Piotrekol/StreamCompanion) connection can be enabled for a much better !np command via either a websocket OR file interface.",
      name: "OSU STREAM COMPANION",
    },
    {
      block: EnvVariableBlock.OSU_IRC,
      content:
        "Optional osu! IRC connection that can be enabled to send beatmap requests to the osu! client.",
      name: "OSU IRC",
    },
    {
      block: EnvVariableBlock.SPOTIFY,
      content: "Optional Spotify commands that can be enabled.",
      name: "SPOTIFY",
    },
    {
      block: EnvVariableBlock.SPOTIFY_API,
      content:
        "Given a Spotify client ID/secret the bot can fetch some Spotify related information like the currently played song.",
      name: "SPOTIFY API",
    },
    {
      block: EnvVariableBlock.CUSTOM_COMMANDS_BROADCASTS,
      content:
        "Custom commands and custom broadcasts can be added/edited/deleted via the Twitch chat which are persistently saved in a database. Custom commands will be checked for every new message. Custom broadcasts will be scheduled at start of the bot and rescheduled on any change.",
      name: "CUSTOM COMMANDS & BROADCASTS",
    },
    {
      block: EnvVariableBlock.TWITCH_API,
      content:
        "Optional Twitch API connection that can be enabled for advanced custom commands that for example set/get the current game/title.",
      name: "TWITCH API",
    },
    {
      block: EnvVariableBlock.LURK,
      content: "Lurk command that welcomes chatters back.",
      name: "LURK",
    },
  ];
