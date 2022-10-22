// Package imports
import { describe } from "mocha";
// Local imports
import regexToStringTestSuite from "./other/regexToString.test";
import roundTestSuite from "./other/round.test";
import splitTextAtLengthTestSuite from "./other/splitTextAtLength.test";
import typesTestSuite from "./other/types.test";
import whiteSpaceCheckerTestSuite from "./other/whiteSpaceChecker.test";

describe("other", () => {
  regexToStringTestSuite();
  roundTestSuite();
  splitTextAtLengthTestSuite();
  typesTestSuite();
  whiteSpaceCheckerTestSuite();
});
