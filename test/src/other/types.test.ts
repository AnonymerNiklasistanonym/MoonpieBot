/* eslint-disable no-magic-numbers */

// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Local imports
import {
  convertUndefinedToCustomValue,
  notUndefined,
} from "../../../src/other/types";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("types", () => {
    it("convertUndefinedToCustomValue", () => {
      expect(convertUndefinedToCustomValue(100, true)).to.be.equal(100);
      expect(convertUndefinedToCustomValue(undefined, true)).to.be.equal(true);
    });
    it("notUndefined", () => {
      expect(notUndefined(100)).to.be.equal(true);
      expect(notUndefined(undefined)).to.be.equal(false);
    });
  });
};
