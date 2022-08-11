// Package imports
import path from "path";
// Local imports
import { LoggerLevel } from "../logging";
import { MoonpieCommands } from "./commands";
import { OsuCommands } from "./commands";
import { SpotifyCommands } from "./commands";
// Type imports
import type { CliEnvVariableInformation } from "../cli";

/**
 * Environment variable handling.
 */

/**
 * Environment variable prefix.
 */
export const ENV_VARIABLE_PREFIX = "MOONPIE_CONFIG_";

/**
 * Environment variable prefix for custom strings.
 */
export const ENV_STRINGS_VARIABLE_PREFIX = "MOONPIE_CUSTOM_STRING_";

/**
 * Environment variable values for ON/OFF.
 */
export enum EnvVariableOnOff {
  OFF = "OFF",
  ON = "ON",
}

/**
 * Environment variable values for other list elements.
 */
export enum EnvVariableNone {
  NONE = "none",
}

/**
 * Environment variables.
 */
export enum EnvVariable {
  LOGGING_CONSOLE_LOG_LEVEL = "LOGGING_CONSOLE_LOG_LEVEL",
  LOGGING_DIRECTORY_PATH = "LOGGING_DIRECTORY_PATH",
  LOGGING_FILE_LOG_LEVEL = "LOGGING_FILE_LOG_LEVEL",
  /** The amount of hours between which no moonpie can be claimed. */
  MOONPIE_CLAIM_COOLDOWN_HOURS = "MOONPIE_CLAIM_COOLDOWN_HOURS",
  /** The path to the moonpie database. */
  MOONPIE_DATABASE_PATH = "MOONPIE_DATABASE_PATH",
  /** Disable/Enable !moonpie commands. */
  MOONPIE_ENABLE_COMMANDS = "MOONPIE_ENABLE_COMMANDS",
  OSU_API_CLIENT_ID = "OSU_API_CLIENT_ID",
  OSU_API_CLIENT_SECRET = "OSU_API_CLIENT_SECRET",
  OSU_API_DEFAULT_ID = "OSU_API_DEFAULT_ID",
  OSU_API_RECOGNIZE_MAP_REQUESTS = "OSU_API_RECOGNIZE_MAP_REQUESTS",
  OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED = "OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED",
  OSU_ENABLE_COMMANDS = "OSU_ENABLE_COMMANDS",
  OSU_IRC_PASSWORD = "OSU_IRC_PASSWORD",
  OSU_IRC_REQUEST_TARGET = "OSU_IRC_REQUEST_TARGET",
  OSU_IRC_USERNAME = "OSU_IRC_USERNAME",
  OSU_STREAM_COMPANION_URL = "OSU_STREAM_COMPANION_URL",
  SPOTIFY_API_CLIENT_ID = "SPOTIFY_API_CLIENT_ID",
  SPOTIFY_API_CLIENT_SECRET = "SPOTIFY_API_CLIENT_SECRET",
  SPOTIFY_API_REFRESH_TOKEN = "SPOTIFY_API_REFRESH_TOKEN",
  SPOTIFY_ENABLE_COMMANDS = "SPOTIFY_ENABLE_COMMANDS",
  TWITCH_API_ACCESS_TOKEN = "TWITCH_API_ACCESS_TOKEN",
  TWITCH_API_CLIENT_ID = "TWITCH_API_CLIENT_ID",
  TWITCH_CHANNELS = "TWITCH_CHANNELS",
  TWITCH_DEBUG = "TWITCH_DEBUG",
  TWITCH_NAME = "TWITCH_NAME",
  TWITCH_OAUTH_TOKEN = "TWITCH_OAUTH_TOKEN",
}

export const ENV_LIST_SPLIT_CHARACTER = ",";

/**
 * Environment variables are grouped in blocks.
 * The order is important.
 */
export enum EnvVariableBlock {
  LOGGING = "LOGGING",
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

export const ENABLE_COMMANDS_DEFAULT_DESCRIPTION = `You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to '${EnvVariableNone.NONE}' if no commands should be enabled).`;

export interface EnvVariableData
  extends CliEnvVariableInformation<EnvVariable> {
  /** The ENV variable block. */
  block: EnvVariableBlock;
  /** Censor variable per default to prevent leaks. */
  censor?: boolean;
  /** The default value for example to display relative paths in 'default' but use absolute path as 'defaultValue'. */
  defaultValue?: string | ((configDir: string) => string);
  /** Legacy names of ENV variable. */
  legacyNames?: string[];
  /** Is required to run the program. */
  required?: boolean;
}

/**
 * ENV variable information.
 */
export const envVariableInformation: EnvVariableData[] = [
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
    example: "twitch_channel_name1 twitch_channel_name2",
    legacyNames: ["TWITCH_CHANNEL"],
    name: EnvVariable.TWITCH_CHANNELS,
    required: true,
  },
  {
    block: EnvVariableBlock.TWITCH,
    description: "The name of the twitch account that should be imitated.",
    example: "twitch_channel_name",
    name: EnvVariable.TWITCH_NAME,
    required: true,
  },
  {
    block: EnvVariableBlock.TWITCH,
    censor: true,
    description:
      "A Twitch OAuth token (get it from: https://twitchapps.com/tmi/).",
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
    block: EnvVariableBlock.MOONPIE,
    default: Object.values(MoonpieCommands).sort().join(","),
    description: ENABLE_COMMANDS_DEFAULT_DESCRIPTION,
    legacyNames: ["ENABLE_COMMANDS"],
    name: EnvVariable.MOONPIE_ENABLE_COMMANDS,
    supportedValues: {
      canBeJoinedAsList: true,
      emptyListValue: EnvVariableNone.NONE,
      values: Object.values(MoonpieCommands),
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
      "The number of hours for which a user is unable to claim a Moonpie after claiming one (less than 24 in case of daily streams).",
    legacyNames: ["MOONPIE_COOLDOWN_HOURS"],
    name: EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS,
  },
  {
    block: EnvVariableBlock.OSU,
    default: Object.values(OsuCommands).sort().join(","),
    description: `${ENABLE_COMMANDS_DEFAULT_DESCRIPTION} If you don't provide osu! API credentials and/or a StreamCompanion connection commands that need that won't be enabled!`,
    name: EnvVariable.OSU_ENABLE_COMMANDS,
    supportedValues: {
      canBeJoinedAsList: true,
      emptyListValue: EnvVariableNone.NONE,
      values: Object.values(OsuCommands),
    },
  },
  {
    block: EnvVariableBlock.OSU_API,
    censor: true,
    description:
      "The osu! client ID (and client secret) to use the osu! api v2. To get it go to your account settings, Click 'New OAuth application' and add a custom name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that you can copy the client ID (and client secret).",
    example: "1234",
    legacyNames: ["OSU_CLIENT_ID"],
    name: EnvVariable.OSU_API_CLIENT_ID,
  },
  {
    block: EnvVariableBlock.OSU_API,
    censor: true,
    description: `Check the description of ${ENV_VARIABLE_PREFIX}${EnvVariable.OSU_API_CLIENT_ID}.`,
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
    default: EnvVariableOnOff.OFF,
    description:
      "Automatically recognize osu! beatmap links (=requests) in chat.",
    legacyNames: ["OSU_RECOGNIZE_MAP_REQUESTS"],
    name: EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS,
    supportedValues: { values: Object.values(EnvVariableOnOff) },
  },
  {
    block: EnvVariableBlock.OSU_API,
    default: EnvVariableOnOff.OFF,
    description: `If recognizing is enabled (${ENV_VARIABLE_PREFIX}${EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS}=ON) additionally output more detailed information about the map in the chat.`,
    legacyNames: ["OSU_RECOGNIZE_MAP_REQUESTS_DETAILED"],
    name: EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED,
    supportedValues: { values: Object.values(EnvVariableOnOff) },
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
    description: `Check the description of ${ENV_VARIABLE_PREFIX}${EnvVariable.OSU_IRC_PASSWORD}.`,
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
    description:
      "osu! StreamCompanion URL to use a running StreamCompanion instance (https://github.com/Piotrekol/StreamCompanion) to always get the currently being played beatmap and used mods.",
    example: "localhost:20727",
    name: EnvVariable.OSU_STREAM_COMPANION_URL,
  },
  {
    block: EnvVariableBlock.SPOTIFY,
    default: Object.values(SpotifyCommands).sort().join(","),
    description: `${ENABLE_COMMANDS_DEFAULT_DESCRIPTION} If you don't provide Spotify API credentials the commands won't be enabled!`,
    name: EnvVariable.SPOTIFY_ENABLE_COMMANDS,
    supportedValues: {
      canBeJoinedAsList: true,
      emptyListValue: EnvVariableNone.NONE,
      values: Object.values(SpotifyCommands),
    },
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
    description:
      "Provide client id/secret to enable Twitch api calls in commands (get them by using https://developer.spotify.com/dashboard/applications and creating an application).",
    example: "abcdefghijklmnop",
    name: EnvVariable.SPOTIFY_API_CLIENT_ID,
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
    description: `Check the description of ${ENV_VARIABLE_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_ID}.`,
    example: "abcdefghijklmnop",
    name: EnvVariable.SPOTIFY_API_CLIENT_SECRET,
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
    description: `You can get this token by authenticating once successfully using the ${ENV_VARIABLE_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_ID} and ${ENV_VARIABLE_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_SECRET}. After the successful authentication via a website that will open you can copy the refresh token from there.`,
    example: "abcdefghijklmnop",
    name: EnvVariable.SPOTIFY_API_REFRESH_TOKEN,
  },
  {
    block: EnvVariableBlock.TWITCH_API,
    censor: true,
    description:
      "Provide client id/access token to enable Twitch api calls in commands (get them by using https://twitchtokengenerator.com with the scopes you want to have). The recommended scopes are: `user:edit:broadcast` to edit stream title/game, `user:read:broadcast`, `chat:read`, `chat:edit`.",
    example: "abcdefghijklmnop",
    name: EnvVariable.TWITCH_API_ACCESS_TOKEN,
  },
  {
    block: EnvVariableBlock.TWITCH_API,
    censor: true,
    description: `Check the description of ${ENV_VARIABLE_PREFIX}${EnvVariable.TWITCH_API_ACCESS_TOKEN}.`,
    example: "abcdefghijklmnop",
    name: EnvVariable.TWITCH_API_CLIENT_ID,
  },
];

export interface EnvVariableStructureTextBlock {
  content: string;
  name: string;
}
export interface EnvVariableStructureVariablesBlock {
  block: EnvVariableBlock;
  description: string;
  name: string;
}

export const envVariableStructure: (
  | EnvVariableStructureTextBlock
  | EnvVariableStructureVariablesBlock
)[] = [
  {
    content:
      "This is an example config file for the MoonpieBot that contains all environment variables that the bot uses.",
    name: "File description",
  },
  {
    content:
      "You can either set the variables yourself or copy this file, rename it from `.env.example` to `.env` and edit it with your own values since this is just an example to show how it should look.",
    name: "File purpose",
  },
  {
    content: `If a line that starts with '${ENV_VARIABLE_PREFIX}' has the symbol '#' in front of it that means it will be ignored as a comment. This means you can add custom comments and easily enable/disable any '${ENV_VARIABLE_PREFIX}' option by adding or removing that symbol.`,
    name: "How to edit file",
  },
  {
    block: EnvVariableBlock.LOGGING,
    description: "Customize how much and where should be logged.",
    name: "LOGGING",
  },
  {
    block: EnvVariableBlock.TWITCH,
    description:
      "Required variables that need to be set for ANY configuration to connect to Twitch chat.",
    name: "TWITCH",
  },
  {
    block: EnvVariableBlock.MOONPIE,
    description:
      "Customize the moonpie functionality that is enabled per default.",
    name: "MOONPIE",
  },
  {
    block: EnvVariableBlock.OSU,
    description: "Optional osu! commands that can be enabled.",
    name: "OSU",
  },
  {
    block: EnvVariableBlock.OSU_API,
    description:
      "Optional osu! API connection that can be enabled to use more osu! commands or detect beatmap requests.",
    name: "OSU API",
  },
  {
    block: EnvVariableBlock.OSU_STREAM_COMPANION,
    description:
      "Optional osu! StreamCompanion connection that can be enabled for a much better !np command.",
    name: "OSU STREAM COMPANION",
  },
  {
    block: EnvVariableBlock.SPOTIFY,
    description: "Optional Spotify commands that can be enabled.",
    name: "SPOTIFY",
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    description:
      "Optional Spotify API connection that can be enabled to use Spotify commands.",
    name: "SPOTIFY API",
  },
  {
    block: EnvVariableBlock.TWITCH_API,
    description:
      "Optional Twitch API connection that can be enabled for advanced custom commands that for example set/get the current game/title.",
    name: "Twitch API",
  },
];
