// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Local imports
import { getVersionFromObject, isSameVersion } from "../../src/version";
import { version } from "../../src/info/version";

describe("version", () => {
  it("info", () => {
    expect(version).to.not.be.undefined;
    expect(getVersionFromObject(version)).to.be.a("string");
  });
  it("getVersionFromObject", () => {
    expect(
      getVersionFromObject({
        beta: true,
        major: 1,
        minor: 0,
        patch: 1,
      })
    ).to.be.equal("v1.0.1b");
    expect(
      getVersionFromObject({
        major: 1,
        minor: 0,
        patch: 2,
      })
    ).to.be.equal("v1.0.2");
    expect(
      getVersionFromObject(
        {
          major: 1,
          minor: 0,
          patch: 2,
        },
        ""
      )
    ).to.be.equal("1.0.2");
  });
  it("isSameVersion", () => {
    const versionA = {
      major: 1,
      minor: 0,
      patch: 1,
    };
    const versionB = {
      major: 2,
      minor: 0,
      patch: 1,
    };
    expect(isSameVersion(versionA, versionA)).to.be.equal(true);
    expect(isSameVersion(versionB, versionB)).to.be.equal(true);
    expect(isSameVersion(versionA, versionB)).to.be.equal(false);
    expect(isSameVersion(versionB, versionA)).to.be.equal(false);
    expect(isSameVersion(versionA, { ...versionA, beta: false })).to.be.equal(
      true
    );
    expect(
      isSameVersion(versionA, { ...versionA, beta: undefined })
    ).to.be.equal(true);
    expect(
      isSameVersion(
        { ...versionA, beta: undefined },
        { ...versionA, beta: undefined }
      )
    ).to.be.equal(true);
    expect(
      isSameVersion(
        { ...versionA, beta: false },
        { ...versionA, beta: undefined }
      )
    ).to.be.equal(true);
    expect(
      isSameVersion({ ...versionA, beta: true }, { ...versionA, beta: true })
    ).to.be.equal(true);
    expect(isSameVersion(versionA, { ...versionA, beta: true })).to.be.equal(
      false
    );
  });
});
