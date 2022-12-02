/* eslint-disable @typescript-eslint/quotes */

// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Local imports
import { escapeStringIfWhiteSpace } from "../../../src/other/whiteSpaceChecker";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("whiteSpaceChecker", () => {
    it("escapeStringIfWhiteSpace", () => {
      expect(escapeStringIfWhiteSpace("hello")).to.be.equal("hello");
      expect(escapeStringIfWhiteSpace("he lo")).to.be.equal('"he lo"');
      expect(escapeStringIfWhiteSpace(" hello")).to.be.equal('" hello"');
      expect(
        escapeStringIfWhiteSpace(" hello", { surroundCharacter: "'" })
      ).to.be.equal("' hello'");
    });
  });
};
