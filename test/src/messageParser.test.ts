import { expect } from "chai";
import { messageParser } from "../../src/messageParser";
import type { Plugins, Macros } from "../../src/messageParser";

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
  });
});
