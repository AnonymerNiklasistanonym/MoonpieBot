/* eslint-disable no-magic-numbers */

// Package imports
import { expect } from "chai";
// Local imports
import {
  regexMoonpieChatHandlerCommandAbout,
  regexMoonpieChatHandlerCommandClaim,
  regexMoonpieChatHandlerCommandCommands,
  regexMoonpieChatHandlerCommandLeaderboard,
  regexMoonpieChatHandlerCommandUserAdd,
  regexMoonpieChatHandlerCommandUserDelete,
  regexMoonpieChatHandlerCommandUserGet,
  regexMoonpieChatHandlerCommandUserRemove,
  regexMoonpieChatHandlerCommandUserSet,
  regexOsuBeatmapUrlMatcher,
  regexOsuBeatmapUrlSplitter,
  regexOsuChatHandlerCommandCommands,
  regexOsuChatHandlerCommandNp,
  regexOsuChatHandlerCommandPp,
  regexOsuChatHandlerCommandRequests,
  regexOsuChatHandlerCommandRp,
  regexOsuWindowTitleNowPlaying,
  regexSpotifyChatHandlerCommandCommands,
  regexSpotifyChatHandlerCommandSong,
} from "../../src/info/regex";

interface RegexTestElement<TEST_TYPE = string[]> {
  expected: null | TEST_TYPE;
  input: string;
}
const toStringIfNotUndef = (value: number | undefined) =>
  value === undefined ? undefined : `${value}`;
const undefOrValue = (value: string | undefined) =>
  value === undefined ? "undefined" : `"${value}"`;
const checkRegexTestElements = <TEST_TYPE = string[]>(
  testSet: RegexTestElement<TEST_TYPE>[],
  regex: RegExp,
  getExpectedRegexGroups: (a: TEST_TYPE) => (string | undefined)[]
) => {
  for (const a of testSet) {
    const match = a.input.match(regex);
    const baseErrorMessage = `for "${a.input}" using "${regex.toString()}"`;
    if (a.expected == null) {
      expect(match, `No match was expected ${baseErrorMessage}`).to.be.null;
    } else {
      expect(match, `A match was expected ${baseErrorMessage}`).to.be.not.null;
      if (match != null) {
        const expectedRegexGroups = getExpectedRegexGroups(a.expected);
        expect(match.length).to.be.greaterThan(
          expectedRegexGroups.length,
          `At least ${
            expectedRegexGroups.length
          } regex groups were expected (${JSON.stringify(
            expectedRegexGroups
          )}/${JSON.stringify(match.slice(0, 1))}) ${baseErrorMessage}`
        );
        for (const [index, value] of expectedRegexGroups.entries()) {
          expect(match[index + 1]).to.be.equal(
            value,
            `Unexpected regex group [${index}] value ${undefOrValue(
              value
            )} ${baseErrorMessage}`
          );
        }
      }
    }
  }
};

describe("regex", () => {
  context("moonpie commands", () => {
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
    it("!moonpie about/commands/leaderboard", () => {
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
      checkRegexTestElements(
        testSetMoonpieAbout.map((a) => ({
          ...a,
          input: a.input.replace(/about/g, "leaderboard"),
        })),
        regexMoonpieChatHandlerCommandLeaderboard,
        (a) => a
      );
      checkRegexTestElements(
        testSetMoonpieAbout.map((a) => ({
          ...a,
          input: a.input.replace(/about/g, "commands"),
        })),
        regexMoonpieChatHandlerCommandCommands,
        (a) => a
      );
    });
    it("!moonpie leaderboard $STARTING_RANK", () => {
      interface MoonpieLeaderboardOutput {
        rank?: string;
      }
      const testSetMoonpieLeaderboard: RegexTestElement<MoonpieLeaderboardOutput>[] =
        [
          { expected: null, input: "!moonpie leaderboard42" },
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
        (a) => [a.rank]
      );
    });

    it("!moonpie delete/get $USER", () => {
      interface MoonpieGetDeleteUserOutput {
        user: string;
      }
      const testSetMoonpieUserDelete: RegexTestElement<MoonpieGetDeleteUserOutput>[] =
        [
          { expected: null, input: "!monpie" },
          { expected: null, input: "!moonpie delete" },
          { expected: null, input: "!moonpie deleteuser" },
          { expected: null, input: "a!moonpie delete" },
          { expected: null, input: "a!moonpie delete user" },
          { expected: null, input: "a !moonpie delete user" },
          { expected: null, input: "moonpie delete user" },
          { expected: null, input: "a moonpie get user" },
          { expected: null, input: "amoonpie delete user" },
          { expected: { user: "user" }, input: "!moonpie delete user" },
          { expected: { user: "user" }, input: "   !moonpie delete user  " },
          { expected: { user: "user" }, input: "   !moonpie    delete user " },
          { expected: { user: "user" }, input: "!moonpie delete user message" },
          { expected: { user: "user" }, input: "!moonpie delete user msg ab" },
          { expected: { user: "userAbc" }, input: "!moonpie delete userAbc" },
          { expected: { user: "def" }, input: "!moonpie delete def" },
        ];
      checkRegexTestElements(
        testSetMoonpieUserDelete,
        regexMoonpieChatHandlerCommandUserDelete,
        (a) => [a.user]
      );
      checkRegexTestElements(
        testSetMoonpieUserDelete.map((a) => ({
          ...a,
          input: a.input.replace(/delete/g, "get"),
        })),
        regexMoonpieChatHandlerCommandUserGet,
        (a) => [a.user]
      );
    });

    it("!moonpie add/remove/set $USER $COUNT", () => {
      interface MoonpieUserAddRemoveSetOutput {
        count: number;
        user: string;
      }
      const testSetMoonpieUserSet: RegexTestElement<MoonpieUserAddRemoveSetOutput>[] =
        [
          { expected: null, input: "!monpie" },
          { expected: null, input: "!moonpie set" },
          { expected: null, input: "!moonpie setuser" },
          { expected: null, input: "a!moonpie set" },
          { expected: null, input: "a!moonpie set user" },
          { expected: null, input: "a!moonpie set user 100" },
          { expected: null, input: "a !moonpie set user 100" },
          { expected: null, input: "moonpie set user 100" },
          { expected: null, input: "a moonpie set user 100" },
          { expected: null, input: "!moonpie set user 100k" },
          { expected: null, input: "!moonpie set user -10" },
          {
            expected: { count: 100, user: "user" },
            input: "!moonpie set user 100",
          },
          {
            expected: { count: 100, user: "user" },
            input: "   !moonpie set user 100   ",
          },
          {
            expected: { count: 100, user: "user" },
            input: "   !moonpie    set    user   100   ",
          },
          {
            expected: { count: 100, user: "user" },
            input: "!moonpie set user 100 message",
          },
          {
            expected: { count: 100, user: "user" },
            input: "!moonpie set user 100 message after that",
          },
          {
            expected: { count: 100, user: "user" },
            input: "!moonpie set user 100 200",
          },
          {
            expected: { count: 42, user: "user" },
            input: "!moonpie set user 42",
          },
        ];
      checkRegexTestElements(
        testSetMoonpieUserSet.map((a) => ({
          ...a,
          input: a.input.replace(/set/g, "add"),
        })),
        regexMoonpieChatHandlerCommandUserAdd,
        (a) => [a.user, `${a.count}`]
      );
      checkRegexTestElements(
        testSetMoonpieUserSet.map((a) => ({
          ...a,
          input: a.input.replace(/set/g, "remove"),
        })),
        regexMoonpieChatHandlerCommandUserRemove,
        (a) => [a.user, `${a.count}`]
      );
      checkRegexTestElements(
        testSetMoonpieUserSet,
        regexMoonpieChatHandlerCommandUserSet,
        (a) => [a.user, `${a.count}`]
      );
    });
  });

  context("osu! internal", () => {
    it("osu window title (!np)", () => {
      interface OsuWindowTitleOutput {
        artist: string;
        title: string;
        version: string;
      }
      const testSetOsuWindowTitle: RegexTestElement<OsuWindowTitleOutput>[] = [
        {
          expected: null,
          input: "osu! - Artist Title [Difficulty]",
        },
        {
          expected: null,
          input: "osu! - Artist - Title",
        },
        {
          expected: null,
          input: "osu! - Artist [Difficulty]",
        },
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

  context("osu! commands", () => {
    it("!np/!pp/!rp/!commands/!osuRequests", () => {
      const testSetOsuNp: RegexTestElement[] = [
        { expected: null, input: "!n" },
        { expected: null, input: "!npmessage" },
        { expected: null, input: "a!np" },
        { expected: null, input: "a !np" },
        { expected: null, input: "message before !np" },
        { expected: [], input: "!np" },
        { expected: [], input: "  !np  " },
        { expected: [], input: "  !np message" },
        { expected: [], input: "  !np message after that" },
      ];
      checkRegexTestElements(
        testSetOsuNp,
        regexOsuChatHandlerCommandNp,
        (a) => a
      );
      checkRegexTestElements(
        testSetOsuNp.map((a) => ({
          ...a,
          input: a.input.replace(/np/g, "pp"),
        })),
        regexOsuChatHandlerCommandPp,
        (a) => a
      );
      checkRegexTestElements(
        testSetOsuNp.map((a) => ({
          ...a,
          input: a.input.replace(/np/g, "rp"),
        })),
        regexOsuChatHandlerCommandRp,
        (a) => a
      );
      checkRegexTestElements(
        testSetOsuNp.map((a) => ({
          ...a,
          input: a.input.replace(/np/g, "osu commands"),
        })),
        regexOsuChatHandlerCommandCommands,
        (a) => a
      );
      checkRegexTestElements(
        testSetOsuNp.map((a) => ({
          ...a,
          input: a.input.replace(/np/g, "osuRequests"),
        })),
        regexOsuChatHandlerCommandRequests,
        (a) => a
      );
    });

    it("!osuRequest on/off custom message", () => {
      interface OsuRequestOutput {
        customMessage?: string;
        off?: "off";
        on?: "on";
      }
      const testSetOsuPp: RegexTestElement<OsuRequestOutput>[] = [
        { expected: null, input: "!osuRrequests a" },
        { expected: {}, input: "!osuRequests a" },
        { expected: {}, input: "!osuRequests onnn" },
        { expected: {}, input: "!osuRequests ofmessage" },
        { expected: {}, input: "!osuRequests offf message" },
        { expected: { on: "on" }, input: "!osuRequests on" },
        { expected: { off: "off" }, input: "!osuRequests off" },
        {
          expected: { customMessage: "custom", off: "off" },
          input: "!osuRequests off custom",
        },
        {
          expected: { customMessage: "custom message", off: "off" },
          input: "!osuRequests off custom message  ",
        },
      ];
      checkRegexTestElements(
        testSetOsuPp,
        regexOsuChatHandlerCommandRequests,
        (a) => [a.on, a.off, a.customMessage]
      );
    });

    it("!pp/!rp $USER_NAME/$USER_ID", () => {
      interface OsuPpRpOutput {
        id?: number;
        name?: string;
      }
      const testSetOsuPp: RegexTestElement<OsuPpRpOutput>[] = [
        { expected: null, input: "!ppOoi" },
        { expected: null, input: "!pp9096716" },
        { expected: { name: "Ooi" }, input: "!pp Ooi" },
        { expected: { name: "Ooi" }, input: "  !pp Ooi  " },
        { expected: { name: "Ooi" }, input: "  !pp   Ooi  " },
        { expected: { name: "Ooi" }, input: "!pp Ooi message" },
        { expected: { name: "Ooi" }, input: "!pp Ooi message after that" },
        { expected: { id: 9096716 }, input: "!pp 9096716" },
        { expected: { id: 9096716 }, input: "  !pp 9096716  " },
        { expected: { id: 9096716 }, input: "  !pp   9096716  " },
        { expected: { id: 9096716 }, input: "!pp 9096716 message" },
        { expected: { id: 9096716 }, input: "!pp 9096716 message after that" },
      ];
      checkRegexTestElements(
        testSetOsuPp,
        regexOsuChatHandlerCommandPp,
        (a) => [toStringIfNotUndef(a.id), a.name]
      );
      checkRegexTestElements(
        testSetOsuPp.map((a) => ({
          ...a,
          input: a.input.replace(/pp/g, "rp"),
        })),
        regexOsuChatHandlerCommandRp,
        (a) => [toStringIfNotUndef(a.id), a.name]
      );
    });

    it("beatmap detection", () => {
      interface OsuBeatmapUrlIdOutput {
        beatmapsId?: number;
        beatmapsetId?: number;
        comment?: string;
      }
      const testSetOsuBeatmapUrl: RegexTestElement<OsuBeatmapUrlIdOutput>[] = [
        {
          expected: null,
          input: "https://osu.ppy.sh/beatmps/2587891",
        },
        {
          expected: null,
          input: "https://osi.ppy.sh/beatmaps/2587891",
        },
        {
          expected: { beatmapsetId: 2554945 },
          input: "https://osu.ppy.sh/beatmapsets/1228734#osu/2554945",
        },
        {
          expected: { beatmapsId: 2587891 },
          input: "  https://osu.ppy.sh/beatmaps/2587891",
        },
        {
          expected: { beatmapsetId: 2554945 },
          input: "  https://osu.ppy.sh/beatmapsets/1228734#osu/2554945",
        },
        {
          expected: { beatmapsId: 2587891 },
          input: "  https://osu.ppy.sh/beatmaps/2587891  ",
        },
        {
          expected: { beatmapsetId: 2554945 },
          input: "  https://osu.ppy.sh/beatmapsets/1228734#osu/2554945  ",
        },
        {
          expected: { beatmapsId: 2587891 },
          input: "before https://osu.ppy.sh/beatmaps/2587891",
        },
        {
          expected: { beatmapsetId: 2554945 },
          input: "before https://osu.ppy.sh/beatmapsets/1228734#osu/2554945",
        },
        {
          expected: { beatmapsId: 2587891, comment: "after" },
          input: "before https://osu.ppy.sh/beatmaps/2587891 after",
        },
        {
          expected: { beatmapsetId: 2554945, comment: "after" },
          input:
            "before https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 after",
        },
        {
          expected: { beatmapsId: 2587891, comment: "message after" },
          input: "before https://osu.ppy.sh/beatmaps/2587891   message after",
        },
        {
          expected: { beatmapsetId: 2554945, comment: "message after" },
          input:
            "before https://osu.ppy.sh/beatmapsets/1228734#osu/2554945   message after",
        },
      ];
      checkRegexTestElements(
        testSetOsuBeatmapUrl,
        regexOsuBeatmapUrlMatcher,
        (a) => [
          toStringIfNotUndef(a.beatmapsId),
          toStringIfNotUndef(a.beatmapsetId),
          a.comment,
        ]
      );

      expect(
        regexOsuBeatmapUrlSplitter(
          "https://osu.ppy.sh/beatmaps/2587891 abc def"
        )
      ).to.be.deep.equal(["https://osu.ppy.sh/beatmaps/2587891 abc def"]);
      expect(
        regexOsuBeatmapUrlSplitter("https://osu.ppy.sh/beatmaps/2587891")
      ).to.be.deep.equal(["https://osu.ppy.sh/beatmaps/2587891"]);
      expect(
        regexOsuBeatmapUrlSplitter(
          "abc https://osu.ppy.sh/beatmaps/2587891 abc"
        )
      ).to.be.deep.equal(["abc ", "https://osu.ppy.sh/beatmaps/2587891 abc"]);
      expect(
        regexOsuBeatmapUrlSplitter(
          "https://osu.ppy.sh/beatmaps/2587891 https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmaps/2587892 https://osu.ppy.sh/beatmaps/2587893 $OPTIONAL TEXT WITH SPACES"
        )
      ).to.be.deep.equal([
        "https://osu.ppy.sh/beatmaps/2587891 ",
        "https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $OPTIONAL_TEXT_WITH_SPACES ",
        "https://osu.ppy.sh/beatmaps/2587892 ",
        "https://osu.ppy.sh/beatmaps/2587893 $OPTIONAL TEXT WITH SPACES",
      ]);
    });
  });
  context("spotify commands", () => {
    it("!song/!spotify commands", () => {
      const testSetSpotifySong: RegexTestElement[] = [
        { expected: null, input: "!son" },
        { expected: null, input: "!songmessage" },
        { expected: null, input: "a!song" },
        { expected: null, input: "a !song" },
        { expected: null, input: "message before !song" },
        { expected: [], input: "!song" },
        { expected: [], input: "  !song  " },
        { expected: [], input: "  !song message" },
        { expected: [], input: "  !song message after that" },
      ];
      checkRegexTestElements(
        testSetSpotifySong,
        regexSpotifyChatHandlerCommandSong,
        (a) => a
      );
      checkRegexTestElements(
        testSetSpotifySong.map((a) => ({
          ...a,
          input: a.input.replace(/song/g, "spotify commands"),
        })),
        regexSpotifyChatHandlerCommandCommands,
        (a) => a
      );
    });
  });
});
