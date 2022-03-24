import { expect } from "chai";
import {
  regexMoonpieAdd,
  regexMoonpieClaim,
  regexMoonpieDelete,
  regexMoonpieGet,
  regexMoonpieLeaderboard,
  regexMoonpieRemove,
  regexMoonpieSet,
} from "../../src/commands/moonpie";
import { regexNowPlaying } from "../../src/commands/osu/np";
import {
  getMacroArgs,
  regexMacro,
  regexMacroArg,
  regexMacroSingle,
} from "../../src/other/parseMessage";

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

      const message7 = "!moonpie get username text after that";
      const matches7 = message7.match(regexMoonpieGet);
      expect(matches7).to.be.null;
    });

    it("!moonpie delete $USER", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieDelete);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieDelete);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieDelete);
      expect(matches2).to.be.null;

      const message3 = "!moonpie delete";
      const matches3 = message3.match(regexMoonpieDelete);
      expect(matches3).to.be.null;

      const message4 = "!moonpie delete username";
      const matches4 = message4.match(regexMoonpieDelete);
      expect(matches4).to.not.be.null;
      if (matches4) {
        expect(matches4[1]).to.be.equal("username");
      }

      const message5 = "!moonpie delete AbCD";
      const matches5 = message5.match(regexMoonpieDelete);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("AbCD");
      }

      const message6 = "abc !moonpie delete username";
      const matches6 = message6.match(regexMoonpieDelete);
      expect(matches6).to.be.null;

      const message7 = "!moonpie delete username text after that";
      const matches7 = message7.match(regexMoonpieDelete);
      expect(matches7).to.be.null;
    });

    it("!moonpie add $USER $COUNT", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieAdd);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieAdd);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieAdd);
      expect(matches2).to.be.null;

      const message3 = "!moonpie add";
      const matches3 = message3.match(regexMoonpieAdd);
      expect(matches3).to.be.null;

      const message4 = "!moonpie add username";
      const matches4 = message4.match(regexMoonpieAdd);
      expect(matches4).to.be.null;

      const message5 = "!moonpie add username 100";
      const matches5 = message5.match(regexMoonpieAdd);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("username");
        expect(parseInt(matches5[2])).to.be.equal(100);
      }

      const message6 = "!moonpie add username 100a";
      const matches6 = message6.match(regexMoonpieAdd);
      expect(matches6).to.be.null;

      const message7 = "abc !moonpie add username 100";
      const matches7 = message7.match(regexMoonpieAdd);
      expect(matches7).to.be.null;

      const message8 = "!moonpie add username 100 text after that";
      const matches8 = message8.match(regexMoonpieAdd);
      expect(matches8).to.be.null;

      const message9 = "!moonpie get username 100";
      const matches9 = message9.match(regexMoonpieAdd);
      expect(matches9).to.be.null;
    });

    it("!moonpie remove $USER $COUNT", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieRemove);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieRemove);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieRemove);
      expect(matches2).to.be.null;

      const message3 = "!moonpie remove";
      const matches3 = message3.match(regexMoonpieRemove);
      expect(matches3).to.be.null;

      const message4 = "!moonpie remove username";
      const matches4 = message4.match(regexMoonpieRemove);
      expect(matches4).to.be.null;

      const message5 = "!moonpie remove username 100";
      const matches5 = message5.match(regexMoonpieRemove);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("username");
        expect(parseInt(matches5[2])).to.be.equal(100);
      }

      const message6 = "!moonpie remove username 100a";
      const matches6 = message6.match(regexMoonpieRemove);
      expect(matches6).to.be.null;

      const message7 = "abc !moonpie remove username 100";
      const matches7 = message7.match(regexMoonpieRemove);
      expect(matches7).to.be.null;

      const message8 = "!moonpie remove username 100 text after that";
      const matches8 = message8.match(regexMoonpieRemove);
      expect(matches8).to.be.null;

      const message9 = "!moonpie set username 100";
      const matches9 = message9.match(regexMoonpieRemove);
      expect(matches9).to.be.null;
    });

    it("!moonpie set $USER $COUNT", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieSet);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieSet);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieSet);
      expect(matches2).to.be.null;

      const message3 = "!moonpie set";
      const matches3 = message3.match(regexMoonpieSet);
      expect(matches3).to.be.null;

      const message4 = "!moonpie set username";
      const matches4 = message4.match(regexMoonpieSet);
      expect(matches4).to.be.null;

      const message5 = "!moonpie set username 100";
      const matches5 = message5.match(regexMoonpieSet);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("username");
        expect(parseInt(matches5[2])).to.be.equal(100);
      }

      const message6 = "!moonpie set username 100a";
      const matches6 = message6.match(regexMoonpieSet);
      expect(matches6).to.be.null;

      const message7 = "abc !moonpie set username 100";
      const matches7 = message7.match(regexMoonpieSet);
      expect(matches7).to.be.null;

      const message8 = "!moonpie set username 100 text after that";
      const matches8 = message8.match(regexMoonpieSet);
      expect(matches8).to.be.null;

      const message9 = "!moonpie add username 100";
      const matches9 = message9.match(regexMoonpieSet);
      expect(matches9).to.be.null;
    });
  });

  context("osu commands", () => {
    it("now playing window", () => {
      const message0 = "osu! - Artist Title [Difficulty]";
      const matches0 = message0.match(regexNowPlaying);
      expect(matches0).to.be.null;

      const message1 = "osu! - Artist - Title";
      const matches1 = message1.match(regexNowPlaying);
      expect(matches1).to.be.null;

      const message2 = "Title - Artist [Difficulty]";
      const matches2 = message2.match(regexNowPlaying);
      expect(matches2).to.be.null;

      const message3 = "osu! - Artist - Title [Difficulty]";
      const matches3 = message3.match(regexNowPlaying);
      expect(matches3).to.be.not.null;
      if (matches3 != null) {
        expect(matches3[1]).to.be.equal("Artist");
        expect(matches3[2]).to.be.equal("Title");
        expect(matches3[3]).to.be.equal("Difficulty");
      }

      const message4 = "osu! - Artist - Title [TV Size] [Difficulty]";
      const matches4 = message4.match(regexNowPlaying);
      expect(matches4).to.be.not.null;
      if (matches4 != null) {
        expect(matches4[1]).to.be.equal("Artist");
        expect(matches4[2]).to.be.equal("Title [TV Size]");
        expect(matches4[3]).to.be.equal("Difficulty");
      }
    });
  });

  context("custom commands", () => {
    it("regex macro", () => {
      const message0 = "$(macro1Name";
      const matches0 = message0.match(regexMacro);
      expect(matches0).to.be.null;

      const message1 = "(macro1Name)";
      const matches1 = message1.match(regexMacro);
      expect(matches1).to.be.null;

      const message2 = "$()";
      const matches2 = message2.match(regexMacro);
      expect(matches2).to.be.null;

      const message3 = "$(macroName)";
      const matches3 = message3.match(regexMacro);
      expect(matches3).to.be.not.null;
      if (matches3 != null) {
        expect(matches3.length).to.be.equal(1);
        const matches31 = matches3[0].match(regexMacroSingle);
        expect(matches31).to.be.not.null;
        if (matches31 != null) {
          expect(matches31[1]).to.be.equal("macroName");
          expect(matches31[2]).to.be.equal(undefined);
        }
      }

      const message4 = "$(macroName-macroArg)";
      const matches4 = message4.match(regexMacro);
      expect(matches4).to.be.not.null;
      if (matches4 != null) {
        expect(matches4.length).to.be.equal(1);
        const matches41 = matches4[0].match(regexMacroSingle);
        expect(matches41).to.be.not.null;
        if (matches41 != null) {
          expect(matches41[1]).to.be.equal("macroName");
          expect(matches41[2]).to.be.equal("-macroArg");
        }
      }

      const message5 = "$(macroName-macroArg-macroArg2)";
      const matches5 = message5.match(regexMacro);
      expect(matches5).to.be.not.null;
      if (matches5 != null) {
        expect(matches5.length).to.be.equal(1);
        const matches51 = matches5[0].match(regexMacroSingle);
        expect(matches51).to.be.not.null;
        if (matches51 != null) {
          expect(matches51[1]).to.be.equal("macroName");
          expect(matches51[2]).to.be.equal("-macroArg-macroArg2");
        }
      }

      const message6 = "$(macroName-macroArg=macroArgValue)";
      const matches6 = message6.match(regexMacro);
      expect(matches6).to.be.not.null;
      if (matches6 != null) {
        expect(matches6.length).to.be.equal(1);
        const matches61 = matches6[0].match(regexMacroSingle);
        expect(matches61).to.be.not.null;
        if (matches61 != null) {
          expect(matches61[1]).to.be.equal("macroName");
          expect(matches61[2]).to.be.equal("-macroArg=macroArgValue");
        }
      }

      const message7 = "$(macroName-macroArg=$(macroArgValue))";
      const matches7 = message7.match(regexMacro);
      expect(matches7).to.be.not.null;
      if (matches7 != null) {
        expect(matches7.length).to.be.equal(1);
        const matches71 = matches7[0].match(regexMacroSingle);
        expect(matches71).to.be.not.null;
        if (matches71 != null) {
          expect(matches71[1]).to.be.equal("macroName");
          expect(matches71[2]).to.be.equal("-macroArg=$(macroArgValue)");
        }
      }

      const message8 = "(2-11=$(random-1-10))";
      const matches8 = message8.match(regexMacro);
      expect(matches8).to.be.not.null;
      if (matches8 != null) {
        expect(matches8.length).to.be.equal(1);
        const matches81 = matches8[0].match(regexMacroSingle);
        expect(matches81).to.be.not.null;
        if (matches81 != null) {
          expect(matches81[1]).to.be.equal("random");
          expect(matches81[2]).to.be.equal("-1-10");
        }
      }

      const message9 = "Test command query is: '$(group-1)'";
      const matches9 = message9.match(regexMacro);
      expect(matches9).to.be.not.null;
      if (matches9 != null) {
        expect(matches9.length).to.be.equal(1);
        const matches91 = matches9[0].match(regexMacroSingle);
        expect(matches91).to.be.not.null;
        if (matches91 != null) {
          expect(matches91[1]).to.be.equal("group");
          expect(matches91[2]).to.be.equal("-1");
        }
      }
    });

    it("regex macro argument", () => {
      const message0 = "";
      const matches0 = message0.match(regexMacroArg);
      expect(matches0).to.be.null;

      const message1 = "a";
      const matches1 = message1.match(regexMacroArg);
      expect(matches1).to.be.null;

      const message2 = "a-";
      const matches2 = message2.match(regexMacroArg);
      expect(matches2).to.be.null;

      const message3 = "-name";
      const matches3 = message3.match(regexMacroArg);
      expect(matches3).to.be.not.null;
      if (matches3 != null) {
        const matches31 = getMacroArgs(message3);
        expect(matches31.length).to.be.equal(1);
        expect(matches31[0].name).to.be.equal("name");
        expect(matches31[0].value).to.be.equal(undefined);
      }

      const message4 = "-name-blue=true";
      const matches4 = message4.match(regexMacroArg);
      expect(matches4).to.be.not.null;
      if (matches4 != null) {
        const matches41 = getMacroArgs(message4);
        expect(matches41.length).to.be.equal(2);
        expect(matches41[0].name).to.be.equal("name");
        expect(matches41[0].value).to.be.equal(undefined);
        expect(matches41[1].name).to.be.equal("blue");
        expect(matches41[1].value).to.be.equal("true");
      }

      const message5 = "-name=$(group-2)-blub-name2=$(random-1-100)";
      const matches5 = message5.match(regexMacroArg);
      expect(matches5).to.be.not.null;
      if (matches5 != null) {
        const matches51 = getMacroArgs(message5);
        expect(matches51.length).to.be.equal(3);
        expect(matches51[0].name).to.be.equal("name");
        expect(matches51[0].value).to.be.equal("$(group-2)");
        expect(matches51[1].name).to.be.equal("blub");
        expect(matches51[1].value).to.be.equal(undefined);
        expect(matches51[2].name).to.be.equal("name2");
        expect(matches51[2].value).to.be.equal("$(random-1-100)");
      }

      const message6 = "-1";
      const matches6 = message6.match(regexMacroArg);
      expect(matches6).to.be.not.null;
      if (matches6 != null) {
        const matches61 = getMacroArgs(message6);
        expect(matches61.length).to.be.equal(1);
        expect(matches61[0].name).to.be.equal("1");
        expect(matches61[0].value).to.be.equal(undefined);
      }
    });
  });
});
