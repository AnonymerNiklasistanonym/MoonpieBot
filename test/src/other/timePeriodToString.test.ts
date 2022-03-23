import { secondsToString } from "../../../src/other/timePeriodToString";
import chai from "chai";
import { describe } from "mocha";

const minuteS = 60;
const hourS = minuteS * 60;
const dayS = hourS * 24;
const yearS = dayS * 365;

export default (): Mocha.Suite => {
  return describe("timePeriodToString", () => {
    it("basics", () => {
      chai.expect(secondsToString(0)).to.be.equal("0 seconds");
      chai.expect(secondsToString(1)).to.be.equal("1 second");
      chai.expect(secondsToString(2)).to.be.equal("2 seconds");
      chai.expect(secondsToString(1 * minuteS)).to.be.equal("1 minute");
      chai
        .expect(secondsToString(1 * minuteS + 1))
        .to.be.equal("1 minute and 1 second");
      chai
        .expect(secondsToString(1 * minuteS + 10))
        .to.be.equal("1 minute and 10 seconds");
      chai
        .expect(secondsToString(10 * minuteS + 15))
        .to.be.equal("10 minutes and 15 seconds");
      chai.expect(secondsToString(60 * minuteS)).to.be.equal("1 hour");
      chai.expect(secondsToString(10 * hourS)).to.be.equal("10 hours");
      chai
        .expect(secondsToString(1 * hourS + 2 * minuteS + 25))
        .to.be.equal("1 hour, 2 minutes and 25 seconds");
      chai.expect(secondsToString(1 * dayS)).to.be.equal("1 day");
      chai.expect(secondsToString(2 * dayS)).to.be.equal("2 days");
      chai.expect(secondsToString(1 * yearS)).to.be.equal("1 year");
      chai.expect(secondsToString(3 * yearS)).to.be.equal("3 years");
      chai
        .expect(secondsToString(5 * yearS + 10 * hourS + 15 * minuteS + 30))
        .to.be.equal("5 years, 10 hours, 15 minutes and 30 seconds");
    });
  });
};
