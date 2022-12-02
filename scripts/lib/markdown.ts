/** Describes how a Markdown comment looks like. */
const mdCommentInfo = Object.freeze({
  begin: "[//]: # (",
  end: ")",
});

/**
 * @param line The current markdown input string.
 * @returns The markdown comment string if a comment was found, otherwise undefined.
 */
export const getMdComment = (line: string): undefined | string =>
  line.startsWith(mdCommentInfo.begin) &&
  line.trimEnd().endsWith(mdCommentInfo.end)
    ? line.substring(
        mdCommentInfo.begin.length,
        line.trimEnd().length - mdCommentInfo.end.length
      )
    : undefined;
