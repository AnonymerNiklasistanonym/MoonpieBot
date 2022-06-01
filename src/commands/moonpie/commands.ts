import { errorMessageIdUndefined, loggerCommandReply } from "../commandHelper";
import { MoonpieCommands, MOONPIE_COMMAND_ID } from "../moonpie";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";

export const commandCommands = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  enabled: string[],
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const commands = [];

  if (enabled.includes(MoonpieCommands.CLAIM)) {
    commands.push("!moonpie [claim one moonepie per day]");
  }
  if (enabled.includes(MoonpieCommands.LEADERBOARD)) {
    commands.push("!moonpie leaderboard [get the top moonpie holder]");
  }
  if (enabled.includes(MoonpieCommands.GET)) {
    commands.push("!moonpie get $USER [get the moonpie count of a user]");
  }
  if (enabled.includes(MoonpieCommands.SET)) {
    commands.push("!moonpie set $USER $COUNT [set moonpies of a user]");
  }
  if (enabled.includes(MoonpieCommands.ADD)) {
    commands.push("!moonpie add $USER $COUNT [add moonpies to a user]");
  }
  if (enabled.includes(MoonpieCommands.REMOVE)) {
    commands.push("!moonpie remove $USER $COUNT [remove moonpies of a user]");
  }
  if (enabled.includes(MoonpieCommands.DELETE)) {
    commands.push("!moonpie delete $USER [remove a user from the database]");
  }
  if (enabled.includes(MoonpieCommands.ABOUT)) {
    commands.push("!moonpie about [get version and source code]");
  }

  if (commands.length === 0) {
    commands.push("None");
  }

  const sentMessage = await client.say(
    channel,
    "The following commands are supported: " + commands.join(", ")
  );

  loggerCommandReply(
    logger,
    messageId,
    sentMessage,
    MOONPIE_COMMAND_ID,
    MoonpieCommands.COMMANDS
  );
};
