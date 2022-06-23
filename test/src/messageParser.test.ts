import { expect } from "chai";
import { messageParser } from "../../src/messageParser";
import type { Plugins, Macros } from "../../src/messageParser";
import {
  pluginShowIfEmpty,
  pluginShowIfNotEmpty,
  pluginLowercase,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
} from "../../src/messageParser/plugins/general";

describe("messageParser", () => {
  context("text", () => {
    it("simple text", async () => {
      const message0 = "Hello";
      const output0 = await messageParser(message0, new Map(), new Map());
      expect(output0).to.be.equal("Hello");
    });
    it("escaped text", async () => {
      const message0 = "Hello \\$(notAPlugin)";
      const output0 = await messageParser(message0, new Map(), new Map());
      expect(output0).to.be.equal("Hello $(notAPlugin)");
      const message1 = "Hello \\$\\(notAPlugin)";
      const output1 = await messageParser(message1, new Map(), new Map());
      expect(output1).to.be.equal("Hello $(notAPlugin)");
      const message2 = "Hello \\$\\\\(notAPlugin)";
      const output2 = await messageParser(message2, new Map(), new Map());
      expect(output2).to.be.equal("Hello $\\(notAPlugin)");
      const message3 = "Hello \\%NotAMacro\\%";
      const output3 = await messageParser(message3, new Map(), new Map());
      expect(output3).to.be.equal("Hello %NotAMacro%");
    });
  });
  context("macros", () => {
    it("simple maros", async () => {
      const macros: Macros = new Map([["TWITCH", new Map([["NAME", "geo"]])]]);
      const message0 = "Hello %TWITCH:NAME%";
      const output0 = await messageParser(message0, new Map(), macros);
      expect(output0).to.be.equal("Hello geo");
    });
  });
  context("plugins", () => {
    it("plugins that return text", async () => {
      const plugins: Plugins = new Map();
      // eslint-disable-next-line @typescript-eslint/require-await
      plugins.set("TWITCH_GAME", async (value?: string) => {
        if (value === "geo") {
          return "osu!";
        } else {
          throw Error;
        }
      });
      const message0 = "geo played on stream $(TWITCH_GAME=geo)";
      const output0 = await messageParser(message0, plugins, new Map());
      expect(output0).to.be.equal("geo played on stream osu!");

      const macros: Macros = new Map([["USER", new Map([["NAME", "geo"]])]]);
      const message1 = "geo played on stream $(TWITCH_GAME=%USER:NAME%)";
      const output1 = await messageParser(message1, plugins, macros);
      expect(output1).to.be.equal("geo played on stream osu!");

      const plugins2: Plugins = new Map();
      // eslint-disable-next-line @typescript-eslint/require-await,@typescript-eslint/no-unused-vars
      plugins2.set("COUNT", async (_value?: string) => {
        return "10";
      });
      const message2 = "this command was called $(COUNT) times";
      const output2 = await messageParser(message2, plugins2, new Map());
      expect(output2).to.be.equal("this command was called 10 times");
    });
    it("plugins that return macros", async () => {
      const plugins: Plugins = new Map();
      // eslint-disable-next-line @typescript-eslint/require-await
      plugins.set("TWITCH_GAME", async (value?: string) => {
        if (value === "geo") {
          return [["GEO", "osu!"]];
        } else {
          throw Error;
        }
      });
      const message0 =
        "geo played on stream $(TWITCH_GAME=geo|%TWITCH_GAME:GEO%)";
      const output0 = await messageParser(message0, plugins, new Map());
      expect(output0).to.be.equal("geo played on stream osu!");
    });
    it("plugins within plugins", async () => {
      const plugins: Plugins = new Map();
      // eslint-disable-next-line @typescript-eslint/require-await
      plugins.set("TWITCH_GAME", async (value?: string) => {
        if (value === "geo") {
          return [["GEO", "osu!"]];
        } else if (value === "lune") {
          return [["LUNE", "osu!"]];
        } else {
          throw Error;
        }
      });
      const message0 =
        "geo played on stream $(TWITCH_GAME=geo|%TWITCH_GAME:GEO% and lune played $(TWITCH_GAME=lune|%TWITCH_GAME:LUNE%))";
      const output0 = await messageParser(message0, plugins, new Map());
      expect(output0).to.be.equal(
        "geo played on stream osu! and lune played osu!"
      );
    });
    it("general plugins", async () => {
      const plugins: Plugins = new Map();
      plugins.set(pluginLowercase.name, pluginLowercase.func);
      plugins.set(pluginUppercase.name, pluginUppercase.func);
      plugins.set(pluginRandomNumber.name, pluginRandomNumber.func);
      plugins.set(
        pluginTimeInSToStopwatchString.name,
        pluginTimeInSToStopwatchString.func
      );
      plugins.set(
        pluginTimeInSToHumanReadableString.name,
        pluginTimeInSToHumanReadableString.func
      );
      plugins.set(pluginShowIfEmpty.name, pluginShowIfEmpty.func);
      plugins.set(pluginShowIfNotEmpty.name, pluginShowIfNotEmpty.func);

      const message0 = "$(UPPERCASE=hello world)";
      const output0 = await messageParser(message0, plugins);
      expect(output0).to.be.equal("HELLO WORLD");

      const message1 = "$(LOWERCASE=HELLO WORLD)";
      const output1 = await messageParser(message1, plugins);
      expect(output1).to.be.equal("hello world");

      const message2 = "$(RANDOM_NUMBER)";
      const output2 = await messageParser(message2, plugins);
      expect(parseInt(output2)).to.be.a("number").above(-1).below(101);
      const message3 = "$(RANDOM_NUMBER=10)";
      const output3 = await messageParser(message3, plugins);
      expect(parseInt(output3)).to.be.a("number").above(-1).below(11);
      const message4 = "$(RANDOM_NUMBER=10<->20)";
      const output4 = await messageParser(message4, plugins);
      expect(parseInt(output4)).to.be.a("number").above(9).below(21);
      const message5 = "$(RANDOM_NUMBER=-20<->-10)";
      const output5 = await messageParser(message5, plugins);
      expect(parseInt(output5)).to.be.a("number").above(-21).below(-9);
      const message6 = "$(RANDOM_NUMBER=-20)";
      const output6 = await messageParser(message6, plugins);
      expect(parseInt(output6)).to.be.a("number").above(-21).below(1);

      const message7 = "$(TIME_IN_S_TO_STOPWATCH_STRING=121)";
      const output7 = await messageParser(message7, plugins);
      expect(output7).to.be.equal("02:01 min");
      const message8 = "$(TIME_IN_S_TO_STOPWATCH_STRING=6211)";
      const output8 = await messageParser(message8, plugins);
      expect(output8).to.be.equal("01:43:31 h");

      const message9 = "$(SHOW_IF_EMPTY=not empty|hi)";
      const output9 = await messageParser(message9, plugins);
      expect(output9).to.be.equal("");
      const message10 = "$(SHOW_IF_EMPTY=|hi)";
      const output10 = await messageParser(message10, plugins);
      expect(output10).to.be.equal("hi");
      const message11 = "$(SHOW_IF_NOT_EMPTY=not empty|hi)";
      const output11 = await messageParser(message11, plugins);
      expect(output11).to.be.equal("hi");
      const message12 = "$(SHOW_IF_NOT_EMPTY=|hi)";
      const output12 = await messageParser(message12, plugins);
      expect(output12).to.be.equal("");
    });
  });
});
