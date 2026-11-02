import { describe, expect, it } from 'vitest';
import { formatPersonDate } from './pageHelpers';

describe('person profile dates', () => {
  it('formats dates as year, abbreviated month and day', () => {
    expect(formatPersonDate('1974-01-30')).toBe('1974 Jan 30');
  });

  it('keeps the original calendar day and removes leading zeroes', () => {
    expect(formatPersonDate('2000-01-01')).toBe('2000 Jan 1');
    expect(formatPersonDate('2024-02-29')).toBe('2024 Feb 29');
  });
});
