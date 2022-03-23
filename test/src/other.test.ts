import timePeriodToStringTestSuit from "./other/timePeriodToString.test";
import asyncReplaceTestSuit from "./other/asyncReplace.test";
import { describe } from "mocha";

describe("other", () => {
  timePeriodToStringTestSuit();
  asyncReplaceTestSuit();
});
