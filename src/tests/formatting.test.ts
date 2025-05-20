/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useFormatting } from '../hooks/useFormatting';
import { formatCurrency, formatPercent, formatNumber } from '../constants/FormatOptions';


describe('Formatting utilities', () => {
  test('formatCurrency formats numbers to currency', () => {
    expect(formatCurrency(1234)).toBe('$1,234');
    expect(formatCurrency('not number' as any)).toBe('$0');
  });

  test('formatPercent formats numbers to percent', () => {
    expect(formatPercent(25)).toBe('25.0%');
    expect(formatPercent('bad' as any)).toBe('0%');
  });

  test('formatNumber formats numbers', () => {
    expect(formatNumber(10000)).toBe('10,000');
    expect(formatNumber(undefined as any)).toBe('0');
  });

  test('useFormatting hook returns same functions', () => {
    const { result } = renderHook(() => useFormatting());
    expect(result.current.currency(500)).toBe(formatCurrency(500));
    expect(result.current.percent(5)).toBe(formatPercent(5));
    expect(result.current.number(10)).toBe(formatNumber(10));
  });
});
