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
  OsuCommands,
  SpotifyCommands,
} from "./chatCommands";
import { genericStringSorter } from "../other/genericStringSorter";
// Type imports
import type { FeatureInfo, GetFeatures } from "../features";
import type { DeepReadonly } from "../other/types";
import type { MoonpieConfig } from "./config/moonpieConfig";

export enum Feature {
  ABOUT = "ABOUT",
  CUSTOM_CS_BS = "CUSTOM_CS_BS",
  LURK = "LURK",
  MOONPIE = "MOONPIE",
  OSU_API = "OSU_API",
  OSU_API_BEATMAP_REQUESTS = "OSU_API_BEATMAP_REQUESTS",
  OSU_IRC_BEATMAP_REQUESTS = "OSU_IRC_BEATMAP_REQUESTS",
  OSU_STREAM_COMPANION_FILE = "OSU_STREAM_COMPANION_FILE",
  OSU_STREAM_COMPANION_WEB = "OSU_STREAM_COMPANION_WEB",
  SPOTIFY_API = "SPOTIFY_API",
  TWITCH_API = "TWITCH_API",
}

export interface FeatureDataAbout {
  enableCommands: DeepReadonly<MoonpieCommands[]>;
}
export interface FeatureDataMoonpie {
  claimCooldownHours: number;
  databasePath: string;
  enableCommands: DeepReadonly<MoonpieCommands[]>;
}
export interface FeatureDataTwitchApi {
  accessToken: string;
  clientId: string;
}
export interface FeatureDataOsuApi {
  clientId: number;
  clientSecret: string;
  databasePath: string;
  defaultId: number;
  enableCommands: DeepReadonly<OsuCommands[]>;
}
export interface FeatureDataOsuApiBeatmapRequests extends FeatureDataOsuApi {
  beatmapRequestsDetailed?: boolean;
  beatmapRequestsRedeemId?: string;
}
export interface FeatureDataOsuIrc {
  password: string;
  requestTarget: string;
  username: string;
}
export interface FeatureDataOsuStreamCompanion {
  enableCommands: DeepReadonly<OsuCommands[]>;
}
export interface FeatureDataOsuStreamCompanionFile
  extends FeatureDataOsuStreamCompanion {
  dirPath: string;
}
export interface FeatureDataOsuStreamCompanionWeb
  extends FeatureDataOsuStreamCompanion {
  url: string;
}
export interface FeatureDataSpotifyApi {
  clientId: string;
  clientSecret: string;
  databasePath: string;
  enableCommands: DeepReadonly<SpotifyCommands[]>;
  refreshToken?: string;
}
export interface FeatureDataCustomCommandsBroadcasts {
  databasePath: string;
  enableCommands: DeepReadonly<CustomCommandsBroadcastsCommands[]>;
}
export interface FeatureDataLurk {
  enableCommands: DeepReadonly<LurkCommands[]>;
}

export type Features =
  | FeatureInfo<Feature.ABOUT, FeatureDataAbout>
  | FeatureInfo<Feature.CUSTOM_CS_BS, FeatureDataCustomCommandsBroadcasts>
  | FeatureInfo<Feature.LURK, FeatureDataLurk>
  | FeatureInfo<Feature.MOONPIE, FeatureDataMoonpie>
  | FeatureInfo<Feature.OSU_API, FeatureDataOsuApi>
  | FeatureInfo<
      Feature.OSU_API_BEATMAP_REQUESTS,
      FeatureDataOsuApiBeatmapRequests
    >
  | FeatureInfo<Feature.OSU_IRC_BEATMAP_REQUESTS, FeatureDataOsuIrc>
  | FeatureInfo<
      Feature.OSU_STREAM_COMPANION_FILE,
      FeatureDataOsuStreamCompanionFile
    >
  | FeatureInfo<
      Feature.OSU_STREAM_COMPANION_WEB,
      FeatureDataOsuStreamCompanionWeb
    >
  | FeatureInfo<Feature.SPOTIFY_API, FeatureDataSpotifyApi>
  | FeatureInfo<Feature.TWITCH_API, FeatureDataTwitchApi>;

export const getFeatures: GetFeatures<
  Features[],
  DeepReadonly<MoonpieConfig>
> = (config, logger) => {
  const features: Features[] = [];

  if (config.moonpie !== undefined) {
    const moonpieFeatures: Features[] = [];
    if (config.moonpie.enableCommands.includes(MoonpieCommands.ABOUT)) {
      const enableCommands = config.moonpie.enableCommands.filter(
        (a) => a === MoonpieCommands.COMMANDS || a === MoonpieCommands.ABOUT
      );
      moonpieFeatures.push({
        chatCommands: enableCommands
          .map((id) => getChatCommandsMoonpie(id))
          .flat(),
        data: {
          enableCommands,
        },
        description: "Support a command for version information",
        id: Feature.ABOUT,
      });
    }
    if (
      config.moonpie.enableCommands.filter(
        (a) => a !== MoonpieCommands.COMMANDS && a !== MoonpieCommands.ABOUT
      ).length > 0
    ) {
      const enableCommands = config.moonpie.enableCommands.filter(
        (a) => a !== MoonpieCommands.ABOUT
      );
      moonpieFeatures.push({
        chatCommands: enableCommands
          .map((id) => getChatCommandsMoonpie(id))
          .flat(),
        data: {
          claimCooldownHours: config.moonpie.claimCooldownHours,
          databasePath: config.moonpie.databasePath,
          enableCommands,
        },
        description: "Support moonpie database and commands to manage them",
        id: Feature.MOONPIE,
      });
    }
    if (moonpieFeatures.length === 0) {
      logger.warn("No moonpie features found but moonpie config was not empty");
    }
    features.push(...moonpieFeatures);
  }

  let customCommandsFeatureEnabled = false;
  if (config.customCommandsBroadcasts) {
    customCommandsFeatureEnabled = true;
    features.push({
      chatCommands: config.customCommandsBroadcasts.enableCommands
        .map((id) => getChatCommandsCustomCommandsBroadcasts(id))
        .flat(),
      data: {
        databasePath: config.customCommandsBroadcasts.databasePath,
        enableCommands: config.customCommandsBroadcasts.enableCommands,
      },
      description:
        "Support custom commands/broadcasts stored in database and commands to change them",
      id: Feature.CUSTOM_CS_BS,
    });
  }

  if (config.lurk && config.lurk.enableCommands.includes(LurkCommands.LURK)) {
    features.push({
      chatCommands: config.lurk.enableCommands
        .map((id) => getChatCommandsLurk(id))
        .flat(),
      data: {
        enableCommands: config.lurk.enableCommands,
      },
      description: "Support a command for lurking",
      id: Feature.LURK,
    });
  }

  if (
    config.osuApi?.clientId !== undefined &&
    config.osuApi?.clientSecret !== undefined &&
    config.osuApi?.defaultId !== undefined
  ) {
    const enableCommands =
      config.osu !== undefined
        ? config.osu.enableCommands.filter(
            (a) =>
              a !== OsuCommands.LAST_REQUEST &&
              a !== OsuCommands.PERMIT_REQUEST &&
              a !== OsuCommands.REQUESTS
          )
        : [];
    const osuApiData: FeatureDataOsuApi = {
      clientId: config.osuApi.clientId,
      clientSecret: config.osuApi.clientSecret,
      databasePath: config.osuApi.databasePath,
      defaultId: config.osuApi.defaultId,
      enableCommands,
    };
    features.push({
      chatCommands: osuApiData.enableCommands
        .map((id) => getChatCommandsOsu(id))
        .flat(),
      data: osuApiData,
      description:
        "Support osu! API calls in custom commands/broadcasts or in the enabled commands",
      id: Feature.OSU_API,
    });

    if (config.osu?.enableCommands.includes(OsuCommands.REQUESTS)) {
      const enableCommandsRequests = config.osu.enableCommands.filter(
        (a) => a === OsuCommands.COMMANDS || a === OsuCommands.REQUESTS
      );
      features.push({
        chatCommands: enableCommandsRequests
          .map((id) => getChatCommandsOsu(id))
          .flat(),
        data: {
          ...osuApiData,
          beatmapRequestsDetailed: config.osuApi.beatmapRequestsDetailed,
          beatmapRequestsRedeemId: config.osuApi.beatmapRequestsRedeemId,
          enableCommands: enableCommandsRequests,
        },
        description:
          "Support osu! beatmap requests in Twitch chat using the osu! API and commands to manage them",
        id: Feature.OSU_API_BEATMAP_REQUESTS,
      });

      if (
        config.osuIrc?.password !== undefined &&
        config.osuIrc?.username !== undefined &&
        config.osuIrc?.requestTarget !== undefined
      ) {
        features.push({
          chatCommands: [],
          data: {
            password: config.osuIrc.password,
            requestTarget: config.osuIrc.requestTarget,
            username: config.osuIrc.username,
          },
          description:
            "Support sending beatmap requests via IRC messages to the osu! client",
          id: Feature.OSU_IRC_BEATMAP_REQUESTS,
        });
      }
    }
  }

  if (config.osuStreamCompanion?.url !== undefined) {
    const enableCommands = config.osu
      ? config.osu.enableCommands.filter(
          (a) => a === OsuCommands.COMMANDS || a === OsuCommands.NP
        )
      : [];
    features.push({
      chatCommands: enableCommands.map((id) => getChatCommandsOsu(id)).flat(),
      data: {
        enableCommands,
        url: config.osuStreamCompanion.url,
      },
      description:
        "Support getting current map/client information from osu! via " +
        "StreamCompanion using the web interface and will be used " +
        "in the enabled commands instead of the osu! API",
      id: Feature.OSU_STREAM_COMPANION_WEB,
    });
  } else if (config.osuStreamCompanion?.dirPath !== undefined) {
    const enableCommands = config.osu
      ? config.osu.enableCommands.filter(
          (a) => a === OsuCommands.COMMANDS || a === OsuCommands.NP
        )
      : [];
    features.push({
      chatCommands: enableCommands.map((id) => getChatCommandsOsu(id)).flat(),
      data: {
        dirPath: config.osuStreamCompanion.dirPath,
        enableCommands,
      },
      description:
        "Support getting current map/client information from osu! via " +
        "StreamCompanion using the file interface and will be used " +
        "in the enabled commands instead of the osu! API",
      id: Feature.OSU_STREAM_COMPANION_FILE,
    });
  }

  if (
    config.spotify?.databasePath !== undefined &&
    config.spotifyApi?.clientId !== undefined &&
    config.spotifyApi?.clientSecret !== undefined
  ) {
    features.push({
      chatCommands: config.spotify.enableCommands
        .map((id) => getChatCommandsSpotify(id))
        .flat(),
      data: {
        clientId: config.spotifyApi.clientId,
        clientSecret: config.spotifyApi.clientSecret,
        databasePath: config.spotify.databasePath,
        enableCommands: config.spotify.enableCommands,
        refreshToken: config.spotifyApi.refreshToken,
      },
      description:
        "Support Spotify API calls in custom commands/broadcasts and in enabled commands",
      id: Feature.SPOTIFY_API,
    });
  }

  if (
    customCommandsFeatureEnabled &&
    config.twitchApi?.clientId !== undefined &&
    config.twitchApi?.accessToken !== undefined
  ) {
    features.push({
      chatCommands: [],
      data: {
        accessToken: config.twitchApi.accessToken,
        clientId: config.twitchApi.clientId,
      },
      description:
        "Support advanced Twitch API calls in custom commands/broadcasts (for example to get/set the current game/title)",
      id: Feature.TWITCH_API,
    });
  }

  return features.sort((a, b) => genericStringSorter(a.id, b.id));
};

export const getFeature = (
  features: DeepReadonly<Features[]>,
  feature: Feature
): undefined | DeepReadonly<Features> => features.find((a) => a.id === feature);
