/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";

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

  if (enabled.includes("claim")) {
    commands.push("!moonpie [claim one moonepie per day]");
  }
  if (enabled.includes("leaderboard")) {
    commands.push("!moonpie leaderboard [get the top moonpie holder]");
  }
  if (enabled.includes("get")) {
    commands.push("!moonpie get $USER [get the moonpie count of a user]");
  }
  if (enabled.includes("set")) {
    commands.push("!moonpie set $USER $COUNT [set moonpies of a user]");
  }
  if (enabled.includes("add")) {
    commands.push("!moonpie add $USER $COUNT [add moonpies to a user]");
  }
  if (enabled.includes("remove")) {
    commands.push("!moonpie remove $USER $COUNT [remove moonpies of a user]");
  }
  if (enabled.includes("delete")) {
    commands.push("!moonpie delete $USER [remove a user from the database]");
  }
  if (enabled.includes("about")) {
    commands.push("!moonpie about [get version and source code]");
  }

  if (commands.length === 0) {
    commands.push("None");
  }

  const sentMessage = await client.say(
    channel,
    "The following commands are supported: " + commands.join(", ")
  );

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "moonpieCommands" }
  );
};
