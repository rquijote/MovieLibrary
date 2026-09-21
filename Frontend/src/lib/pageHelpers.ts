/**
 * Returns a safe tab value from a query parameter.
 * @param tabParam Raw tab value from URL search params (for example, searchParams.get('tab')).
 * @param validTabs Allowed tab values for the current page.
 * @param defaultTab Fallback tab when tabParam is missing or invalid.
 * @returns A valid tab from validTabs.
 */
export function getValidTab<TTab extends string>(
  tabParam: string | null,
  validTabs: readonly TTab[],
  defaultTab: TTab,
): TTab {
  if (tabParam && validTabs.includes(tabParam as TTab)) { // If tabParam is valid, use tabParam
    return tabParam as TTab;
  }

  return defaultTab;
}

/**
 * Formats a Date for API query strings as YYYY-MM-DD.
 * @param date Date to format.
 * @returns Date string in YYYY-MM-DD format.
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Builds a date range from a start date through one month later.
 * @param fromDate Start date for the range. Defaults to today.
 * @returns An object containing startDate and endDate.
 */
export function getNextMonthDateRange(fromDate = new Date()): { startDate: Date; endDate: Date } {
  const startDate = new Date(fromDate);
  const endDate = new Date(fromDate);
  endDate.setMonth(endDate.getMonth() + 1);

  return { startDate, endDate };
}
