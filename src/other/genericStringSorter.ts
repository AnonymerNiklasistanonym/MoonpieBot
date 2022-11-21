export type ComparatorValues = -1 | 0 | 1;

export const genericStringSorter = (
  stringA?: string,
  stringB?: string
): ComparatorValues => {
  if (stringA === undefined || stringB === undefined) {
    return 0;
  }
  return stringA < stringB ? -1 : stringA > stringB ? 1 : 0;
};

export const genericFilterNonUniqueStrings = (
  value: string,
  index: number,
  self: string[]
): boolean => index === self.indexOf(value);
