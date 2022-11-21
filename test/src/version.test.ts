// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Local imports
import { compareVersions, getVersionString } from "../../src/version";
import { version } from "../../src/info/version";
// Type imports
import type { Version } from "../../src/version";

describe("version", () => {
  it("info", () => {
    expect(version).to.not.be.undefined;
    expect(getVersionString(version)).to.be.a("string");
  });
  it("getVersionString", () => {
    expect(
      getVersionString({
        beta: true,
        major: 1,
        minor: 0,
        patch: 1,
      })
    ).to.be.equal("v1.0.1b");
    expect(
      getVersionString({
        major: 1,
        minor: 0,
        patch: 2,
      })
    ).to.be.equal("v1.0.2");
    expect(
      getVersionString(
        {
          major: 1,
          minor: 0,
          patch: 2,
        },
        ""
      )
    ).to.be.equal("1.0.2");
  });
  it("compareVersions", () => {
    const sameVersionTest = (a: Version, b: Version, same = true) => {
      expect(compareVersions(a, b) === 0).to.be.equal(
        same,
        `Expected ${getVersionString(a)} to be ${
          same ? "the same as" : "different than"
        } ${getVersionString(b)}`
      );
    };
    const olderVersionTest = (a: Version, b: Version, older = true) => {
      expect(compareVersions(a, b) === -1).to.be.equal(
        older,
        `Expected ${getVersionString(a)} to be ${
          older ? "older" : "the same/newer"
        } than ${getVersionString(b)}`
      );
    };
    const newerVersionTest = (a: Version, b: Version, newer = true) => {
      expect(compareVersions(a, b) === 1).to.be.equal(
        newer,
        `Expected ${getVersionString(a)} to be ${
          newer ? "newer" : "the same/older"
        } than ${getVersionString(b)}`
      );
    };

    const versionA: Version = {
      major: 1,
      minor: 0,
      patch: 1,
    };

    // Same version
    sameVersionTest(versionA, versionA, true);
    olderVersionTest(versionA, versionA, false);
    newerVersionTest(versionA, versionA, false);

    sameVersionTest(versionA, { ...versionA, beta: false }, true);
    olderVersionTest(versionA, { ...versionA, beta: false }, false);
    newerVersionTest(versionA, { ...versionA, beta: false }, false);

    sameVersionTest(versionA, { ...versionA, beta: undefined }, true);
    olderVersionTest(versionA, { ...versionA, beta: undefined }, false);
    newerVersionTest(versionA, { ...versionA, beta: undefined }, false);

    sameVersionTest({ ...versionA, beta: false }, versionA, true);
    olderVersionTest({ ...versionA, beta: false }, versionA, false);
    newerVersionTest({ ...versionA, beta: false }, versionA, false);

    sameVersionTest({ ...versionA, beta: undefined }, versionA, true);
    olderVersionTest({ ...versionA, beta: undefined }, versionA, false);
    newerVersionTest({ ...versionA, beta: undefined }, versionA, false);

    sameVersionTest(
      { ...versionA, beta: undefined },
      { ...versionA, beta: undefined },
      true
    );
    olderVersionTest(
      { ...versionA, beta: undefined },
      { ...versionA, beta: undefined },
      false
    );
    newerVersionTest(
      { ...versionA, beta: undefined },
      { ...versionA, beta: undefined },
      false
    );

    sameVersionTest(
      { ...versionA, beta: false },
      { ...versionA, beta: false },
      true
    );
    olderVersionTest(
      { ...versionA, beta: false },
      { ...versionA, beta: false },
      false
    );
    newerVersionTest(
      { ...versionA, beta: false },
      { ...versionA, beta: false },
      false
    );

    sameVersionTest(
      { ...versionA, beta: true },
      { ...versionA, beta: true },
      true
    );
    olderVersionTest(
      { ...versionA, beta: true },
      { ...versionA, beta: true },
      false
    );
    newerVersionTest(
      { ...versionA, beta: true },
      { ...versionA, beta: true },
      false
    );

    // Older version
    sameVersionTest(versionA, { ...versionA, major: 2 }, false);
    olderVersionTest(versionA, { ...versionA, major: 2 }, true);
    newerVersionTest(versionA, { ...versionA, major: 2 }, false);

    sameVersionTest(versionA, { ...versionA, minor: 1 }, false);
    olderVersionTest(versionA, { ...versionA, minor: 1 }, true);
    newerVersionTest(versionA, { ...versionA, minor: 1 }, false);

    sameVersionTest(versionA, { ...versionA, patch: 2 }, false);
    olderVersionTest(versionA, { ...versionA, patch: 2 }, true);
    newerVersionTest(versionA, { ...versionA, patch: 2 }, false);

    // Newer version
    sameVersionTest({ ...versionA, major: 2 }, versionA, false);
    olderVersionTest({ ...versionA, major: 2 }, versionA, false);
    newerVersionTest({ ...versionA, major: 2 }, versionA, true);

    sameVersionTest(versionA, { ...versionA, beta: true }, false);
    olderVersionTest(versionA, { ...versionA, beta: true }, false);
    newerVersionTest(versionA, { ...versionA, beta: true }, true);
  });
});
