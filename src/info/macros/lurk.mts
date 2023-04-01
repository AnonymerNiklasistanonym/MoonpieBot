// Type imports
import type { MessageParserMacroGenerator } from "../../messageParser.mjs";

export interface MacroWelcomeBackData {
  dateLurkStart: Date;
}
export enum MacroWelcomeBack {
  LURK_TIME_IN_S = "LURK_TIME_IN_S",
}

export const macroWelcomeBack: MessageParserMacroGenerator<
  MacroWelcomeBackData,
  MacroWelcomeBack
> = {
  generate: (data) =>
    Object.values(MacroWelcomeBack).map((macroId) => {
      let macroValue;
      switch (macroId) {
        case MacroWelcomeBack.LURK_TIME_IN_S:
          macroValue = `${
            (new Date().getTime() - data.dateLurkStart.getTime()) / 1000
          }`;
          break;
      }
      return [macroId, macroValue];
    }),
  id: "WELCOME_BACK",
  keys: Object.values(MacroWelcomeBack),
};
