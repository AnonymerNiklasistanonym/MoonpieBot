// Package imports
import { deepCopy } from "deep-copy-ts";
// Type imports
import type { DeepReadonly, DeepReadonlyArray } from "./types.mjs";

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

const filterEmptyElements = (
  elements: ReadonlyArray<SimpleRegexElements>
): SimpleRegexElements[] =>
  elements.filter((a) => {
    if ((a.type === "text" || a.type === "group") && a.content.length === 0) {
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
      if (currentElement.type === "text") {
        // Optional character was found
        const optionalCharacter = currentElement.content.substring(
          currentElement.content.length - 1,
          currentElement.content.length
        );
        currentElement.content = currentElement.content.slice(
          0,
          currentElement.content.length - 1
        );
        elements.push(currentElement);
        currentElement = {
          content: optionalCharacter,
          type: "text",
        };
      }
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

const splitArrayAtElement = <TYPE extends unknown>(
  elements: DeepReadonlyArray<TYPE>,
  splitAt: (element: DeepReadonly<TYPE>) => boolean
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
      currentArray.push(deepCopy(a) as TYPE);
    }
  }
  if (currentArray.length > 0) {
    arrays.push(currentArray);
    currentArray = [];
  }
  return arrays;
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
  return result.elements
    .map((a) => convertToString(a, regexConvertOptionsHuman))
    .join("")
    .trim();
};
export const convertRegexToHumanStringDetailed = (
  regex: DeepReadonly<RegExp>
): string => {
  const result = convertRegexToHumanReadableStringHelper(regex.source, false);
  return result.elements
    .map((a) => convertToString(a, regexConvertOptionsHumanDetailed))
    .join("")
    .trim();
};

interface RegexConvertToStringOptions {
  renderEmptyGroupCases?: boolean;
  renderEndSymbol?: boolean;
  renderGroupsHumanReadable?: boolean;
  renderMatchBracketSymbol?: boolean;
  renderNonWhitespaceSymbol?: boolean;
  renderOnlyGroupName?: boolean;
  renderStartSymbol?: boolean;
  renderTextHumanReadable?: boolean;
  renderWhitespaceSymbol?: boolean;
}

const regexConvertOptionsHumanDetailed: Readonly<RegexConvertToStringOptions> =
  {
    renderEmptyGroupCases: false,
    renderEndSymbol: false,
    renderGroupsHumanReadable: true,
    renderMatchBracketSymbol: false,
    renderNonWhitespaceSymbol: false,
    renderStartSymbol: false,
    renderTextHumanReadable: true,
    renderWhitespaceSymbol: false,
  };
const regexConvertOptionsHuman: Readonly<RegexConvertToStringOptions> = {
  ...regexConvertOptionsHumanDetailed,
  renderOnlyGroupName: true,
};

const convertToString = (
  element: DeepReadonly<SimpleRegexElements>,
  options: DeepReadonly<RegexConvertToStringOptions> = {}
): string => {
  switch (element.type) {
    case "end":
      return options.renderEndSymbol !== false ? "$" : "";
    case "start":
      return options.renderStartSymbol !== false ? "^" : "";
    case "group_separator":
      return "|";
    case "whitespace":
      // eslint-disable-next-line no-case-declarations
      let outputWhitespace =
        options.renderWhitespaceSymbol !== false ? "\\s" : " ";
      if (options.renderWhitespaceSymbol !== false && element.modifier) {
        outputWhitespace += element.modifier;
      } else if (element.modifier === "*") {
        outputWhitespace = "";
      }
      if (element.optional === true) {
        outputWhitespace += "?";
      }
      return outputWhitespace;
    case "text":
      if (element.optional === true) {
        if (options.renderTextHumanReadable) {
          return `[${element.content}]`;
        }
        return element.content + "?";
      }
      return element.content;
    case "non_whitespace":
      // eslint-disable-next-line no-case-declarations
      let outputNonWhitespace =
        options.renderNonWhitespaceSymbol !== false ? "\\S" : "CHARACTER";
      if (options.renderWhitespaceSymbol !== false && element.modifier) {
        outputNonWhitespace += element.modifier;
      } else if (element.modifier === "*") {
        outputNonWhitespace = "OPTIONAL_TEXT";
      } else if (element.modifier === "+") {
        outputNonWhitespace = "TEXT";
      }
      if (element.optional === true) {
        outputNonWhitespace += "?";
      }
      return outputNonWhitespace;
    case "match_bracket":
      // eslint-disable-next-line no-case-declarations
      let outputMatchBracket = `[${element.content}]`;
      if (options.renderMatchBracketSymbol === false) {
        if (element.content === "^'") {
          if (element.modifier === "*") {
            outputMatchBracket = "OPTIONAL_TEXT";
          } else if (element.modifier === "+") {
            outputMatchBracket = "TEXT";
          }
        }
        if (element.content === "0-9") {
          if (element.modifier === "*") {
            outputMatchBracket = "OPTIONAL_NUMBERS";
          } else if (element.modifier === "+") {
            outputMatchBracket = "NUMBERS";
          } else {
            outputMatchBracket = "NUMBER";
          }
        }
      }
      if (options.renderMatchBracketSymbol !== false && element.modifier) {
        outputMatchBracket += element.modifier;
      }
      if (options.renderMatchBracketSymbol !== false && element.optional) {
        outputMatchBracket += "?";
      }
      return outputMatchBracket;
    case "group":
      if (options.renderEmptyGroupCases !== false) {
        return `(${element.notCaptured ? "?:" : ""}${
          element.name ? `?<${element.name}>` : ""
        }${element.content.map((a) => convertToString(a, options)).join("")}${
          element.modifier ? element.modifier : ""
        }${element.optional ? "?" : ""})`;
      }
      // eslint-disable-next-line no-case-declarations
      const groupElements = splitArrayAtElement(
        element.content,
        (a) => a.type === "group_separator"
      );
      // eslint-disable-next-line no-case-declarations
      const groupElementsFiltered = groupElements
        .map((a) => a.map((b) => convertToString(b, options)).join(""))
        .filter((c) => c.trim().length > 0);
      // eslint-disable-next-line no-case-declarations
      let customOptional = false;
      if (groupElementsFiltered.length !== groupElements.length) {
        customOptional = true;
      }
      if (groupElementsFiltered.length === 0) {
        return "";
      }
      // eslint-disable-next-line no-case-declarations
      const groupContent = groupElementsFiltered.join("/");
      // eslint-disable-next-line no-case-declarations
      let finalContent = groupContent;
      if (groupElementsFiltered.length !== 1) {
        finalContent = `(${finalContent})`;
      }
      if (element.name) {
        finalContent = `${element.name}:=${finalContent}`;
      }
      if (groupContent === element.name) {
        finalContent = element.name;
      }
      if (options.renderOnlyGroupName === true && element.name) {
        finalContent = element.name;
      }
      if (element.optional || customOptional) {
        finalContent = `[${finalContent}]`;
      }
      return finalContent;
  }
};

/**
 * Escape string for a RegEx expression.
 *
 * @param str String that should be escaped.
 * @returns Escaped string.
 */
export const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
