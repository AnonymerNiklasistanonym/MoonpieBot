import {
  Beatmap,
  BeatmapUserScore,
  RankedStatus,
  Score,
  User,
} from "osu-api-v2";
import { secondsToString } from "./timePeriodToString";

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

export const mapUserToStr = (user: User) => {
  let finalString = "";
  const joinDate = new Date(user.join_date);
  const joinDateMonth = joinDate.getMonth();
  const joinDateYear = joinDate.getFullYear();

  finalString += `${user.username} (https://osu.ppy.sh/users/${user.id}) from ${
    user.country.name
  } plays with ${user.playstyle.join(", ")} since ${
    // eslint-disable-next-line security/detect-object-injection
    monthNames[joinDateMonth]
  } ${joinDateYear}`;
  if (user.statistics) {
    finalString += ` and reached the global rank #${
      user.statistics.global_rank
    } [country rank #${user.statistics.country_rank}] with ${
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

export const mapToStr = (beatmap: Beatmap) => {
  let finalString = "";

  if (beatmap.beatmapset !== undefined && beatmap.beatmapset != null) {
    finalString += `${beatmap.beatmapset.title} '${beatmap.version}' [${
      Math.round(beatmap.difficulty_rating * 100 + Number.EPSILON) / 100
    }* ${secondsToString(beatmap.total_length)} ${mapRankedStatusToStr(
      beatmap.ranked
    )}] by ${beatmap.beatmapset.artist}`;
    finalString += ` {CS=${beatmap.cs}, DRAIN=${beatmap.drain}, ACC=${beatmap.accuracy}, AR=${beatmap.ar}, BPM=${beatmap.bpm}}`;
    finalString += ` (${beatmap.url})`;
  } else {
    finalString += " [Error: Beatmapset not found]";
  }
  return finalString;
};

export const mapRankedStatusToStr = (rankedStatus: RankedStatus) => {
  switch (rankedStatus) {
    case RankedStatus.approved:
      return "Approved";
    case RankedStatus.graveyard:
      return "Graveyard";
    case RankedStatus.loved:
      return "Loved";
    case RankedStatus.pending:
      return "Pending";
    case RankedStatus.qualified:
      return "Qualified";
    case RankedStatus.ranked:
      return "Ranked";
    case RankedStatus.wip:
      return "WIP";
  }
};

export const mapScoreToStr = (score: Score) => {
  let finalString = "";
  if (score.user) {
    finalString += `${score.user.username} (https://osu.ppy.sh/users/${score.user.id})`;
  } else {
    finalString += "[Error: User not found]";
  }
  if (score.passed) {
    finalString += ` achieved a ${score.rank}${score.perfect ? " (FC)" : ""}`;
    if (score.pp != null) {
      finalString += ` with ${
        Math.round(score.pp * 100 + Number.EPSILON) / 100
      }pp`;
    }
  } else {
    finalString += ` failed`;
  }
  finalString += ` (${score.statistics.count_300}/${score.statistics.count_100}/${score.statistics.count_50}/${score.statistics.count_miss})`;
  finalString += ` [max-combo=${score.max_combo},acc=${
    Math.round((score.accuracy * 100 + Number.EPSILON) * 100) / 100
  }%]`;

  if (score.beatmap !== undefined && score.beatmapset !== undefined) {
    finalString += ` on ${score.beatmapset.title} '${score.beatmap.version}' [${
      Math.round(score.beatmap.difficulty_rating * 100 + Number.EPSILON) / 100
    }* ${secondsToString(score.beatmap.total_length)} ${mapRankedStatusToStr(
      score.beatmap.ranked
    )}] by ${score.beatmapset.artist}`;
    if (score.mods.length > 0) {
      finalString += ` using ${score.mods.join(",")}`;
    }
    finalString += ` {CS=${score.beatmap.cs}, DRAIN=${score.beatmap.drain}, ACC=${score.beatmap.accuracy}, AR=${score.beatmap.ar}, BPM=${score.beatmap.bpm}}`;
    finalString += ` (${score.beatmap.url})`;
  } else {
    finalString += " [Error: Beatmap/-set not found]";
  }
  if (score.replay) {
    finalString += ` {replay available}`;
  }
  return finalString;
};

export const mapUserScoreToStr = (score: BeatmapUserScore) => {
  let finalString = "a";
  if (score.position === undefined || score.position === -1) {
    return "[Error: No score was found]";
  }
  if (score.score.passed) {
    finalString += ` ${score.score.rank}${score.score.perfect ? " (FC)" : ""}`;
    if (score.score.pp != null) {
      finalString += ` with ${
        Math.round(score.score.pp * 100 + Number.EPSILON) / 100
      }pp`;
    }
  } else {
    finalString += ` fail`;
  }
  if (score.score.mods.length > 0) {
    finalString += ` using ${score.score.mods.join(" ")}`;
  }
  finalString += ` (${score.score.statistics.count_300}/${score.score.statistics.count_100}/${score.score.statistics.count_50}/${score.score.statistics.count_miss})`;
  finalString += ` [max-combo=${score.score.max_combo},acc=${
    Math.round((score.score.accuracy * 100 + Number.EPSILON) * 100) / 100
  }%]`;

  if (score.score.replay) {
    finalString += ` {replay available}`;
  }
  return finalString;
};
