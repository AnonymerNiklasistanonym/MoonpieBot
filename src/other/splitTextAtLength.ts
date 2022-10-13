const SPLIT_CHARACTER = " ";

/**
 * Split text input into an array of text that never exceeds the split length
 * while also not breaking words off.
 * If the text input is an array this means that the array elements should never
 * be split.
 *
 * @param textInput The text that should be split.
 * @param splitLength The length after which text should be split if possible.
 * @returns Array of text strings that never exceed the split length.
 */
export const splitTextAtLength = (
  textInput: string | string[],
  splitLength: number
): string[] =>
  (typeof textInput === "string"
    ? textInput.split(SPLIT_CHARACTER)
    : textInput
  ).reduce(
    (out, currentSplitPart) => {
      const outLast = out[out.length - 1];
      if (outLast.length === 0) {
        // If the current element is the empty string always append the word
        out[out.length - 1] += currentSplitPart;
      } else if (
        outLast.length + SPLIT_CHARACTER.length + currentSplitPart.length <=
        splitLength
      ) {
        // If appending the current word is smaller than the split length plus
        // one whitespace append the word and a whitespace
        out[out.length - 1] += `${SPLIT_CHARACTER}${currentSplitPart}`;
      } else {
        // Else create a new output element
        out.push(currentSplitPart);
      }
      return out;
    },
    [""]
  );
