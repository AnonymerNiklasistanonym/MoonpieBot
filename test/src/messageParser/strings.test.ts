/* eslint-disable no-magic-numbers */

// Package imports
import { expect, use } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import sinonChai from "sinon-chai";
// Local imports
import {
  generateStringMap,
  updateStringsMapWithCustomEnvStrings,
} from "../../../src/messageParser";
import { defaultStringMap } from "../../../src/info/strings";
import { getTestLogger } from "../logger";
// Type imports
import type { StringMap } from "../../../src/messageParser";
import type { Suite } from "mocha";

use(sinonChai);

const compareStringMaps = (
  baseStringMap: StringMap,
  updatedStringMap: StringMap,
  changedKeys: string[],
  newKeys: string[]
) => {
  for (const [key, value] of updatedStringMap) {
    if (changedKeys.includes(key)) {
      // eslint-disable-next-line no-console
      console.log({ default: baseStringMap.get(key), updated: value });
      expect(baseStringMap.get(key)).to.not.be.equal(value);
      continue;
    }
    if (newKeys.includes(key)) {
      expect(baseStringMap.get(key)).to.be.undefined;
      continue;
    }
    expect(baseStringMap.get(key)).to.be.equal(value);
  }
  for (const [key, value] of baseStringMap) {
    if (changedKeys.includes(key)) {
      expect(updatedStringMap.get(key)).to.not.be.equal(value);
      continue;
    }
    expect(updatedStringMap.get(key)).to.be.equal(value);
  }
};

export default (): Suite => {
  return describe("strings", () => {
    const logger = getTestLogger("messageParser_strings");

    it("info", () => {
      expect(defaultStringMap).to.not.be.undefined;
      expect(defaultStringMap).to.be.a("Map");
    });
    it("generateStringMap", () => {
      expect(generateStringMap()).to.be.a("Map");
      expect(generateStringMap({ default: "b", id: "a" })).to.be.a("Map");
      expect(() => {
        generateStringMap({ default: "a", id: "a" }, { default: "b", id: "a" });
      }).to.throw();
      expect(() => {
        generateStringMap({ default: "a", id: "a" }, { default: "a", id: "b" });
      }).to.not.throw();
    });
    it("updateStringsMapWithCustomEnvStrings", () => {
      const sandbox = sinon.createSandbox();

      // Default strings map is the same when no environment variables can be
      // found
      sandbox.stub(process, "env").value({});
      expect(() => {
        updateStringsMapWithCustomEnvStrings(defaultStringMap, logger);
      }).to.not.throw();
      expect(
        updateStringsMapWithCustomEnvStrings(defaultStringMap, logger)
      ).to.deep.equal(defaultStringMap);
      sandbox.restore();

      // Default strings are actually overridden when provided
      sandbox.stub(process, "env").value({
        MOONPIE_CUSTOM_STRING_MOONPIE_COMMAND_REPLY_ABOUT:
          "@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% Custom",
      });
      const updateDefaultStringInMap = updateStringsMapWithCustomEnvStrings(
        defaultStringMap,
        logger
      );
      compareStringMaps(
        defaultStringMap,
        updateDefaultStringInMap,
        ["MOONPIE_COMMAND_REPLY_ABOUT"],
        []
      );
      expect(
        updateDefaultStringInMap.get("MOONPIE_COMMAND_REPLY_ABOUT")
      ).to.be.equal("@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% Custom");
      sandbox.restore();

      sandbox.stub(process, "env").value({
        MOONPIE_CUSTOM_STRING_MOONPIE_COMMANDS_ABOUT: "!moonpie about Custom",
        MOONPIE_CUSTOM_STRING_MOONPIE_COMMAND_REPLY_ABOUT:
          "@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% Custom",
      });
      const updateDefaultStringsInMap = updateStringsMapWithCustomEnvStrings(
        defaultStringMap,
        logger
      );
      compareStringMaps(
        defaultStringMap,
        updateDefaultStringsInMap,
        ["MOONPIE_COMMANDS_ABOUT", "MOONPIE_COMMAND_REPLY_ABOUT"],
        []
      );
      expect(
        updateDefaultStringsInMap.get("MOONPIE_COMMANDS_ABOUT")
      ).to.be.equal("!moonpie about Custom");
      expect(
        updateDefaultStringsInMap.get("MOONPIE_COMMAND_REPLY_ABOUT")
      ).to.be.equal("@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% Custom");
      sandbox.restore();

      sandbox.stub(process, "env").value({
        MOONPIE_CUSTOM_STRING_ABC: "test",
      });
      const customStringInMap = updateStringsMapWithCustomEnvStrings(
        defaultStringMap,
        logger
      );
      compareStringMaps(defaultStringMap, customStringInMap, [], ["ABC"]);
      expect(customStringInMap.get("ABC")).to.be.equal("test");
      sandbox.restore();

      sandbox.stub(process, "env").value({
        MOONPIE_CUSTOM_STRING_ABC: "test_abc",
        MOONPIE_CUSTOM_STRING_DEF: "test_def",
      });
      const customStringsInMap = updateStringsMapWithCustomEnvStrings(
        defaultStringMap,
        logger
      );
      compareStringMaps(
        defaultStringMap,
        customStringInMap,
        [],
        ["ABC", "DEF"]
      );
      expect(customStringsInMap.get("ABC")).to.be.equal("test_abc");
      expect(customStringsInMap.get("DEF")).to.be.equal("test_def");
      sandbox.restore();
    });
  });
};
