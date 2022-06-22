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
    it("simple plugins", async () => {
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
    });
  });
});
