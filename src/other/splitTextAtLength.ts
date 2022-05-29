/**
 * Split text input into an array of text that never exceeds the split length
 * while also not breaking words off.
 *
 * @param textInput The text that should be split.
 * @param splitLength The maximum length of each text string in the output array.
 * @returns Array of text strings that never exceed the split length.
 */
export const splitTextAtLength = (textInput: string, splitLength: number) => {
  const allWords = textInput.split(" ");
  const out = [""];
  let first = true;
  for (const word of allWords) {
    if (out[out.length - 1].length + 1 + word.length > splitLength) {
      out.push(word);
    } else {
      out[out.length - 1] += `${first ? "" : " "}${word}`;
      first = false;
    }
  }
  return out;
};
