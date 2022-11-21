// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Local imports
import {
  convertRegexToHumanString,
  convertRegexToString,
} from "../../../src/other/regexToString";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("regexToString", () => {
    it("convertRegexToString", () => {
      expect(convertRegexToString(/abc/i)).to.be.equal("abc");
      expect(convertRegexToHumanString(/^\s*!moonpie(?:\s|$)/i)).to.be.equal(
        "!moonpie"
      );
      expect(
        convertRegexToHumanString(
          /^\s*!score\s+(?<osuUserName>(?:'[^'"]+'|\S+))(?:\s|$)/i
        )
      ).to.be.equal("!score osuUserName");
      expect(
        convertRegexToHumanString(
          /^\s*!rp(?:\s+(?:(?<osuUserId>[0-9]+)|(?<osuUserName>\S+))(?:\s|$)|\s|$)/i
        )
      ).to.be.equal("!rp[ (osuUserId|osuUserName)]");
    });
  });
};
