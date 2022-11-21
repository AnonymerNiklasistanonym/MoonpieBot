// Type imports
import { DeepReadonly } from "./types";

interface SimpleRegexElement {
  modifier?: "+" | "*";
  optional?: boolean;
  type:
    | "whitespace"
    | "non_whitespace"
    | "start"
    | "end"
    | "group"
    | "text"
    | "group_separator"
    | "match_bracket";
}
interface SimpleRegexElementOther extends SimpleRegexElement {
  type: "whitespace" | "non_whitespace" | "start" | "end" | "group_separator";
}
interface SimpleRegexElementText extends SimpleRegexElement {
  content: string;
  type: "text";
}
interface SimpleRegexElementMatchBracket extends SimpleRegexElement {
  content: string;
  type: "match_bracket";
}
interface SimpleRegexElementGroup extends SimpleRegexElement {
  content: SimpleRegexElements[];
  name?: string;
  notCaptured?: boolean;
  type: "group";
}
type SimpleRegexElements =
  | SimpleRegexElementText
  | SimpleRegexElementOther
  | SimpleRegexElementGroup
  | SimpleRegexElementMatchBracket;

interface SimpleRegexElementsResult {
  elements: SimpleRegexElements[];
  i: number;
}

const filterEmptyElements = (elements: SimpleRegexElements[]) =>
  elements.filter((a) => {
    if (a.type === "text" && a.content.length === 0) {
      return false;
    }
    if (a.type === "group" && a.content.length === 0) {
      return false;
    }
    return true;
  });

const convertRegexToHumanReadableStringHelper = (
  regexString: string,
  earlyExit = false,
  depth = 0
): SimpleRegexElementsResult => {
  let i = 0;
  let escapeSymbol = false;
  const elements: SimpleRegexElements[] = [];
  let currentElement: SimpleRegexElements = { content: "", type: "text" };
  while (i < regexString.length) {
    if (!escapeSymbol && regexString.at(i) === "\\") {
      // Found escape symbol
      escapeSymbol = true;
      i += 1;
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === "+") {
      currentElement.modifier = "+";
      i += 1;
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === "*") {
      currentElement.modifier = "*";
      i += 1;
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === "?") {
      currentElement.optional = true;
      i += 1;
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === "(") {
      // Group was opened
      elements.push(currentElement);
      currentElement = { content: [], type: "group" };
      i += 1;
      if (regexString.substring(i).startsWith("?:")) {
        i += 2;
        currentElement.notCaptured = true;
      }
      if (regexString.substring(i).startsWith("?<")) {
        i += 2;
        const indexEndNamedGroup = regexString.substring(i).indexOf(">");
        currentElement.name = regexString
          .substring(i)
          .substring(0, indexEndNamedGroup);
        i += currentElement.name.length + 1;
      }
      const contentResult = convertRegexToHumanReadableStringHelper(
        regexString.substring(i),
        true,
        depth + 1
      );
      currentElement.content.push(...contentResult.elements);
      i += contentResult.i;
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === "[") {
      elements.push(currentElement);
      currentElement = { content: "", type: "match_bracket" };
      i += 1;
      const indexEndMatchBracket = regexString.substring(i).indexOf("]");
      currentElement.content = regexString
        .substring(i)
        .substring(0, indexEndMatchBracket);
      i += currentElement.content.length + 1;
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === ")") {
      elements.push(currentElement);
      // Group was closed
      i += 1;
      if (earlyExit) {
        return { elements: filterEmptyElements(elements), i };
      }
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === "^") {
      elements.push(currentElement);
      currentElement = { type: "start" };
      i += 1;
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === "$") {
      elements.push(currentElement);
      currentElement = { type: "end" };
      i += 1;
      continue;
    }
    if (!escapeSymbol && regexString.at(i) === "|") {
      elements.push(currentElement);
      currentElement = { type: "group_separator" };
      i += 1;
      continue;
    }
    if (escapeSymbol && regexString.at(i) === "s") {
      elements.push(currentElement);
      currentElement = { type: "whitespace" };
      i += 1;
      escapeSymbol = false;
      continue;
    }
    if (escapeSymbol && regexString.at(i) === "S") {
      elements.push(currentElement);
      currentElement = { type: "non_whitespace" };
      i += 1;
      escapeSymbol = false;
      continue;
    }
    if (currentElement.type !== "text") {
      elements.push(currentElement);
      currentElement = { content: regexString.charAt(i), type: "text" };
      i += 1;
      escapeSymbol = false;
      continue;
    }
    currentElement.content += regexString.charAt(i);
    i += 1;
    escapeSymbol = false;
    continue;
  }
  elements.push(currentElement);
  return { elements: filterEmptyElements(elements), i };
};

const splitArrayAtElement = <TYPE>(
  elements: TYPE[],
  splitAt: (element: TYPE) => boolean
): TYPE[][] => {
  const arrays: TYPE[][] = [];
  let currentArray: TYPE[] = [];
  for (const a of elements) {
    if (splitAt(a)) {
      if (currentArray.length > 0) {
        arrays.push(currentArray);
        currentArray = [];
      }
    } else {
      currentArray.push(a);
    }
  }
  if (currentArray.length > 0) {
    arrays.push(currentArray);
    currentArray = [];
  }
  return arrays;
};

const convertSimpleRegexElementToString = (
  element: SimpleRegexElements
): string => {
  switch (element.type) {
    case "end":
    case "start":
    case "non_whitespace":
      return "";
    case "whitespace":
      return " ";
    case "match_bracket":
      return "";
    case "group":
      if (element.name !== undefined) {
        return element.name;
      }
      // eslint-disable-next-line no-case-declarations
      const groupElements = splitArrayAtElement(
        element.content,
        (a) => a.type === "group_separator"
      );
      // eslint-disable-next-line no-case-declarations
      const groupElementsFiltered = groupElements
        .map((a) => a.map((b) => convertSimpleRegexElementToString(b)).join(""))
        .filter((c) => c.trim().length > 0);
      if (groupElementsFiltered.length !== groupElements.length) {
        element.optional = true;
      }
      if (groupElementsFiltered.length === 0) {
        return "";
      }
      // eslint-disable-next-line no-case-declarations
      const groupContent = groupElementsFiltered.join("|");
      if (element.optional) {
        return `[${groupContent}]`;
      }
      if (groupElementsFiltered.length === 1) {
        return groupContent;
      }
      return `(${groupContent})`;
    case "group_separator":
      throw Error("Group separators should never appear");
    case "text":
      return element.content;
  }
};

/**
 * This method converts a regex to a string.
 * It will remove all modifiers/flags.
 *
 * @param regex The regex that should be converted to a string.
 * @returns Regex as a string.
 */
export const convertRegexToString = (regex: DeepReadonly<RegExp>): string =>
  regex.source;

export const convertRegexToHumanString = (
  regex: DeepReadonly<RegExp>
): string => {
  const result = convertRegexToHumanReadableStringHelper(regex.source, false);
  return toHumanStringRegexGroups(result.elements);
};

const toHumanStringRegexGroups = (elements: SimpleRegexElements[]): string =>
  elements
    .map((a) => convertSimpleRegexElementToString(a))
    .join("")
    .replace(/\s\s+/g, " ")
    .trim();
