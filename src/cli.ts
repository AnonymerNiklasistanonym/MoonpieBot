import { promises as fs } from "fs";
import * as path from "path";

/** Path to the root directory of the source code. */
const pathToRootDir = path.join(__dirname, "..");

/**
 * Command line interface handling.
 */

export const CliVariablePrefix = "MOONPIE_CONFIG_";

export enum CliVariable {
  LOGGING_CONSOLE_LOG_LEVEL = "LOGGING_CONSOLE_LOG_LEVEL",
  LOGGING_DIRECTORY_PATH = "LOGGING_DIRECTORY_PATH",
  LOGGING_FILE_LOG_LEVEL = "LOGGING_FILE_LOG_LEVEL",
  TWITCH_CHANNELS = "TWITCH_CHANNELS",
  TWITCH_NAME = "TWITCH_NAME",
  TWITCH_OAUTH_TOKEN = "TWITCH_OAUTH_TOKEN",
  MOONPIE_ENABLE_COMMANDS = "MOONPIE_ENABLE_COMMANDS",
  MOONPIE_DATABASE_PATH = "MOONPIE_DATABASE_PATH",
  OSU_ENABLE_COMMANDS = "OSU_ENABLE_COMMANDS",
  OSU_API_CLIENT_ID = "OSU_API_CLIENT_ID",
  OSU_API_CLIENT_SECRET = "OSU_API_CLIENT_SECRET",
  OSU_API_DEFAULT_ID = "OSU_API_DEFAULT_ID",
  OSU_API_RECOGNIZE_MAP_REQUESTS = "OSU_API_RECOGNIZE_MAP_REQUESTS",
  OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED = "OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED",
  OSU_IRC_PASSWORD = "OSU_IRC_PASSWORD",
  OSU_IRC_USERNAME = "OSU_IRC_USERNAME",
  OSU_IRC_REQUEST_TARGET = "OSU_IRC_REQUEST_TARGET",
  OSU_STREAM_COMPANION_URL = "OSU_STREAM_COMPANION_URL",
  TWITCH_API_CLIENT_ID = "TWITCH_API_CLIENT_ID",
  TWITCH_API_ACCESS_TOKEN = "TWITCH_API_ACCESS_TOKEN",
}

export enum CliVariableBlocks {
  LOGGING = "LOGGING",
  TWITCH = "TWITCH",
  MOONPIE = "MOONPIE",
  OSU = "OSU",
  OSU_API = "OSU_API",
  OSU_IRC = "OSU_IRC",
  OSU_STREAM_COMPANION = "OSU_STREAM_COMPANION",
  TWITCH_API = "TWITCH_API",
}

export const printCliVariablesToConsole = (censor = true) => {
  for (const cliVariable in CliVariable) {
    const cliVariableName = `${CliVariablePrefix}${cliVariable.toString()}`;
    // eslint-disable-next-line security/detect-object-injection
    const cliVariableValue = process.env[cliVariableName];

    const cliVariableInformation = getCliVariableValueInformation(cliVariable);
    let cliVariableValueString = "Not found!";
    if (cliVariableValue !== undefined) {
      cliVariableValueString = `"${cliVariableValue}"`;
      if (censor && cliVariableInformation.censor) {
        // Censor secret variables per default
        cliVariableValueString = "*******[secret]********";
      }
      if (cliVariableValue.length === 0) {
        cliVariableValueString = "Empty string!";
      }
    } else if (cliVariableInformation.default !== undefined) {
      cliVariableValueString += ` (default="${cliVariableInformation.default}")`;
    } else if (cliVariableInformation.example !== undefined) {
      cliVariableValueString += ` (example="${cliVariableInformation.example}")`;
    }

    if (cliVariableInformation.necessary) {
      cliVariableValueString += " (NECESSARY!)";
    }

    console.log(
      `${CliVariablePrefix}${cliVariable.toString()}=${cliVariableValueString}`
    );
  }
};

export const getCliVariableValue = (
  cliVariable: CliVariable
): string | undefined => {
  return process.env[getCliVariableName(cliVariable)];
};

export const getCliVariableValueOrCustomDefault = <T>(
  cliVariable: CliVariable,
  defaultValue: T
): string | T => {
  const value = process.env[getCliVariableName(cliVariable)];
  if (value === undefined || value.trim().length === 0) {
    return defaultValue;
  }
  return value;
};

export interface CliVariableValueInformation {
  default?: string;
  example?: string;
  description: string;
  supportedValues?: string[];
  block: CliVariableBlocks;
  necessary?: boolean;
  censor?: boolean;
}

export const getCliVariableValueInformation = (
  cliVariable: CliVariable | string
): CliVariableValueInformation => {
  switch (cliVariable) {
    case CliVariable.LOGGING_CONSOLE_LOG_LEVEL:
      return {
        default: "info",
        description:
          "The log level of the log messages that are printed to the console.",
        supportedValues: ["error", "warn", "debug", "info"],
        block: CliVariableBlocks.LOGGING,
      };
    case CliVariable.LOGGING_DIRECTORY_PATH:
      return {
        default: path.relative(pathToRootDir, path.join(pathToRootDir, "logs")),
        description: "The directory file path of the log files",
        block: CliVariableBlocks.LOGGING,
      };
    case CliVariable.LOGGING_FILE_LOG_LEVEL:
      return {
        default: "debug",
        description:
          "The log level of the log messages that are written to the log files.",
        supportedValues: ["error", "warn", "debug", "info"],
        block: CliVariableBlocks.LOGGING,
      };

    case CliVariable.TWITCH_CHANNELS:
      return {
        example: "twitch_channel_name another_twitch_channel_name",
        description:
          "A with a space separated list of all the channels the bot should be active.",
        block: CliVariableBlocks.TWITCH,
        necessary: true,
      };
    case CliVariable.TWITCH_NAME:
      return {
        example: "twitch_channel_name",
        description: "The name of the twitch account that should be imitated.",
        block: CliVariableBlocks.TWITCH,
        necessary: true,
      };
    case CliVariable.TWITCH_OAUTH_TOKEN:
      return {
        example: "oauth:abcdefghijklmnop",
        description:
          "An Twitch OAuth token (get it from: https://twitchapps.com/tmi/).",
        block: CliVariableBlocks.TWITCH,
        necessary: true,
        censor: true,
      };

    case CliVariable.MOONPIE_ENABLE_COMMANDS:
      return {
        default: "about,claim,commands,delete,get,leaderboard,remove,set",
        supportedValues: [
          "about",
          "claim",
          "commands",
          "delete",
          "get",
          "leaderboard",
          "remove",
          "set",
          "none",
        ],
        description:
          "You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).",
        block: CliVariableBlocks.MOONPIE,
      };
    case CliVariable.MOONPIE_DATABASE_PATH:
      return {
        default: path.relative(
          pathToRootDir,
          path.join(pathToRootDir, "moonpie.db")
        ),
        description:
          "The database file path that contains the persistent moonpie data.",
        block: CliVariableBlocks.MOONPIE,
      };

    case CliVariable.OSU_ENABLE_COMMANDS:
      return {
        default: "np,pp,rp",
        supportedValues: ["np", "pp", "rp", "none"],
        description:
          "You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled). If you don't provide osu! API credentials and/or a StreamCompanion connection commands that need that won't be enabled!",
        block: CliVariableBlocks.OSU,
      };

    case CliVariable.OSU_API_CLIENT_ID:
      return {
        example: "1234",
        description:
          "The osu! client ID (and client secret) to use the osu! api v2. To get it go to your account settings, Click 'New OAuth application' and add a custom name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that you can copy the client ID (and client secret).",
        block: CliVariableBlocks.OSU_API,
        censor: true,
      };
    case CliVariable.OSU_API_CLIENT_SECRET:
      return {
        example: "dadasfsafsafdsadffasfsafasfa",
        description: `Check the description of ${CliVariablePrefix}${CliVariable.OSU_API_CLIENT_ID}.`,
        block: CliVariableBlocks.OSU_API,
        censor: true,
      };
    case CliVariable.OSU_API_DEFAULT_ID:
      return {
        example: "1185432",
        description:
          "The default osu! account ID used to check for recent play or a top play on a map.",
        block: CliVariableBlocks.OSU_API,
      };
    case CliVariable.OSU_API_RECOGNIZE_MAP_REQUESTS:
      return {
        default: "OFF",
        supportedValues: ["ON", "OFF"],
        description:
          "Automatically recognize beatmap links (=requests) in chat.",
        block: CliVariableBlocks.OSU_API,
      };
    case CliVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED:
      return {
        default: "OFF",
        supportedValues: ["ON", "OFF"],
        description: `If recognizing is enabled (${CliVariablePrefix}${CliVariable.OSU_API_RECOGNIZE_MAP_REQUESTS}=ON) additionally output more detailed information about the map in the chat.`,
        block: CliVariableBlocks.OSU_API,
      };

    case CliVariable.OSU_IRC_PASSWORD:
      return {
        example: "senderServerPassword",
        supportedValues: ["ON", "OFF"],
        description:
          "The osu! irc server password and senderUserName. To get them go to https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email Verification' button does not reveal a text input refresh the page and click the button again -> this also means you get a new code!)",
        block: CliVariableBlocks.OSU_IRC,
        censor: true,
      };
    case CliVariable.OSU_IRC_USERNAME:
      return {
        example: "senderUserName",
        supportedValues: ["ON", "OFF"],
        description: `Check the description of ${CliVariablePrefix}${CliVariable.OSU_IRC_PASSWORD}.`,
        block: CliVariableBlocks.OSU_IRC,
      };
    case CliVariable.OSU_IRC_REQUEST_TARGET:
      return {
        example: "receiverUserName",
        description:
          "The osu! account name that should receive the requests (can be the same account as the sender!).",
        block: CliVariableBlocks.OSU_IRC,
      };

    case CliVariable.OSU_STREAM_COMPANION_URL:
      return {
        example: "localhost:20727",
        description:
          "osu! StreamCompanion URL to use a running StreamCompanion instance (https://github.com/Piotrekol/StreamCompanion) to always get the currently being played beatmap and used mods.",
        block: CliVariableBlocks.OSU_STREAM_COMPANION,
      };

    case CliVariable.TWITCH_API_CLIENT_ID:
      return {
        example: "abcdefghijklmnop",
        description:
          "Provide client id/access token to enable Twitch api calls in commands (get them by using https://twitchtokengenerator.com with the scopes you want to have). The recommended scopes are: `user:edit:broadcast` to edit stream title/game, `user:read:broadcast`, `chat:read`, `chat:edit`.",
        block: CliVariableBlocks.TWITCH_API,
        censor: true,
      };
    case CliVariable.TWITCH_API_ACCESS_TOKEN:
      return {
        example: "abcdefghijklmnop",
        description: `Check the description of ${CliVariablePrefix}${CliVariable.TWITCH_API_CLIENT_ID}.`,
        block: CliVariableBlocks.TWITCH_API,
        censor: true,
      };
  }
  throw Error(`The Cli variable ${cliVariable} has no information`);
};

export const getCliVariableValueOrDefault = (cliVariable: CliVariable) => {
  const value = process.env[getCliVariableName(cliVariable)];
  if (value === undefined || value.trim().length === 0) {
    const variableInformation = getCliVariableValueInformation(cliVariable);
    if (variableInformation.default !== undefined) {
      return variableInformation.default;
    }
    throw Error(`The Cli variable ${cliVariable} has no default`);
  }
  return value;
};

export const getCliVariableName = (cliVariable: CliVariable): string => {
  return `${CliVariablePrefix}${cliVariable.toString()}`;
};

export interface CliVariableStructureTextBlock {
  name: string;
  content: string;
}
export interface CliVariableStructureVariablesBlock {
  block: CliVariableBlocks;
  name: string;
  description: string;
}

export const cliVariableStructure: (
  | CliVariableStructureTextBlock
  | CliVariableStructureVariablesBlock
)[] = [
  {
    name: "File description",
    content:
      "This is an example config file for the MoonpieBot that contains all environment variables that the bot uses.",
  },
  {
    name: "File purpose",
    content:
      "You can either set the variables yourself or copy this file, rename it from `.env.example` to `.env` and edit it with your own values since this is just an example to show how it should look.",
  },
  {
    name: "How to edit file",
    content: `If a line that starts with '${CliVariablePrefix}' has the symbol '#' in front of it that means it will be ignored as a comment. This means you can add custom comments and easily enable/disable any '${CliVariablePrefix}' option by adding or removing that symbol.`,
  },
  {
    block: CliVariableBlocks.LOGGING,
    name: "LOGGING",
    description: "Customize how much and where should be logged.",
  },
  {
    block: CliVariableBlocks.TWITCH,
    name: "TWITCH",
    description:
      "Necessary variables that need to be set for ANY configuration to connect to Twitch chat.",
  },
  {
    block: CliVariableBlocks.MOONPIE,
    name: "MOONPIE",
    description:
      "Customize the moonpie functionality that is enabled per default.",
  },
  {
    block: CliVariableBlocks.OSU,
    name: "OSU",
    description: "Optional osu! commands that can be enabled.",
  },
  {
    block: CliVariableBlocks.OSU_API,
    name: "OSU API",
    description:
      "Optional osu! API connection that can be enabled to use more osu! commands or detect beatmap requests.",
  },
  {
    block: CliVariableBlocks.OSU_STREAM_COMPANION,
    name: "OSU STREAM COMPANION",
    description:
      "Optional osu! StreamCompanion connection that can be enabled for a much better !np command.",
  },
  {
    block: CliVariableBlocks.TWITCH_API,
    name: "Twitch API",
    description:
      "Optional Twitch API connection that can be enabled for advanced custom commands that for example set/get the current game/title.",
  },
];

export const splitTextAtLength = (textInput: string, splitLength: number) => {
  const allWords = textInput.split(" ");
  const out = [""];
  let first = true;
  for (const word of allWords) {
    if (out[out.length - 1].length + 1 + word.length > splitLength) {
      out.push(word);
    } else {
      out[out.length - 1] += `${first ? "" : " "}${word}`;
      first = false;
    }
  }
  return out;
};

export const writeCliVariableDocumentation = async (path: string) => {
  let data = "";
  const maxLineLength = 78;

  for (const structurePart of cliVariableStructure) {
    if (!(structurePart as CliVariableStructureVariablesBlock)?.block) {
      // Just a text block
      const structurePartText = structurePart as CliVariableStructureTextBlock;
      const textData = splitTextAtLength(
        structurePartText.content,
        maxLineLength
      );
      for (const textDataPart of textData) {
        data += `# ${textDataPart}\n`;
      }
    } else {
      // Variable documentation block
      const structurePartVariables =
        structurePart as CliVariableStructureVariablesBlock;
      data += `${"#".repeat(maxLineLength + 2)}\n`;
      data += `# ${structurePartVariables.name}\n`;
      data += `# ${"-".repeat(structurePartVariables.name.length)}\n`;
      const descriptionData = splitTextAtLength(
        structurePartVariables.description,
        maxLineLength
      );
      for (const descriptionDataPart of descriptionData) {
        data += `# ${descriptionDataPart}\n`;
      }
      data += `${"#".repeat(maxLineLength + 2)}\n`;
      // Now add for each variable of the block the documentation
      for (const cliVariable in CliVariable) {
        const cliVariableInfo = getCliVariableValueInformation(cliVariable);
        if (cliVariableInfo?.block === structurePartVariables.block) {
          const variableDescriptionData = splitTextAtLength(
            cliVariableInfo.description,
            maxLineLength - 2
          );
          let first = true;
          for (const variableDescriptionDataPart of variableDescriptionData) {
            data += `# ${first ? ">" : " "} ${variableDescriptionDataPart}\n`;
            first = false;
          }
          if (cliVariableInfo.supportedValues) {
            const supportedValuesText = splitTextAtLength(
              `Supported values are: ${cliVariableInfo.supportedValues.join(
                ", "
              )})`,
              maxLineLength - 2
            );
            let first = true;
            for (const supportedValuesTextPart of supportedValuesText) {
              data += `#   ${first ? "(" : " "}${supportedValuesTextPart}\n`;
              first = false;
            }
          }
          if (cliVariableInfo.censor) {
            data += `#   [KEEP THIS VARIABLE PRIVATE!]\n`;
          }
          if (cliVariableInfo.default) {
            data += `${
              cliVariableInfo.necessary ? "" : "#"
            }${CliVariablePrefix}${cliVariable}=${cliVariableInfo.default}\n`;
          } else if (cliVariableInfo.example) {
            data += `#   (The following line is only an example!)\n`;
            data += `${
              cliVariableInfo.necessary ? "" : "#"
            }${CliVariablePrefix}${cliVariable}=${cliVariableInfo.example}\n`;
          } else {
            data += "# ERROR\n";
          }
        }
      }
    }
    data += `\n`;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, data);
};
