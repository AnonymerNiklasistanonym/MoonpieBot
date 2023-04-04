// Relative imports
import { createMessageParserMacroGenerator } from "../../messageParser/macros.mjs";

export interface MacroWelcomeBackData {
  dateLurkStart: Date;
}
export enum MacroWelcomeBack {
  LURK_TIME_IN_S = "LURK_TIME_IN_S",
}

export const macroWelcomeBack = createMessageParserMacroGenerator<
  MacroWelcomeBack,
  MacroWelcomeBackData
>(
  {
    description: "Variables for when a user comes back from lurking",
    id: "WELCOME_BACK",
  },
  Object.values(MacroWelcomeBack),
  (macroId, data) => {
    switch (macroId) {
      case MacroWelcomeBack.LURK_TIME_IN_S:
        return (new Date().getTime() - data.dateLurkStart.getTime()) / 1000;
    }
  },
);
