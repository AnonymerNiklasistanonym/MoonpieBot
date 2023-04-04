/* eslint-disable no-console */

// Relative imports
import { createMessageParserMessage } from "../src/messageParser.mjs";
import { ENV_PREFIX_CUSTOM_STRINGS } from "../src/info/env.mjs";
import { escapeStringIfWhiteSpace } from "../src/other/whiteSpaceChecker.mjs";
// Type imports
import type { StringEntry } from "../src/messageParser.mjs";

const stringEntriesToPrint: StringEntry[] = [
  {
    default: createMessageParserMessage(["Currently playing no song"], true),
    description: "An optional description",
    id: "CUSTOM_ID",
  },
];

// -----------------------------------------------------------------------------

console.log("Printing custom string entries...");

for (const stringEntryToPrint of stringEntriesToPrint) {
  console.log(`> ID: ${stringEntryToPrint.id}`);
  if (stringEntryToPrint.description) {
    console.log(`      ${stringEntryToPrint.description}`);
  }
  console.log(
    `${ENV_PREFIX_CUSTOM_STRINGS}${
      stringEntryToPrint.id
    }=${escapeStringIfWhiteSpace(stringEntryToPrint.default, {
      escapeCharacters: [["'", "\\'"]],
      surroundCharacter: "'",
    })}`,
  );
}
