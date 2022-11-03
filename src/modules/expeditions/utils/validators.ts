/**
 * Validates if date, in yyyy-mm-dd format, is a valid date.
 *
 * @source https://bobbyhadz.com/blog/javascript-validate-date-yyyy-mm-dd
 * @param dateStr - The date string to validate.
 * @returns True if the date is valid, false otherwise.
 */
export function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateStr) {
    return false;
  }

  if (dateStr.match(regex) === null) {
    return false;
  }

  const date = new Date(dateStr);

  const timestamp = date.getTime();

  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false;
  }

  return date.toISOString().startsWith(dateStr);
}
