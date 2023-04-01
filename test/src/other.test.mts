// Package imports
import { describe } from "mocha";
// Relative imports
import regexToStringTestSuite from "./other/regexToString.test.mjs";
import roundTestSuite from "./other/round.test.mjs";
import splitTextAtLengthTestSuite from "./other/splitTextAtLength.test.mjs";
import typesTestSuite from "./other/types.test.mjs";
import whiteSpaceCheckerTestSuite from "./other/whiteSpaceChecker.test.mjs";

describe("other", () => {
  regexToStringTestSuite();
  roundTestSuite();
  splitTextAtLengthTestSuite();
  typesTestSuite();
  whiteSpaceCheckerTestSuite();
});
