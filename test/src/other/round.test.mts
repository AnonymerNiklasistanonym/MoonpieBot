/* eslint-disable no-magic-numbers */

// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Relative imports
import { roundNumber } from "../../../src/other/round.mjs";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("round", () => {
    it("roundNumber", () => {
      expect(roundNumber(100)).to.be.equal(100);
      expect(roundNumber(100.123)).to.be.equal(100.12);
      expect(roundNumber(100.405)).to.be.equal(100.41);
      expect(roundNumber(100.5, 0)).to.be.equal(101);
    });
  });
};
