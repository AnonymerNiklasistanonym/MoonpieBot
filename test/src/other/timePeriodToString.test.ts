import { secondsToString } from "../../../src/other/timePeriodToString";
import chai from "chai";
import { describe } from "mocha";

export default (): Mocha.Suite => {
  return describe("timePeriodToString", () => {
    it("secondsToString", () => {
      chai.expect(secondsToString(0)).to.be.equal("0 seconds");
      chai.expect(secondsToString(1)).to.be.equal("1 second");
      chai.expect(secondsToString(2)).to.be.equal("2 seconds");
      chai.expect(secondsToString(1 * 60)).to.be.equal("1 minute");
      chai
        .expect(secondsToString(1 * 60 + 1))
        .to.be.equal("1 minute and 1 second");
      chai
        .expect(secondsToString(1 * 60 + 10))
        .to.be.equal("1 minute and 10 seconds");
      chai
        .expect(secondsToString(10 * 60 + 15))
        .to.be.equal("10 minutes and 15 seconds");
      chai.expect(secondsToString(60 * 60)).to.be.equal("1 hour");
      chai.expect(secondsToString(10 * 60 * 60)).to.be.equal("10 hours");
      chai
        .expect(secondsToString(60 * 60 + 2 * 60 + 25))
        .to.be.equal("1 hour and 2 minutes and 25 seconds");
    });
  });
};
