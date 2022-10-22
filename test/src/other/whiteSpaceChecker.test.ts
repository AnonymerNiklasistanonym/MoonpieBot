/* eslint-disable @typescript-eslint/quotes */

// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Local imports
import {
  escapeStringIfWhiteSpace,
  hasWhiteSpace,
} from "../../../src/other/whiteSpaceChecker";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("whiteSpaceChecker", () => {
    it("escapeStringIfWhiteSpace", () => {
      expect(escapeStringIfWhiteSpace("hello")).to.be.equal("hello");
      expect(escapeStringIfWhiteSpace("he lo")).to.be.equal('"he lo"');
      expect(escapeStringIfWhiteSpace(" hello")).to.be.equal('" hello"');
      expect(escapeStringIfWhiteSpace(" hello", "'")).to.be.equal("' hello'");
    });
    it("hasWhiteSpace", () => {
      expect(hasWhiteSpace("hello")).to.be.equal(false);
      expect(hasWhiteSpace(" hello")).to.be.equal(true);
      expect(hasWhiteSpace("hello ")).to.be.equal(true);
      expect(hasWhiteSpace("he lo")).to.be.equal(true);
    });
  });
};
