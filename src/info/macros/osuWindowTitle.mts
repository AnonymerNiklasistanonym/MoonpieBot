// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";

export interface MacroOsuWindowTitleData {
  artist: string;
  mapId?: number;
  title: string;
  version: string;
}
export enum MacroOsuWindowTitle {
  ARTIST = "ARTIST",
  MAP_ID_VIA_API = "MAP_ID_VIA_API",
  TITLE = "TITLE",
  VERSION = "VERSION",
}
export const macroOsuWindowTitle = createMessageParserMacroGenerator<
  MacroOsuWindowTitle,
  MacroOsuWindowTitleData
>(
  {
    id: "OSU_WINDOW_TITLE",
  },
  Object.values(MacroOsuWindowTitle),
  (macroId, data) => {
    switch (macroId) {
      case MacroOsuWindowTitle.ARTIST:
        return data.artist;
      case MacroOsuWindowTitle.MAP_ID_VIA_API:
        return data.mapId;
      case MacroOsuWindowTitle.TITLE:
        return data.title;
      case MacroOsuWindowTitle.VERSION:
        return data.version;
    }
  },
  {
    artist: "RIOT",
    mapId: 2355511,
    title: "Disorder (Rebirth)",
    version: "bryant kumat",
  },
);
