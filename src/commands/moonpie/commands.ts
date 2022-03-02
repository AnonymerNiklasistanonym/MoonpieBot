/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";

export const commandCommands = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const commands = [
    "!moonpie [claim one moonepie per day]",
    "!moonpie leaderboard [get the top moonpie holder]",
    "!moonpie get $USER [get the moonpie count of a user]",
    "!moonpie set $USER [set moonpies of a user]",
    "!moonpie add $USER [add moonpies to a user]",
    "!moonpie remove $USER $COUNT [remove moonpies of a user]",
    "!moonpie delete $USER [remove a user from the database]",
    "!moonpie about [get version and source code]",
  ];
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
