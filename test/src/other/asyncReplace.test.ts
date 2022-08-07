import { asyncReplace } from "../../../src/other/asyncReplace";
import chai from "chai";
import { describe } from "mocha";

const asyncTimeout = <T>(time: number, valueToReturn: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(valueToReturn);
    }, time);
  });
};

const maxTimeout = 400;

export default (): Mocha.Suite => {
  return describe("asyncReplace", () => {
    it("basics", async () => {
      const testString1 = "Test 1234";
      const testRegex1 = /a/g;
      const testRegex2 = /e/g;

      const testResult1 = await asyncReplace(testString1, testRegex1, () =>
        Promise.resolve("")
      );
      chai.expect(testResult1).to.be.equal("Test 1234");

      const testResult2 = await asyncReplace(testString1, testRegex2, () =>
        Promise.resolve("[abc]")
      );
      chai.expect(testResult2).to.be.equal("T[abc]st 1234");

      const timeoutIn10ms = 10;
      const testResult3 = await asyncReplace(testString1, testRegex2, () =>
        asyncTimeout(timeoutIn10ms, "10")
      );
      chai.expect(testResult3).to.be.equal("T10st 1234");

      const timeoutIn100ms = 100;
      const testResult4 = await asyncReplace(testString1, testRegex2, () =>
        asyncTimeout(timeoutIn100ms, "100")
      );
      chai.expect(testResult4).to.be.equal("T100st 1234");
    }).timeout(maxTimeout);
  });
};
