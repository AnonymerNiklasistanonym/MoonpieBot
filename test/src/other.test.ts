// Package imports
import { describe } from "mocha";
// Local imports
import roundTestSuite from "./other/round.test";
import splitTextAtLengthTestSuite from "./other/splitTextAtLength.test";

describe("other", () => {
  roundTestSuite();
  splitTextAtLengthTestSuite();
});
