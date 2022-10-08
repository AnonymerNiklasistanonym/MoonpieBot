// Type imports
import type { MessageParserMacroGenerator } from "../../messageParser";

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
export const macroOsuWindowTitle: MessageParserMacroGenerator<
  MacroOsuWindowTitleData,
  MacroOsuWindowTitle
> = {
  exampleData: {
    artist: "RIOT",
    mapId: 2355511,
    title: "Disorder (Rebirth)",
    version: "bryant kumat",
  },
  generate: (data) =>
    Object.values(MacroOsuWindowTitle).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroOsuWindowTitle.ARTIST:
          macroValue = data.artist;
          break;
        case MacroOsuWindowTitle.MAP_ID_VIA_API:
          macroValue = data.mapId;
          break;
        case MacroOsuWindowTitle.TITLE:
          macroValue = data.title;
          break;
        case MacroOsuWindowTitle.VERSION:
          macroValue = data.version;
          break;
      }
      if (typeof macroValue === "undefined") {
        macroValue = "undefined";
      }
      if (typeof macroValue === "number") {
        macroValue = `${macroValue}`;
      }
      return [macroId, macroValue];
    }),
  id: "OSU_WINDOW_TITLE",
  keys: Object.values(MacroOsuWindowTitle),
};
