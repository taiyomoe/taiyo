import { DateTime } from "luxon";

const formatToInputValue = (input: Date) => {
  const dt = DateTime.fromJSDate(input);

  if (!dt.isValid) return "";

  return dt.toISODate();
};

export const DateUtils = {
  formatToInputValue,
};
