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
  regexOsuBeatmapIdFromUrl,
  regexOsuBeatmapUrlSplitter,
  regexOsuChatHandlerCommandCommands,
  regexOsuChatHandlerCommandNp,
  regexOsuChatHandlerCommandPp,
  regexOsuChatHandlerCommandRequests,
  regexOsuChatHandlerCommandRp,
  RegexOsuWindowTitleNowPlaying,
  regexOsuWindowTitleNowPlaying,
  regexSpotifyChatHandlerCommandCommands,
  regexSpotifyChatHandlerCommandSong,
} from "../../src/info/regex";
// Type imports
import type {
  RegexMoonpieChatHandlerCommandLeaderboard,
  RegexMoonpieChatHandlerCommandUserAdd,
  RegexMoonpieChatHandlerCommandUserDelete,
  RegexMoonpieChatHandlerCommandUserGet,
  RegexMoonpieChatHandlerCommandUserRemove,
  RegexMoonpieChatHandlerCommandUserSet,
  RegexOsuBeatmapIdFromUrl,
  RegexOsuChatHandlerCommandPp,
  RegexOsuChatHandlerCommandRequests,
  RegexOsuChatHandlerCommandRp,
} from "../../src/info/regex";

interface RegexTestElement<TEST_TYPE extends object = object> {
  /**
   * Null if no match is expected, undefined if no capture
   * groups exist and otherwise the named capture groups.
   */
  expected: null | undefined | TEST_TYPE;
  input: string;
}
const undefOrValueString = (value: string | undefined) =>
  value === undefined ? "undefined" : `"${value}"`;
const undefOrValue = (value?: string | number | object): undefined | string =>
  value === undefined ? undefined : value.toString();
const checkRegexTestElements = <TEST_TYPE extends object = object>(
  testSet: RegexTestElement<TEST_TYPE>[],
  regex: RegExp,
  getExpectedRegexGroups: (a?: TEST_TYPE) => (string | undefined)[] = (a) =>
    a === undefined ? [] : Object.entries(a).map(undefOrValue)
) => {
  for (const a of testSet) {
    const match = a.input.match(regex);
    const baseErrorMessage = `for "${a.input}" using "${regex.toString()}"`;
    if (a.expected === null) {
      expect(match, `No match was expected ${baseErrorMessage}`).to.be.null;
    } else {
      expect(match, `A match was expected ${baseErrorMessage}`).to.be.not.null;
      if (match !== null) {
        // Check if indices work
        // TODO Delete after migration
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
            `Unexpected regex group [${index}] value ${undefOrValueString(
              value
            )} ${baseErrorMessage}`
          );
        }
        // Check if named capture groups work
        if (match.groups !== undefined) {
          // Purge undefined values from the group for testing
          Object.keys(match.groups).forEach((key) => {
            if (match.groups === undefined) {
              return;
            }
            // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-unsafe-member-access
            if (match.groups[key] === undefined) {
              // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-unsafe-member-access
              delete match.groups[key];
            }
          });
        }
        expect(match.groups).to.be.deep.equal(
          a.expected,
          `Expected named capture groups to be equal ${baseErrorMessage}`
        );
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
        { expected: undefined, input: "!moonpie" },
        { expected: undefined, input: "   !moonpie   " },
        { expected: undefined, input: "!moonpie message" },
        { expected: undefined, input: "!moonpie message after that" },
      ];
      checkRegexTestElements(
        testSetMoonpieClaim,
        regexMoonpieChatHandlerCommandClaim
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
        { expected: undefined, input: "!moonpie about" },
        { expected: undefined, input: "   !moonpie about  " },
        { expected: undefined, input: "   !moonpie    about  " },
        { expected: undefined, input: "!moonpie about message" },
        { expected: undefined, input: "!moonpie about message after that" },
      ];
      checkRegexTestElements(
        testSetMoonpieAbout,
        regexMoonpieChatHandlerCommandAbout
      );
      checkRegexTestElements<RegexMoonpieChatHandlerCommandLeaderboard>(
        testSetMoonpieAbout.map((a) => ({
          ...a,
          expected: a.expected === undefined ? {} : a.expected,
          input: a.input.replace(/about/g, "leaderboard"),
        })),
        regexMoonpieChatHandlerCommandLeaderboard
      );
      checkRegexTestElements(
        testSetMoonpieAbout.map((a) => ({
          ...a,
          input: a.input.replace(/about/g, "commands"),
        })),
        regexMoonpieChatHandlerCommandCommands
      );
    });
    it("!moonpie leaderboard $STARTING_RANK", () => {
      const testSetMoonpieLeaderboard: RegexTestElement<RegexMoonpieChatHandlerCommandLeaderboard>[] =
        [
          { expected: null, input: "!moonpie leaderboard42" },
          {
            expected: { startingRank: "12" },
            input: "!moonpie leaderboard 12",
          },
          {
            expected: { startingRank: "11" },
            input: "   !moonpie leaderboard  11  ",
          },
          {
            expected: { startingRank: "69" },
            input: "!moonpie leaderboard 69 message",
          },
          {
            expected: { startingRank: "42" },
            input: "!moonpie leaderboard 42 message after that",
          },
          { expected: {}, input: "!moonpie leaderboard 42message" },
        ];
      checkRegexTestElements<RegexMoonpieChatHandlerCommandLeaderboard>(
        testSetMoonpieLeaderboard,
        regexMoonpieChatHandlerCommandLeaderboard,
        (a) => (a === undefined ? [] : [a.startingRank])
      );
    });

    it("!moonpie delete/get $USER", () => {
      const testSetMoonpieUserDelete: RegexTestElement<RegexMoonpieChatHandlerCommandUserDelete>[] =
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
          { expected: { userName: "user" }, input: "!moonpie delete user" },
          {
            expected: { userName: "user" },
            input: "   !moonpie delete user  ",
          },
          {
            expected: { userName: "user" },
            input: "   !moonpie    delete user ",
          },
          {
            expected: { userName: "user" },
            input: "!moonpie delete user message",
          },
          {
            expected: { userName: "user" },
            input: "!moonpie delete user msg ab",
          },
          {
            expected: { userName: "userAbc" },
            input: "!moonpie delete userAbc",
          },
          { expected: { userName: "def" }, input: "!moonpie delete def" },
        ];
      checkRegexTestElements<RegexMoonpieChatHandlerCommandUserDelete>(
        testSetMoonpieUserDelete,
        regexMoonpieChatHandlerCommandUserDelete,
        (a) => (a === undefined ? [] : [a.userName])
      );
      checkRegexTestElements<RegexMoonpieChatHandlerCommandUserGet>(
        testSetMoonpieUserDelete.map((a) => ({
          ...a,
          input: a.input.replace(/delete/g, "get"),
        })),
        regexMoonpieChatHandlerCommandUserGet,
        (a) => (a === undefined ? [] : [a.userName])
      );
    });

    it("!moonpie add/remove/set $USER $COUNT", () => {
      const testSetMoonpieUserSet: RegexTestElement<RegexMoonpieChatHandlerCommandUserSet>[] =
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
            expected: { moonpieCountSet: "100", userName: "user" },
            input: "!moonpie set user 100",
          },
          {
            expected: { moonpieCountSet: "100", userName: "user" },
            input: "   !moonpie set user 100   ",
          },
          {
            expected: { moonpieCountSet: "100", userName: "user" },
            input: "   !moonpie    set    user   100   ",
          },
          {
            expected: { moonpieCountSet: "100", userName: "user" },
            input: "!moonpie set user 100 message",
          },
          {
            expected: { moonpieCountSet: "100", userName: "user" },
            input: "!moonpie set user 100 message after that",
          },
          {
            expected: { moonpieCountSet: "100", userName: "user" },
            input: "!moonpie set user 100 200",
          },
          {
            expected: { moonpieCountSet: "42", userName: "user" },
            input: "!moonpie set user 42",
          },
        ];
      checkRegexTestElements<RegexMoonpieChatHandlerCommandUserSet>(
        testSetMoonpieUserSet,
        regexMoonpieChatHandlerCommandUserSet,
        (a) => (a === undefined ? [] : [a.userName, `${a.moonpieCountSet}`])
      );
      checkRegexTestElements<RegexMoonpieChatHandlerCommandUserAdd>(
        testSetMoonpieUserSet.map((a) => ({
          ...a,
          expected:
            a.expected == null
              ? a.expected
              : {
                  moonpieCountAdd: a.expected.moonpieCountSet,
                  userName: a.expected.userName,
                },
          input: a.input.replace(/set/g, "add"),
        })),
        regexMoonpieChatHandlerCommandUserAdd,
        (a) => (a === undefined ? [] : [a.userName, `${a.moonpieCountAdd}`])
      );
      checkRegexTestElements<RegexMoonpieChatHandlerCommandUserRemove>(
        testSetMoonpieUserSet.map((a) => ({
          ...a,
          expected:
            a.expected == null
              ? a.expected
              : {
                  moonpieCountRemove: a.expected.moonpieCountSet,
                  userName: a.expected.userName,
                },
          input: a.input.replace(/set/g, "remove"),
        })),
        regexMoonpieChatHandlerCommandUserRemove,
        (a) => (a === undefined ? [] : [a.userName, `${a.moonpieCountRemove}`])
      );
    });
  });

  context("osu! internal", () => {
    it("osu window title (!np)", () => {
      const testSetOsuWindowTitle: RegexTestElement<RegexOsuWindowTitleNowPlaying>[] =
        [
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
      checkRegexTestElements<RegexOsuWindowTitleNowPlaying>(
        testSetOsuWindowTitle,
        regexOsuWindowTitleNowPlaying,
        (a) => (a === undefined ? [] : [a.artist, a.title, a.version])
      );
    });
  });

  context("osu! commands", () => {
    it("!np/!commands/!osuRequests", () => {
      const testSetOsuNp: RegexTestElement[] = [
        { expected: null, input: "!n" },
        { expected: null, input: "!npmessage" },
        { expected: null, input: "a!np" },
        { expected: null, input: "a !np" },
        { expected: null, input: "message before !np" },
        { expected: undefined, input: "!np" },
        { expected: undefined, input: "  !np  " },
        { expected: undefined, input: "  !np message" },
        { expected: undefined, input: "  !np message after that" },
      ];
      checkRegexTestElements(testSetOsuNp, regexOsuChatHandlerCommandNp);
      checkRegexTestElements(
        testSetOsuNp.map((a) => ({
          ...a,
          input: a.input.replace(/np/g, "osu commands"),
        })),
        regexOsuChatHandlerCommandCommands
      );
      checkRegexTestElements(
        testSetOsuNp.map((a) => ({
          ...a,
          expected: a.expected === undefined ? {} : a.expected,
          input: a.input.replace(/np/g, "osuRequests"),
        })),
        regexOsuChatHandlerCommandRequests
      );
    });

    it("!osuRequest on/off custom message", () => {
      const testSetOsuPp: RegexTestElement<RegexOsuChatHandlerCommandRequests>[] =
        [
          { expected: null, input: "!osuRrequests a" },
          { expected: {}, input: "!osuRequests a" },
          { expected: {}, input: "!osuRequests onnn" },
          { expected: {}, input: "!osuRequests ofmessage" },
          { expected: {}, input: "!osuRequests offf message" },
          { expected: { requestsOn: "on" }, input: "!osuRequests on" },
          { expected: { requestsOff: "off" }, input: "!osuRequests off" },
          {
            expected: { requestsOff: "off", requestsOffMessage: "custom" },
            input: "!osuRequests off custom",
          },
          {
            expected: {
              requestsOff: "off",
              requestsOffMessage: "custom message",
            },
            input: "!osuRequests off custom message  ",
          },
        ];
      checkRegexTestElements<RegexOsuChatHandlerCommandRequests>(
        testSetOsuPp,
        regexOsuChatHandlerCommandRequests,
        (a) =>
          a === undefined
            ? []
            : [a.requestsOn, a.requestsOff, a.requestsOffMessage]
      );
    });

    it("!pp/!rp $USER_NAME/$USER_ID", () => {
      const testSetOsuPp: RegexTestElement<RegexOsuChatHandlerCommandPp>[] = [
        { expected: null, input: "!ppOoi" },
        { expected: null, input: "!pp9096716" },
        { expected: null, input: "!p" },
        { expected: null, input: "!ppmessage" },
        { expected: null, input: "a!pp" },
        { expected: null, input: "a !pp" },
        { expected: null, input: "message before !pp" },
        { expected: {}, input: "!pp" },
        { expected: {}, input: "  !pp  " },
        { expected: { osuUserName: "Ooi" }, input: "!pp Ooi" },
        { expected: { osuUserName: "Ooi" }, input: "  !pp Ooi  " },
        { expected: { osuUserName: "Ooi" }, input: "  !pp   Ooi  " },
        { expected: { osuUserName: "Ooi" }, input: "!pp Ooi message" },
        {
          expected: { osuUserName: "Ooi" },
          input: "!pp Ooi message after that",
        },
        { expected: { osuUserId: "9096716" }, input: "!pp 9096716" },
        { expected: { osuUserId: "9096716" }, input: "  !pp 9096716  " },
        { expected: { osuUserId: "9096716" }, input: "  !pp   9096716  " },
        { expected: { osuUserId: "9096716" }, input: "!pp 9096716 message" },
        {
          expected: { osuUserId: "9096716" },
          input: "!pp 9096716 message after that",
        },
      ];
      checkRegexTestElements<RegexOsuChatHandlerCommandPp>(
        testSetOsuPp,
        regexOsuChatHandlerCommandPp,
        (a) => (a === undefined ? [] : [a.osuUserId, a.osuUserName])
      );
      checkRegexTestElements<RegexOsuChatHandlerCommandRp>(
        testSetOsuPp.map((a) => ({
          ...a,
          input: a.input.replace(/pp/g, "rp"),
        })),
        regexOsuChatHandlerCommandRp,
        (a) => (a === undefined ? [] : [a.osuUserId, a.osuUserName])
      );
    });

    it("beatmap detection", () => {
      const testSetOsuBeatmapUrl: RegexTestElement<RegexOsuBeatmapIdFromUrl>[] =
        [
          {
            expected: null,
            input: "https://osu.ppy.sh/beatmps/2587891",
          },
          {
            expected: null,
            input: "https://osi.ppy.sh/beatmaps/2587891",
          },
          {
            expected: null,
            input: "https://osi.ppy.sh/ba/2587891",
          },
          {
            expected: { beatmapIdBeatmapsets: "2554945" },
            input: "https://osu.ppy.sh/beatmapsets/1228734#osu/2554945",
          },
          {
            expected: { beatmapIdB: "2587891" },
            input: "  https://osu.ppy.sh/b/2587891",
          },
          {
            expected: { beatmapIdBeatmapsets: "2554945" },
            input: "https://osu.ppy.sh/beatmapsets/1228734#osu/2554945",
          },
          {
            expected: { beatmapIdBeatmapsets: "2554945" },
            input: "  https://osu.ppy.sh/beatmapsets/1228734#osu/2554945",
          },
          {
            expected: { beatmapIdBeatmaps: "2587891" },
            input: "  https://osu.ppy.sh/beatmaps/2587891  ",
          },
          {
            expected: { beatmapIdBeatmapsets: "2554945" },
            input: "  https://osu.ppy.sh/beatmapsets/1228734#osu/2554945  ",
          },
          {
            expected: { beatmapIdBeatmaps: "2587891" },
            input: "before https://osu.ppy.sh/beatmaps/2587891",
          },
          {
            expected: { beatmapIdBeatmapsets: "2554945" },
            input: "before https://osu.ppy.sh/beatmapsets/1228734#osu/2554945",
          },
          {
            expected: { beatmapIdB: "2554945", comment: "after" },
            input: "  https://osu.ppy.sh/b/2554945  after",
          },
          {
            expected: { beatmapIdBeatmaps: "2587891", comment: "after" },
            input: "before https://osu.ppy.sh/beatmaps/2587891 after",
          },
          {
            expected: { beatmapIdBeatmapsets: "2554945", comment: "after" },
            input:
              "before https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 after",
          },
          {
            expected: { beatmapIdB: "2554985", comment: "message after" },
            input: "  https://osu.ppy.sh/b/2554985   message after  ",
          },
          {
            expected: {
              beatmapIdBeatmaps: "2587891",
              comment: "message after",
            },
            input: "before https://osu.ppy.sh/beatmaps/2587891   message after",
          },
          {
            expected: {
              beatmapIdBeatmapsets: "2554945",
              comment: "message after",
            },
            input:
              "before https://osu.ppy.sh/beatmapsets/1228734#osu/2554945   message after",
          },
        ];
      checkRegexTestElements(
        testSetOsuBeatmapUrl,
        regexOsuBeatmapIdFromUrl,
        (a) =>
          a === undefined
            ? []
            : [
                a.beatmapIdB,
                a.beatmapIdBeatmaps,
                a.beatmapIdBeatmapsets,
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
          "https://osu.ppy.sh/beatmaps/2587891 https://osu.ppy.sh/b/2587891 $COMMENT https://osu.ppy.sh/beatmapsets/1228734#osu/2554945 $OPTIONAL_TEXT_WITH_SPACES https://osu.ppy.sh/beatmaps/2587892 https://osu.ppy.sh/beatmaps/2587893 $OPTIONAL TEXT WITH SPACES"
        )
      ).to.be.deep.equal([
        "https://osu.ppy.sh/beatmaps/2587891 ",
        "https://osu.ppy.sh/b/2587891 $COMMENT ",
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
        { expected: undefined, input: "!song" },
        { expected: undefined, input: "  !song  " },
        { expected: undefined, input: "  !song message" },
        { expected: undefined, input: "  !song message after that" },
      ];
      checkRegexTestElements(
        testSetSpotifySong,
        regexSpotifyChatHandlerCommandSong
      );
      checkRegexTestElements(
        testSetSpotifySong.map((a) => ({
          ...a,
          input: a.input.replace(/song/g, "spotify commands"),
        })),
        regexSpotifyChatHandlerCommandCommands
      );
    });
  });
});
