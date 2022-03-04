// Package imports
import osuApiV2, { GameMode, User } from "osu-api-v2";
// Local imports
import { errorMessageIdUndefined, loggerCommand } from "../commandHelper";
// Type imports
import type { Client } from "tmi.js";
import type { Logger } from "winston";
import { OsuApiV2Credentials } from "../osu";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const mapUserToStr = (user: User) => {
  let finalString = "";
  const joinDate = new Date();
  const joinDateMonth = joinDate.getMonth();
  const joinDateYear = joinDate.getFullYear();

  finalString += `${user.username} (https://osu.ppy.sh/users/${user.id}) from ${
    user.country.name
  } plays with ${user.playstyle.join(", ")} since ${
    // eslint-disable-next-line security/detect-object-injection
    monthNames[joinDateMonth]
  } ${joinDateYear}`;
  if (user.statistics) {
    finalString += ` has the global rank #${
      user.statistics.global_rank
    } and country rank #${user.statistics.country_rank} with ${
      Math.round(user.statistics.pp * 100) / 100
    }pp, ${
      Math.round(user.statistics.hit_accuracy * 100) / 100
    }% accuracy, a max combo of ${user.statistics.maximum_combo}, ${
      user.statistics.grade_counts.ssh
    } SSH, ${user.statistics.grade_counts.ss} SS, ${
      user.statistics.grade_counts.sh
    } SH, ${user.statistics.grade_counts.s} S, ${
      user.statistics.grade_counts.a
    } A`;
  } else {
    finalString += " [Error: Statistics not found]";
  }
  const UserAchievements = user.user_achievements;
  if (UserAchievements) {
    const haveBunny = UserAchievements.find((a) => a.achievement_id === 6);
    const haveTutel = UserAchievements.find((a) => a.achievement_id === 151);

    finalString += ` - they also have ${
      UserAchievements.length
    } achievements [bunny=${haveBunny ? "yes" : "no"}, tutel=${
      haveTutel ? "yes" : "no"
    }]`;
  }
  return finalString;
};

/**
 * NP (now playing) command: Send the map that is currently playing in osu
 *
 * @param client Twitch client (used to send messages)
 * @param channel Twitch channel where the message should be sent to
 * @param messageId Twitch message ID of the request (used for logging)
 * @param logger Logger (used for logging)
 */
export const commandPp = async (
  client: Client,
  channel: string,
  messageId: string | undefined,
  osuApiV2Credentials: OsuApiV2Credentials,
  defaultOsuId: number,
  customOsuId: undefined | number,
  logger: Logger
): Promise<void> => {
  if (messageId === undefined) {
    throw errorMessageIdUndefined();
  }

  const oauthAccessToken = await osuApiV2.oauth.clientCredentialsGrant(
    osuApiV2Credentials.clientId,
    osuApiV2Credentials.clientSecret
  );

  const user = await osuApiV2.users.id(
    oauthAccessToken,
    customOsuId !== undefined ? customOsuId : defaultOsuId,
    GameMode.osu
  );
  const message = mapUserToStr(user);
  const sentMessage = await client.say(channel, message);

  loggerCommand(
    logger,
    `Successfully replied to message ${messageId}: '${JSON.stringify(
      sentMessage
    )}'`,
    { commandId: "osuNp" }
  );
};
