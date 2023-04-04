/* eslint-disable no-magic-numbers */

// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Relative imports
import {
  fileDocumentationGenerator,
  FileDocumentationPartType,
} from "../../../src/documentation/fileDocumentationGenerator.mjs";
// Type imports
import type { Suite } from "mocha";

export default (): Suite => {
  return describe("fileDocumentationGenerator", () => {
    it("text", () => {
      expect(
        fileDocumentationGenerator(
          [
            {
              text: "Single line",
              type: FileDocumentationPartType.TEXT,
            },
          ],
          20,
        ),
      ).to.be.equal("# Single line\n");
      expect(
        fileDocumentationGenerator(
          [
            {
              text: "Multiple lines of text",
              type: FileDocumentationPartType.TEXT,
            },
          ],
          20,
        ),
      ).to.be.equal("# Multiple lines of\n# text\n");
      expect(
        fileDocumentationGenerator(
          [
            {
              prefix: ">",
              text: ["Single line"],
              type: FileDocumentationPartType.TEXT,
            },
          ],
          20,
        ),
      ).to.be.equal("# > Single line\n");
      expect(
        fileDocumentationGenerator(
          [
            {
              prefix: ">",
              text: ["Multiple lines of text but don't split"],
              type: FileDocumentationPartType.TEXT,
            },
          ],
          20,
        ),
      ).to.be.equal("# > Multiple lines of text but don't split\n");
      expect(
        fileDocumentationGenerator(
          [
            {
              prefix: ">",
              text: ["Multiple lines of text but don't split", "split this"],
              type: FileDocumentationPartType.TEXT,
            },
          ],
          20,
        ),
      ).to.be.equal(
        "# > Multiple lines of text but don't split\n#   split this\n",
      );
    });
    it("value", () => {
      expect(
        fileDocumentationGenerator(
          [
            {
              type: FileDocumentationPartType.VALUE,
              value: "a",
            },
          ],
          20,
        ),
      ).to.be.equal("a\n");
      expect(
        fileDocumentationGenerator(
          [
            {
              isComment: true,
              type: FileDocumentationPartType.VALUE,
              value: "a",
            },
          ],
          20,
        ),
      ).to.be.equal("#a\n");
    });
    expect(
      fileDocumentationGenerator(
        [
          {
            isComment: true,
            title: "Title",
            type: FileDocumentationPartType.VALUE,
            value: "a",
          },
        ],
        20,
      ),
    ).to.be.equal("# Title\n#a\n");
    expect(
      fileDocumentationGenerator(
        [
          {
            title: "Title with multiple lines",
            type: FileDocumentationPartType.VALUE,
            value: "a",
          },
        ],
        20,
      ),
    ).to.be.equal("# Title with\n# multiple lines\na\n");
    expect(
      fileDocumentationGenerator(
        [
          {
            description: {
              prefix: ">",
              text: "Description with multiple lines",
            },
            title: "Title",
            type: FileDocumentationPartType.VALUE,
            value: "a",
          },
        ],
        20,
      ),
    ).to.be.equal("# Title\n# > Description with\n#   multiple lines\na\n");
    expect(
      fileDocumentationGenerator(
        [
          {
            description: {
              infos: ["Info", "Info with multiple lines"],
              prefix: ">",
              text: "D",
            },
            title: "T",
            type: FileDocumentationPartType.VALUE,
            value: "a",
          },
        ],
        20,
      ),
    ).to.be.equal(
      "# T\n# > D\n#   Info\n#   Info with\n#   multiple lines\na\n",
    );
    expect(
      fileDocumentationGenerator(
        [
          {
            description: {
              lists: [["List", ["a", "b", "multiple lines list entry"]]],
              prefix: ">",
              text: "D",
            },
            title: "T",
            type: FileDocumentationPartType.VALUE,
            value: "a",
          },
        ],
        20,
      ),
    ).to.be.equal(
      "# T\n# > D\n#   List:\n#   - a\n#   - b\n#   - multiple lines\n#     list entry\na\n",
    );
  });
};
