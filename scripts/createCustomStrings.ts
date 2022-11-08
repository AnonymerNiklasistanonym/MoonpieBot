/* eslint-disable no-console */

// Local imports
import { createMessageParserMessage } from "../src/messageParser";
import { ENV_PREFIX_CUSTOM_STRINGS } from "../src/info/env";
import { escapeStringIfWhiteSpace } from "../src/other/whiteSpaceChecker";
// Type imports
import type { StringEntry } from "../src/messageParser";

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
    }=${escapeStringIfWhiteSpace(stringEntryToPrint.default)}`
  );
}
