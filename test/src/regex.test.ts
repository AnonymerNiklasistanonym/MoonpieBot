/* eslint-disable no-magic-numbers */

// Package imports
import { expect } from "chai";
// Local imports
import {
  regexMoonpieChatHandlerCommandAbout,
  regexMoonpieChatHandlerCommandClaim,
  regexMoonpieChatHandlerCommandLeaderboard,
  regexMoonpieChatHandlerCommandUserAdd,
  regexMoonpieChatHandlerCommandUserDelete,
  regexMoonpieChatHandlerCommandUserGet,
  regexMoonpieChatHandlerCommandUserRemove,
  regexMoonpieChatHandlerCommandUserSet,
  regexOsuBeatmapUrlMatcher,
  regexOsuChatHandlerCommandNp,
  regexOsuChatHandlerCommandPp,
  regexOsuChatHandlerCommandRp,
  regexOsuWindowTitleNowPlaying,
} from "../../src/info/regex";

interface RegexTestElement<TEST_TYPE = string[]> {
  expected: null | TEST_TYPE;
  input: string;
}

const checkRegexTestElements = <TEST_TYPE = string[]>(
  testSet: RegexTestElement<TEST_TYPE>[],
  regex: RegExp,
  getExpectedRegexGroups: (a: TEST_TYPE) => string[]
) => {
  for (const a of testSet) {
    const match = a.input.match(regex);
    if (a.expected == null) {
      expect(match, `No match was expected for "${a.input}"`).to.be.null;
    } else {
      expect(match, `A match was expected for "${a.input}"`).to.be.not.null;
      if (match != null) {
        const expectedRegexGroups = getExpectedRegexGroups(a.expected);
        expect(match.length).to.be.greaterThan(
          expectedRegexGroups.length,
          `At least ${expectedRegexGroups.length} regex groups were expected`
        );
        for (const [index, value] of expectedRegexGroups.entries()) {
          // eslint-disable-next-line security/detect-object-injection
          expect(match[index + 1]).to.be.equal(
            value,
            `The regex group match value "${value}" was expected at index ${index}`
          );
        }
      }
    }
  }
};

describe("regex", () => {
  context("!moonpie commands", () => {
    it("!moonpie", () => {
      const testSetMoonpieClaim: RegexTestElement[] = [
        { expected: null, input: "!monpie" },
        { expected: null, input: "!moonpieabc" },
        { expected: null, input: "a!moonpie" },
        { expected: null, input: "moonpie" },
        { expected: null, input: "a moonpie" },
        { expected: null, input: "amoonpie" },
        { expected: [], input: "!moonpie" },
        { expected: [], input: "   !moonpie   " },
        { expected: [], input: "!moonpie message" },
        { expected: [], input: "!moonpie message after that" },
      ];
      checkRegexTestElements(
        testSetMoonpieClaim,
        regexMoonpieChatHandlerCommandClaim,
        (a) => a
      );
    });
    it("!moonpie about", () => {
      const testSetMoonpieAbout: RegexTestElement[] = [
        { expected: null, input: "!monpie" },
        { expected: null, input: "!moonpieabout" },
        { expected: null, input: "a!moonpie about" },
        { expected: null, input: "moonpie about" },
        { expected: null, input: "a moonpie about" },
        { expected: null, input: "amoonpie about" },
        { expected: null, input: "!moonpie aboutmessage" },
        { expected: [], input: "!moonpie about" },
        { expected: [], input: "   !moonpie about  " },
        { expected: [], input: "   !moonpie    about  " },
        { expected: [], input: "!moonpie about message" },
        { expected: [], input: "!moonpie about message after that" },
      ];
      checkRegexTestElements(
        testSetMoonpieAbout,
        regexMoonpieChatHandlerCommandAbout,
        (a) => a
      );
    });
    it("!moonpie leaderboard", () => {
      interface MoonpieLeaderboardOutput {
        rank?: string;
      }
      const testSetMoonpieLeaderboard: RegexTestElement<MoonpieLeaderboardOutput>[] =
        [
          { expected: null, input: "!monpie" },
          { expected: null, input: "!moonpieleaderboard" },
          { expected: null, input: "a!moonpie leaderboard" },
          { expected: null, input: "moonpie leaderboard" },
          { expected: null, input: "a moonpie leaderboard" },
          { expected: null, input: "amoonpie leaderboard" },
          { expected: null, input: "!moonpie leaderboardmessage" },
          { expected: {}, input: "!moonpie leaderboard" },
          { expected: {}, input: "   !moonpie leaderboard  " },
          { expected: {}, input: "   !moonpie    leaderboard  " },
          { expected: {}, input: "!moonpie leaderboard message" },
          { expected: {}, input: "!moonpie leaderboard message after that" },
          { expected: { rank: "12" }, input: "!moonpie leaderboard 12" },
          { expected: { rank: "11" }, input: "   !moonpie leaderboard  11  " },
          {
            expected: { rank: "69" },
            input: "!moonpie leaderboard 69 message",
          },
          {
            expected: { rank: "42" },
            input: "!moonpie leaderboard 42 message after that",
          },
          { expected: {}, input: "!moonpie leaderboard 42message" },
        ];
      checkRegexTestElements(
        testSetMoonpieLeaderboard,
        regexMoonpieChatHandlerCommandLeaderboard,
        (a) => (a.rank !== undefined ? [a.rank] : [])
      );
    });

    it("!moonpie get $USER", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieChatHandlerCommandUserGet);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieChatHandlerCommandUserGet);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieChatHandlerCommandUserGet);
      expect(matches2).to.be.null;

      const message3 = "!moonpie get";
      const matches3 = message3.match(regexMoonpieChatHandlerCommandUserGet);
      expect(matches3).to.be.null;

      const message4 = "!moonpie get username";
      const matches4 = message4.match(regexMoonpieChatHandlerCommandUserGet);
      expect(matches4).to.not.be.null;
      if (matches4) {
        expect(matches4[1]).to.be.equal("username");
      }

      const message5 = "!moonpie get AbCD";
      const matches5 = message5.match(regexMoonpieChatHandlerCommandUserGet);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("AbCD");
      }

      const message6 = "abc !moonpie get username";
      const matches6 = message6.match(regexMoonpieChatHandlerCommandUserGet);
      expect(matches6).to.be.null;

      const message7 = "!moonpie get username text after that";
      const matches7 = message7.match(regexMoonpieChatHandlerCommandUserGet);
      expect(matches7).to.not.be.null;
      if (matches7) {
        expect(matches7[1]).to.be.equal("username");
      }
    });

    it("!moonpie delete $USER", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieChatHandlerCommandUserDelete);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieChatHandlerCommandUserDelete);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieChatHandlerCommandUserDelete);
      expect(matches2).to.be.null;

      const message3 = "!moonpie delete";
      const matches3 = message3.match(regexMoonpieChatHandlerCommandUserDelete);
      expect(matches3).to.be.null;

      const message4 = "!moonpie delete username";
      const matches4 = message4.match(regexMoonpieChatHandlerCommandUserDelete);
      expect(matches4).to.not.be.null;
      if (matches4) {
        expect(matches4[1]).to.be.equal("username");
      }

      const message5 = "!moonpie delete AbCD";
      const matches5 = message5.match(regexMoonpieChatHandlerCommandUserDelete);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("AbCD");
      }

      const message6 = "abc !moonpie delete username";
      const matches6 = message6.match(regexMoonpieChatHandlerCommandUserDelete);
      expect(matches6).to.be.null;

      const message7 = "!moonpie delete username text after that";
      const matches7 = message7.match(regexMoonpieChatHandlerCommandUserDelete);
      expect(matches7).to.not.be.null;
      if (matches7) {
        expect(matches7[1]).to.be.equal("username");
      }
    });

    it("!moonpie add $USER $COUNT", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches2).to.be.null;

      const message3 = "!moonpie add";
      const matches3 = message3.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches3).to.be.null;

      const message4 = "!moonpie add username";
      const matches4 = message4.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches4).to.be.null;

      const message5 = "!moonpie add username 100";
      const matches5 = message5.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("username");
        expect(parseInt(matches5[2])).to.be.equal(100);
      }

      const message6 = "!moonpie add username 100a";
      const matches6 = message6.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches6).to.be.null;

      const message7 = "abc !moonpie add username 100";
      const matches7 = message7.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches7).to.be.null;

      const message8 = "!moonpie add username 100 text after that";
      const matches8 = message8.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches8).to.not.be.null;
      if (matches8) {
        expect(matches8[1]).to.be.equal("username");
        expect(parseInt(matches8[2])).to.be.equal(100);
      }

      const message9 = "!moonpie get username 100";
      const matches9 = message9.match(regexMoonpieChatHandlerCommandUserAdd);
      expect(matches9).to.be.null;
    });

    it("!moonpie remove $USER $COUNT", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches2).to.be.null;

      const message3 = "!moonpie remove";
      const matches3 = message3.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches3).to.be.null;

      const message4 = "!moonpie remove username";
      const matches4 = message4.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches4).to.be.null;

      const message5 = "!moonpie remove username 100";
      const matches5 = message5.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("username");
        expect(parseInt(matches5[2])).to.be.equal(100);
      }

      const message6 = "!moonpie remove username 100a";
      const matches6 = message6.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches6).to.be.null;

      const message7 = "abc !moonpie remove username 100";
      const matches7 = message7.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches7).to.be.null;

      const message8 = "!moonpie remove username 100 text after that";
      const matches8 = message8.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches8).to.not.be.null;
      if (matches8) {
        expect(matches8[1]).to.be.equal("username");
        expect(parseInt(matches8[2])).to.be.equal(100);
      }

      const message9 = "!moonpie set username 100";
      const matches9 = message9.match(regexMoonpieChatHandlerCommandUserRemove);
      expect(matches9).to.be.null;
    });

    it("!moonpie set $USER $COUNT", () => {
      const message0 = "!monpie";
      const matches0 = message0.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches0).to.be.null;

      const message1 = "!moonpie";
      const matches1 = message1.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches1).to.be.null;

      const message2 = "!moonpie message after that";
      const matches2 = message2.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches2).to.be.null;

      const message3 = "!moonpie set";
      const matches3 = message3.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches3).to.be.null;

      const message4 = "!moonpie set username";
      const matches4 = message4.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches4).to.be.null;

      const message5 = "!moonpie set username 100";
      const matches5 = message5.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches5).to.not.be.null;
      if (matches5) {
        expect(matches5[1]).to.be.equal("username");
        expect(parseInt(matches5[2])).to.be.equal(100);
      }

      const message6 = "!moonpie set username 100a";
      const matches6 = message6.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches6).to.be.null;

      const message7 = "abc !moonpie set username 100";
      const matches7 = message7.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches7).to.be.null;

      const message8 = "!moonpie set username 100 text after that";
      const matches8 = message8.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches8).to.not.be.null;
      if (matches8) {
        expect(matches8[1]).to.be.equal("username");
        expect(parseInt(matches8[2])).to.be.equal(100);
      }

      const message9 = "!moonpie add username 100";
      const matches9 = message9.match(regexMoonpieChatHandlerCommandUserSet);
      expect(matches9).to.be.null;
    });
  });

  context("osu internal", () => {
    it("now playing window", () => {
      const message0 = "osu! - Artist Title [Difficulty]";
      const matches0 = message0.match(regexOsuWindowTitleNowPlaying);
      expect(matches0).to.be.null;

      const message1 = "osu! - Artist - Title";
      const matches1 = message1.match(regexOsuWindowTitleNowPlaying);
      expect(matches1).to.be.null;

      const message2 = "Title - Artist [Difficulty]";
      const matches2 = message2.match(regexOsuWindowTitleNowPlaying);
      expect(matches2).to.be.null;

      const message3 = "osu! - Artist - Title [Difficulty]";
      const matches3 = message3.match(regexOsuWindowTitleNowPlaying);
      expect(matches3).to.be.not.null;
      if (matches3 != null) {
        expect(matches3[1]).to.be.equal("Artist");
        expect(matches3[2]).to.be.equal("Title");
        expect(matches3[3]).to.be.equal("Difficulty");
      }

      const message4 = "osu! - Artist - Title [TV Size] [Difficulty]";
      const matches4 = message4.match(regexOsuWindowTitleNowPlaying);
      expect(matches4).to.be.not.null;
      if (matches4 != null) {
        expect(matches4[1]).to.be.equal("Artist");
        expect(matches4[2]).to.be.equal("Title [TV Size]");
        expect(matches4[3]).to.be.equal("Difficulty");
      }

      interface OsuWindowTitleOutput {
        artist: string;
        title: string;
        version: string;
      }

      const testSetOsuWindowTitle: RegexTestElement<OsuWindowTitleOutput>[] = [
        {
          expected: {
            artist: "Sarah Connor",
            title: "Cold As Ice (PH Electro Remix) (Nightcore Mix)",
            version: "Freezing",
          },
          input:
            "osu!  - Sarah Connor - Cold As Ice (PH Electro Remix) (Nightcore Mix) [Freezing]",
        },
        {
          expected: {
            artist: "sasakure.UK",
            title: "SeventH-HeaveN feat. Hatsune Miku",
            version: "Easy",
          },
          input:
            "osu!  - sasakure.UK - SeventH-HeaveN feat. Hatsune Miku [Easy]",
        },
        {
          expected: {
            artist: "-45",
            title: "Midorigo Queen Bee",
            version: "Normal",
          },
          input: "osu!  - -45 - Midorigo Queen Bee [Normal]",
        },
        {
          expected: {
            artist: "DJ S3RL",
            title: "T-T-Techno (feat. Jesskah)",
            version: "Normal",
          },
          input: "osu!  - DJ S3RL - T-T-Techno (feat. Jesskah) [Normal]",
        },
      ];
      checkRegexTestElements(
        testSetOsuWindowTitle,
        regexOsuWindowTitleNowPlaying,
        (a) => [a.artist, a.title, a.version]
      );
    });
  });

  context("osu commands", () => {
    it("!np", () => {
      const message0 = "!n";
      const matches0 = message0.match(regexOsuChatHandlerCommandNp);
      expect(matches0).to.be.null;

      const message1 = "!np";
      const matches1 = message1.match(regexOsuChatHandlerCommandNp);
      expect(matches1).to.not.be.null;

      const message2 = "!np message";
      const matches2 = message2.match(regexOsuChatHandlerCommandNp);
      expect(matches2).to.not.be.null;

      const message3 = "!np message with spaces";
      const matches3 = message3.match(regexOsuChatHandlerCommandNp);
      expect(matches3).to.not.be.null;

      const message4 = "message before !np";
      const matches4 = message4.match(regexOsuChatHandlerCommandNp);
      expect(matches4).to.be.null;

      const message5 = "  !np";
      const matches5 = message5.match(regexOsuChatHandlerCommandNp);
      expect(matches5).to.not.be.null;
    });
    it("!pp", () => {
      const message0 = "!n";
      const matches0 = message0.match(regexOsuChatHandlerCommandPp);
      expect(matches0).to.be.null;

      const message1 = "!pp";
      const matches1 = message1.match(regexOsuChatHandlerCommandPp);
      expect(matches1).to.not.be.null;
      if (matches1 != null) {
        expect(matches1[1]).to.be.undefined;
        expect(matches1[2]).to.be.undefined;
      }

      const message2 = "!pp Ooi";
      const matches2 = message2.match(regexOsuChatHandlerCommandPp);
      expect(matches2).to.not.be.null;
      if (matches2 != null) {
        expect(matches2[1]).to.be.undefined;
        expect(matches2[2]).to.be.equal("Ooi");
      }

      const message3 = "!pp 9096716";
      const matches3 = message3.match(regexOsuChatHandlerCommandPp);
      expect(matches3).to.not.be.null;
      if (matches3 != null) {
        expect(matches3[1]).to.be.equal("9096716");
        expect(matches3[2]).to.be.undefined;
      }

      const message4 = "!pp Ooi Custom message";
      const matches4 = message4.match(regexOsuChatHandlerCommandPp);
      expect(matches4).to.not.be.null;
      if (matches4 != null) {
        expect(matches4[1]).to.be.undefined;
        expect(matches4[2]).to.be.equal("Ooi");
      }

      const message5 = "!pp 9096716 Custom message";
      const matches5 = message5.match(regexOsuChatHandlerCommandPp);
      expect(matches5).to.not.be.null;
      if (matches5 != null) {
        expect(matches5[1]).to.be.equal("9096716");
        expect(matches5[2]).to.be.undefined;
      }

      const message6 = "message before !pp";
      const matches6 = message6.match(regexOsuChatHandlerCommandPp);
      expect(matches6).to.be.null;

      const message7 = "  !pp";
      const matches7 = message7.match(regexOsuChatHandlerCommandPp);
      expect(matches7).to.not.be.null;
      if (matches7 != null) {
        expect(matches7[1]).to.be.undefined;
        expect(matches7[2]).to.be.undefined;
      }
    });
    it("!rp", () => {
      const message0 = "!r";
      const matches0 = message0.match(regexOsuChatHandlerCommandRp);
      expect(matches0).to.be.null;

      const message1 = "!rp";
      const matches1 = message1.match(regexOsuChatHandlerCommandRp);
      expect(matches1).to.not.be.null;
      if (matches1 != null) {
        expect(matches1[1]).to.be.undefined;
        expect(matches1[2]).to.be.undefined;
      }

      const message2 = "!rp Ooi";
      const matches2 = message2.match(regexOsuChatHandlerCommandRp);
      expect(matches2).to.not.be.null;
      if (matches2 != null) {
        expect(matches2[1]).to.be.undefined;
        expect(matches2[2]).to.be.equal("Ooi");
      }

      const message3 = "!rp 9096716";
      const matches3 = message3.match(regexOsuChatHandlerCommandRp);
      expect(matches3).to.not.be.null;
      if (matches3 != null) {
        expect(matches3[1]).to.be.equal("9096716");
        expect(matches3[2]).to.be.undefined;
      }

      const message4 = "!rp Ooi Custom message";
      const matches4 = message4.match(regexOsuChatHandlerCommandRp);
      expect(matches4).to.not.be.null;
      if (matches4 != null) {
        expect(matches4[1]).to.be.undefined;
        expect(matches4[2]).to.be.equal("Ooi");
      }

      const message5 = "!rp 9096716 Custom message";
      const matches5 = message5.match(regexOsuChatHandlerCommandRp);
      expect(matches5).to.not.be.null;
      if (matches5 != null) {
        expect(matches5[1]).to.be.equal("9096716");
        expect(matches5[2]).to.be.undefined;
      }

      const message6 = "message before !rp";
      const matches6 = message6.match(regexOsuChatHandlerCommandRp);
      expect(matches6).to.be.null;

      const message7 = "  !rp";
      const matches7 = message7.match(regexOsuChatHandlerCommandRp);
      expect(matches7).to.not.be.null;
      if (matches7 != null) {
        expect(matches7[1]).to.be.undefined;
        expect(matches7[2]).to.be.undefined;
      }
    });

    it("beatmap detection", () => {
      const message0 =
        "https://osu.ppy.sh/beatmaps/2587891 $OPTIONAL_TEXT_WITH_SPACES";
      const matches0 = message0.match(regexOsuBeatmapUrlMatcher);
      expect(matches0).to.be.not.null;
      if (matches0 != null) {
        expect(matches0[1]).to.be.equal("2587891");
        expect(matches0[2]).to.be.equal(undefined);
        expect(matches0[3]).to.be.equal("$OPTIONAL_TEXT_WITH_SPACES");
      }
      const message1 = "https://osu.ppy.sh/beatmaps/2587891";
      const matches1 = message1.match(regexOsuBeatmapUrlMatcher);
      expect(matches1).to.be.not.null;
      if (matches1 != null) {
        expect(matches1[1]).to.be.equal("2587891");
        expect(matches1[2]).to.be.equal(undefined);
        expect(matches1[3]).to.be.equal(undefined);
      }
      const message2 = "https://osu.ppy.sh/beatmaps/2587891 ";
      const matches2 = message2.match(regexOsuBeatmapUrlMatcher);
      expect(matches2).to.be.not.null;
      if (matches2 != null) {
        expect(matches2[1]).to.be.equal("2587891");
        expect(matches2[2]).to.be.equal(undefined);
        expect(matches2[3]).to.be.equal(undefined);
      }
      const message3 =
        "$OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $OPTIONAL_TEXT_WITH_SPACES";
      const matches3 = message3.match(regexOsuBeatmapUrlMatcher);
      expect(matches3).to.be.not.null;
      if (matches3 != null) {
        expect(matches3[1]).to.be.equal(undefined);
        expect(matches3[2]).to.be.equal("2554945");
        expect(matches3[3]).to.be.equal("$OPTIONAL_TEXT_WITH_SPACES");
      }
      const message4 =
        "https://osu.ppy.sh/beatmaps/2587891 https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmaps/2587892 https://osu.ppy.sh/beatmaps/2587893 $OPTIONAL TEXT WITH SPACES";
      const messages4 = message4
        .split("https://osu.ppy.sh/beatmap")
        .map((a) => `https://osu.ppy.sh/beatmap${a}`);
      expect(messages4.length).to.be.equal(5);
      const matches4 = messages4.map((a) => a.match(regexOsuBeatmapUrlMatcher));
      expect(matches4).to.be.not.null;
      const matches4Array = Array.from(matches4);
      expect(matches4Array.length).to.be.equal(5);
      expect(matches4Array[0]).to.be.null;
      expect(matches4Array[1]).to.be.not.null;
      if (matches4Array[1] != null) {
        expect(matches4Array[1][1]).to.be.equal("2587891");
        expect(matches4Array[1][2]).to.be.equal(undefined);
        expect(matches4Array[1][3]).to.be.equal(undefined);
      }
      if (matches4Array[2] != null) {
        expect(matches4Array[2][1]).to.be.equal(undefined);
        expect(matches4Array[2][2]).to.be.equal("2554945");
        expect(matches4Array[2][3]).to.be.equal("$OPTIONAL_TEXT_WITH_SPACES");
      }
      if (matches4Array[3] != null) {
        expect(matches4Array[3][1]).to.be.equal("2587892");
        expect(matches4Array[3][2]).to.be.equal(undefined);
        expect(matches4Array[3][3]).to.be.equal(undefined);
      }
      if (matches4Array[4] != null) {
        expect(matches4Array[4][1]).to.be.equal("2587893");
        expect(matches4Array[4][2]).to.be.equal(undefined);
        expect(matches4Array[4][3]).to.be.equal("$OPTIONAL TEXT WITH SPACES");
      }
    });
  });
});
