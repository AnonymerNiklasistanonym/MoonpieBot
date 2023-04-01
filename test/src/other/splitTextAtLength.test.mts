/* eslint-disable no-magic-numbers */

// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Relative imports
import { splitTextAtLength } from "../../../src/other/splitTextAtLength.mjs";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("splitTextAtLength", () => {
    it("empty", () => {
      expect(splitTextAtLength("", 0)).to.be.deep.equal([""]);
    });
    it("not empty", () => {
      expect(splitTextAtLength("hello world", 3)).to.be.deep.equal([
        "hello",
        "world",
      ]);
      expect(splitTextAtLength("hello world", 10)).to.be.deep.equal([
        "hello",
        "world",
      ]);
      expect(splitTextAtLength("hello world", 11)).to.be.deep.equal([
        "hello world",
      ]);
    });
  });
};
