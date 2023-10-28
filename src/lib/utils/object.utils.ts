const enumToArray = <T extends string>(obj: Record<T, unknown>): T[] => {
  return Object.keys(obj).map((key) => key as T);
};

const arrayToSelectItems = <T extends string>(arr: T[]) => {
  return arr.map((item) => ({ label: item, value: item }));
};

export const ObjectUtils = {
  enumToArray,
  arrayToSelectItems,
};
