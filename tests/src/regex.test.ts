import { expect } from "chai";
import {
  regexMoonpieClaim,
  regexMoonpieGet,
  regexMoonpieLeaderboard,
} from "src/moonpieChatHandler";

describe("regex", () => {
  context("!moonpie commands", () => {
    it("!moonpie $OPTIONAL_TEXT", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieClaim);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieClaim);
      expect(matches1).to.not.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieClaim);
      expect(matches2).to.not.be.null;

      const message3 =
        "Use command !moonpie to participate in the collection leaderboard of the fantastic moonpies ^^ !moonpie commands for rest of the commands!";
      const matches3 = message3.match(regexMoonpieClaim);
      expect(matches3).to.be.null;

      const message4 = "abc !moonpie";
      const matches4 = message4.match(regexMoonpieClaim);
      expect(matches4).to.be.null;
    });

    it("!moonpie leaderboard", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieLeaderboard);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieLeaderboard);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieLeaderboard);
      expect(matches2).to.be.null;

      const message3 = "!moonpie leaderboard";
      const matches3 = message3.match(regexMoonpieLeaderboard);
      expect(matches3).to.not.be.null;

      const message4 = "abc !moonpie leaderboard";
      const matches4 = message4.match(regexMoonpieLeaderboard);
      expect(matches4).to.be.null;
    });

    it("!moonpie get $USER", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieGet);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieGet);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieGet);
      expect(matches2).to.be.null;

      const message3 = "!moonpie get";
      const matches3 = message3.match(regexMoonpieGet);
      expect(matches3).to.be.null;

      const message4 = "!moonpie get username";
      const matches4 = message4.match(regexMoonpieGet);
      expect(matches4).to.not.be.null;
      if (matches4) {
        expect(matches4[1]).to.be.equal("username");
      }

      const message5 = "!moonpie get AbCD";
      const matches5 = message5.match(regexMoonpieGet);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("AbCD");
      }

      const message6 = "abc !moonpie get username";
      const matches6 = message6.match(regexMoonpieGet);
      expect(matches6).to.be.null;
    });
  });
});
