// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Local imports
import {
  getVersionFromObject,
  isSameVersion,
  isSmallerVersion,
} from "../../src/version";
import { version } from "../../src/info/version";
// Type imports
import type { Version } from "../../src/version";

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
    const sameVersionTest = (a: Version, b: Version, same = true) => {
      expect(isSameVersion(a, b)).to.be.equal(
        same,
        `Expected ${getVersionFromObject(a)} to be ${
          same ? "same as" : "different than"
        } ${getVersionFromObject(b)}`
      );
    };
    const versionA: Version = {
      major: 1,
      minor: 0,
      patch: 1,
    };
    sameVersionTest(versionA, versionA);
    sameVersionTest(versionA, { ...versionA, major: 2 }, false);
    sameVersionTest({ ...versionA, major: 2 }, versionA, false);
    sameVersionTest(versionA, { ...versionA, minor: 1 }, false);
    sameVersionTest({ ...versionA, minor: 1 }, versionA, false);
    sameVersionTest(versionA, { ...versionA, patch: 2 }, false);
    sameVersionTest({ ...versionA, patch: 2 }, versionA, false);
    sameVersionTest(versionA, { ...versionA, beta: true }, false);
    sameVersionTest(versionA, { ...versionA, beta: false });
    sameVersionTest(versionA, { ...versionA, beta: undefined });
    sameVersionTest(
      { ...versionA, beta: undefined },
      { ...versionA, beta: undefined }
    );
    sameVersionTest(
      { ...versionA, beta: false },
      { ...versionA, beta: undefined }
    );
    sameVersionTest({ ...versionA, beta: true }, { ...versionA, beta: true });
  });
  it("isSmallerVersion", () => {
    const smallerVersionTest = (a: Version, b: Version, smaller = true) => {
      expect(isSmallerVersion(a, b)).to.be.equal(
        smaller,
        `Expected ${getVersionFromObject(a)} to be ${
          smaller ? "smaller" : "equal/bigger"
        } than ${getVersionFromObject(b)}`
      );
    };
    const versionA: Version = {
      major: 1,
      minor: 0,
      patch: 1,
    };
    // Should be false
    smallerVersionTest(versionA, versionA, false);
    smallerVersionTest(versionA, { ...versionA, beta: false }, false);
    smallerVersionTest(versionA, { ...versionA, beta: undefined }, false);
    smallerVersionTest(
      { ...versionA, beta: undefined },
      { ...versionA, beta: undefined },
      false
    );
    smallerVersionTest(
      { ...versionA, beta: false },
      { ...versionA, beta: false },
      false
    );
    // Should be true
    smallerVersionTest(versionA, { ...versionA, beta: true });
    smallerVersionTest(versionA, { ...versionA, patch: 2 });
    smallerVersionTest(versionA, { ...versionA, minor: 1 });
    smallerVersionTest(versionA, { ...versionA, major: 2 });
  });
});
