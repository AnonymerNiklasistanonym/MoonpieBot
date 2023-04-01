// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Relative imports
import {
  convertRegexToHumanString,
  convertRegexToHumanStringDetailed,
  convertRegexToString,
} from "../../../src/other/regexToString.mjs";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("regexToString", () => {
    it("convertRegexToString", () => {
      expect(convertRegexToString(/abc/i)).to.be.equal("abc");
      const moonpieRegex = /^\s*!moonpie(?:\s|$)/i;
      expect(convertRegexToString(moonpieRegex)).to.be.equal(
        moonpieRegex.source
      );
      expect(convertRegexToHumanString(moonpieRegex)).to.be.equal("!moonpie");
      expect(convertRegexToHumanStringDetailed(moonpieRegex)).to.be.equal(
        "!moonpie"
      );
      const osuUserNameRegex =
        /^\s*!score\s+(?<osuUserName>(?:'[^']+'|\S+))(?:\s|$)/i;
      expect(convertRegexToString(osuUserNameRegex)).to.be.equal(
        osuUserNameRegex.source
      );
      expect(convertRegexToHumanString(osuUserNameRegex)).to.be.equal(
        "!score osuUserName"
      );
      expect(convertRegexToHumanStringDetailed(osuUserNameRegex)).to.be.equal(
        "!score osuUserName:=('TEXT'/TEXT)"
      );
      const osuRpRegex =
        /^\s*!rp(?:\s+(?:(?<osuUserId>[0-9]+)|(?<osuUserName>(?:'[^']+'|\S+)))(?:\s|$)|\s|$)/i;
      expect(convertRegexToHumanString(osuRpRegex)).to.be.equal(
        "!rp[ (osuUserId/osuUserName)]"
      );
      expect(convertRegexToHumanStringDetailed(osuRpRegex)).to.be.equal(
        "!rp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]"
      );
    });
  });
};
