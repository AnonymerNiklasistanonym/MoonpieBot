/* eslint-disable no-magic-numbers */

// Package imports
import { expect } from "chai";
// Local imports
import {
  defaultStringMap,
  updateStringsMapWithCustomEnvStrings,
} from "../../src/strings";
import { getTestLogger } from "./logger";

describe("strings", () => {
  context("general", () => {
    const logger = getTestLogger("strings:general");
    it("defaultStringMap", () => {
      expect(defaultStringMap).to.be.a("Map");
    });
    it("updateStringsMapWithCustomEnvStrings", () => {
      expect(() => {
        updateStringsMapWithCustomEnvStrings(defaultStringMap, logger);
      }).to.not.throw();
      expect(
        updateStringsMapWithCustomEnvStrings(defaultStringMap, logger)
      ).to.deep.equal(defaultStringMap);
    });
  });
});
