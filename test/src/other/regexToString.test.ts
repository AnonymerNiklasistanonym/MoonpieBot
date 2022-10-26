// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Local imports
import { convertRegexToString } from "../../../src/other/regexToString";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("regexToString", () => {
    it("convertRegexToString", () => {
      expect(convertRegexToString(/abc/i)).to.be.equal("abc");
    });
  });
};
