export const genericStringSorter = (stringA?: string, stringB?: string) => {
  if (stringA === undefined || stringB === undefined) {
    return 0;
  }
  return stringA < stringB ? -1 : stringA > stringB ? 1 : 0;
};
