// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Relative imports
import { compareVersions, getVersionInfo } from "../../src/version.mjs";
import { version } from "../../src/info/general.mjs";
// Type imports
import type { SemVer } from "semver";

describe("version", () => {
  it("info", () => {
    expect(version).to.be.a("string");
  });
  it("getVersionInfo", () => {
    expect(getVersionInfo("v1.0.1-beta.0")).to.not.throw;
  });
  it("compareVersions", () => {
    const sameVersionTest = (a: SemVer, b: SemVer, same = true) => {
      expect(compareVersions(a, b) === 0).to.be.equal(
        same,
        `Expected ${a.version} to be ${
          same ? "the same as" : "different than"
        } ${b.version}`,
      );
    };
    const olderVersionTest = (a: SemVer, b: SemVer, older = true) => {
      expect(compareVersions(a, b) === -1).to.be.equal(
        older,
        `Expected ${a.version} to be ${
          older ? "older" : "the same/newer"
        } than ${b.version}`,
      );
    };
    const newerVersionTest = (a: SemVer, b: SemVer, newer = true) => {
      expect(compareVersions(a, b) === 1).to.be.equal(
        newer,
        `Expected ${a.version} to be ${
          newer ? "newer" : "the same/older"
        } than ${b.version}`,
      );
    };

    const versionA = getVersionInfo("1.0.1");
    const versionABeta = getVersionInfo("1.0.1-beta.0");
    const versionANewer = getVersionInfo("2.0.1");

    // Same version
    sameVersionTest(versionA, versionA, true);
    sameVersionTest(versionANewer, versionANewer, true);
    sameVersionTest(versionABeta, versionABeta, true);

    sameVersionTest(versionA, versionABeta, false);
    sameVersionTest(versionANewer, versionABeta, false);
    sameVersionTest(versionA, versionANewer, false);

    // Older version
    olderVersionTest(versionA, versionA, false);
    olderVersionTest(versionANewer, versionANewer, false);

    olderVersionTest(versionA, versionANewer, true);
    olderVersionTest(versionANewer, versionA, false);

    // Newer version
    newerVersionTest(versionA, versionA, false);
    newerVersionTest(versionANewer, versionANewer, false);

    newerVersionTest(versionANewer, versionA, true);
    newerVersionTest(versionA, versionANewer, false);
  });
});
