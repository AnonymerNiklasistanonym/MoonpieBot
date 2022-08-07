// Package imports
import chai from "chai";
import { describe } from "mocha";
// Local imports
import { getVersionFromObject } from "../../src/version";
import { version } from "../../src/info/version";

describe("version", () => {
  it("versionString", () => {
    chai.expect(getVersionFromObject(version)).to.be.a("string");
  });
  it("getVersionFromObject", () => {
    chai
      .expect(
        getVersionFromObject({
          major: 1,
          minor: 0,
          patch: 1,
          beta: true,
        })
      )
      .to.be.equal("v1.0.1b");
    chai
      .expect(
        getVersionFromObject({
          major: 1,
          minor: 0,
          patch: 2,
        })
      )
      .to.be.equal("v1.0.2");
  });
});
