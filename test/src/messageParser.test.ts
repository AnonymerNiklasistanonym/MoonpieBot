/* eslint-disable no-magic-numbers */

// Package imports
import { expect } from "chai";
// Local imports
import {
  pluginIfEmpty,
  pluginIfNotEmpty,
  pluginLowercase,
  pluginRandomNumber,
  pluginTimeInSToHumanReadableString,
  pluginTimeInSToStopwatchString,
  pluginUppercase,
} from "../../src/messageParser/plugins/general";
import { getTestLogger } from "./logger";
import { messageParser } from "../../src/messageParser";
// Type imports
import type { MacroMap, PluginMap } from "../../src/messageParser";
import type { PluginFunc } from "../../src/messageParser";
import type { StringMap } from "../../src/strings";

describe("messageParser", () => {
  const logger = getTestLogger("messageParser");
  context("text", () => {
    it("simple text", async () => {
      const message0 = "Hello";
      const output0 = await messageParser(
        message0,
        undefined,
        undefined,
        undefined,
        logger
      );
      expect(output0).to.be.equal("Hello");
    });
    it("escaped text", async () => {
      const message0 = "Hello \\$(notAPlugin)";
      const output0 = await messageParser(
        message0,
        undefined,
        undefined,
        undefined,
        logger
      );
      expect(output0).to.be.equal("Hello $(notAPlugin)");
      const message1 = "Hello \\$\\(notAPlugin)";
      const output1 = await messageParser(
        message1,
        undefined,
        undefined,
        undefined,
        logger
      );
      expect(output1).to.be.equal("Hello $(notAPlugin)");
      const message2 = "Hello \\$\\\\(notAPlugin)";
      const output2 = await messageParser(
        message2,
        undefined,
        undefined,
        undefined,
        logger
      );
      expect(output2).to.be.equal("Hello $\\(notAPlugin)");
      const message3 = "Hello \\%NotAMacro\\%";
      const output3 = await messageParser(
        message3,
        undefined,
        undefined,
        undefined,
        logger
      );
      expect(output3).to.be.equal("Hello %NotAMacro%");
    });
  });
  context("references", () => {
    it("simple references", async () => {
      const strings: StringMap = new Map([["abc", "def"]]);
      const message0 = "$[abc]";
      const output0 = await messageParser(
        message0,
        strings,
        undefined,
        undefined,
        logger
      );
      expect(output0).to.be.equal("def");

      const message1 = "Hey $[abc]!";
      const output1 = await messageParser(
        message1,
        strings,
        undefined,
        undefined,
        logger
      );
      expect(output1).to.be.equal("Hey def!");
    });
    it("loops", async () => {
      const strings: StringMap = new Map([["loop", "$[loop]"]]);
      const message0 = "$[loop]";
      let errorWasThrown = false;
      try {
        await messageParser(message0, strings, undefined, undefined, logger);
      } catch (err) {
        logger.error(err);
        errorWasThrown = true;
      }
      expect(errorWasThrown).to.be.equal(true);
    });
    it("plugins and macros inside reference", async () => {
      const strings: StringMap = new Map([
        ["reference", "$(plugin_one|Hello $[reference2])"],
        ["reference2", "$(plugin_uppercase=World) UwU!"],
      ]);
      const plugins: PluginMap = new Map<string, PluginFunc>([
        ["plugin_one", () => new Map()],
        [
          "plugin_uppercase",
          (_logger, content?: string) => {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return `${content?.toUpperCase()}`;
          },
        ],
      ]);
      const message0 = "Hello $[reference2]";
      const output0 = await messageParser(
        message0,
        strings,
        plugins,
        undefined,
        logger
      );
      expect(output0).to.be.equal("Hello WORLD UwU!");
      const message1 = ">$[reference]<";
      const output1 = await messageParser(
        message1,
        strings,
        plugins,
        undefined,
        logger
      );
      expect(output1).to.be.equal(">Hello WORLD UwU!<");
    });
  });
  context("macros", () => {
    it("simple maros", async () => {
      const macros: MacroMap = new Map([
        ["TWITCH", new Map([["NAME", "geo"]])],
      ]);
      const message0 = "Hello %TWITCH:NAME%";
      const output0 = await messageParser(
        message0,
        undefined,
        undefined,
        macros,
        logger
      );
      expect(output0).to.be.equal("Hello geo");
    });
  });
  context("plugins", () => {
    it("plugins that return text", async () => {
      const plugins: PluginMap = new Map();
      // eslint-disable-next-line @typescript-eslint/require-await
      plugins.set("TWITCH_GAME", (_logger, value) => {
        if (value === "geo") {
          return "osu!";
        } else {
          throw Error;
        }
      });
      const message0 = "geo played on stream $(TWITCH_GAME=geo)";
      const output0 = await messageParser(
        message0,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output0).to.be.equal("geo played on stream osu!");

      const macros: MacroMap = new Map([["USER", new Map([["NAME", "geo"]])]]);
      const message1 = "geo played on stream $(TWITCH_GAME=%USER:NAME%)";
      const output1 = await messageParser(
        message1,
        undefined,
        plugins,
        macros,
        logger
      );
      expect(output1).to.be.equal("geo played on stream osu!");

      const plugins2: PluginMap = new Map();
      // eslint-disable-next-line @typescript-eslint/require-await,@typescript-eslint/no-unused-vars
      plugins2.set("COUNT", () => "10");
      const message2 = "this command was called $(COUNT) times";
      const output2 = await messageParser(
        message2,
        undefined,
        plugins2,
        new Map(),
        logger
      );
      expect(output2).to.be.equal("this command was called 10 times");
    });
    it("plugins that return macros", async () => {
      const plugins: PluginMap = new Map();
      // eslint-disable-next-line @typescript-eslint/require-await
      plugins.set("TWITCH_GAME", (_logger, value) => {
        if (value === "geo") {
          return new Map([["TWITCH_GAME", new Map([["GEO", "osu!"]])]]);
        } else {
          throw Error;
        }
      });
      const message0 =
        "geo played on stream $(TWITCH_GAME=geo|%TWITCH_GAME:GEO%)";
      const output0 = await messageParser(
        message0,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output0).to.be.equal("geo played on stream osu!");
    });
    it("plugins within plugins", async () => {
      const plugins: PluginMap = new Map();
      // eslint-disable-next-line @typescript-eslint/require-await
      plugins.set("TWITCH_GAME", async (_logger, value?: string) => {
        if (value === "geo") {
          return new Map([["TWITCH_GAME", new Map([["GEO", "osu!"]])]]);
        } else if (value === "lune") {
          return new Map([["TWITCH_GAME", new Map([["LUNE", "osu!"]])]]);
        } else {
          throw Error;
        }
      });
      const message0 =
        "geo played on stream $(TWITCH_GAME=geo|%TWITCH_GAME:GEO% and lune played $(TWITCH_GAME=lune|%TWITCH_GAME:LUNE%))";
      const output0 = await messageParser(
        message0,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output0).to.be.equal(
        "geo played on stream osu! and lune played osu!"
      );
    });
    it("general plugins", async () => {
      const plugins: PluginMap = new Map();
      plugins.set(pluginLowercase.id, pluginLowercase.func);
      plugins.set(pluginUppercase.id, pluginUppercase.func);
      plugins.set(pluginRandomNumber.id, pluginRandomNumber.func);
      plugins.set(
        pluginTimeInSToStopwatchString.id,
        pluginTimeInSToStopwatchString.func
      );
      plugins.set(
        pluginTimeInSToHumanReadableString.id,
        pluginTimeInSToHumanReadableString.func
      );
      plugins.set(pluginIfEmpty.id, pluginIfEmpty.func);
      plugins.set(pluginIfNotEmpty.id, pluginIfNotEmpty.func);

      const message0 = "$(UPPERCASE=hello world)";
      const output0 = await messageParser(
        message0,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output0).to.be.equal("HELLO WORLD");

      const message1 = "$(LOWERCASE=HELLO WORLD)";
      const output1 = await messageParser(
        message1,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output1).to.be.equal("hello world");

      const message2 = "$(RANDOM_NUMBER)";
      const output2 = await messageParser(
        message2,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(parseInt(output2)).to.be.a("number").above(-1).below(101);
      const message3 = "$(RANDOM_NUMBER=10)";
      const output3 = await messageParser(
        message3,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(parseInt(output3)).to.be.a("number").above(-1).below(11);
      const message4 = "$(RANDOM_NUMBER=10<->20)";
      const output4 = await messageParser(
        message4,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(parseInt(output4)).to.be.a("number").above(9).below(21);
      const message5 = "$(RANDOM_NUMBER=-20<->-10)";
      const output5 = await messageParser(
        message5,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(parseInt(output5)).to.be.a("number").above(-21).below(-9);
      const message6 = "$(RANDOM_NUMBER=-20)";
      const output6 = await messageParser(
        message6,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(parseInt(output6)).to.be.a("number").above(-21).below(1);

      const message7 = "$(TIME_IN_S_TO_STOPWATCH_STRING=121)";
      const output7 = await messageParser(
        message7,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output7).to.be.equal("02:01 min");
      const message8 = "$(TIME_IN_S_TO_STOPWATCH_STRING=6211)";
      const output8 = await messageParser(
        message8,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output8).to.be.equal("01:43:31 h");

      const message9 = "$(IF_EMPTY=not empty|hi)";
      const output9 = await messageParser(
        message9,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output9).to.be.equal("");
      const message10 = "$(IF_EMPTY=|hi)";
      const output10 = await messageParser(
        message10,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output10).to.be.equal("hi");
      const message11 = "$(IF_NOT_EMPTY=not empty|hi)";
      const output11 = await messageParser(
        message11,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output11).to.be.equal("hi");
      const message12 = "$(IF_NOT_EMPTY=|hi)";
      const output12 = await messageParser(
        message12,
        undefined,
        plugins,
        undefined,
        logger
      );
      expect(output12).to.be.equal("");
    });
  });
});
