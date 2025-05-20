/**
 * Опции форматирования для различных типов данных
 */

/**
 * Опции форматирования валюты
 */
export const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
};

/**
 * Опции форматирования процентов
 */
export const PERCENT_FORMAT_OPTIONS = {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
};

/**
 * Опции форматирования чисел
 */
export const NUMBER_FORMAT_OPTIONS = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
};

/**
 * Функция форматирования валюты
 */
export const formatCurrency = (value: any): string => {
  if (typeof value !== 'number') return '$0';
  return new Intl.NumberFormat('ru-RU', CURRENCY_FORMAT_OPTIONS).format(value);
};

/**
 * Функция форматирования процентов
 */
export const formatPercent = (value: any): string => {
  if (typeof value !== 'number') return '0%';
  return new Intl.NumberFormat('ru-RU', PERCENT_FORMAT_OPTIONS).format(value / 100);
};

/**
 * Функция форматирования чисел
 */
export const formatNumber = (value: any): string => {
  if (typeof value !== 'number') return '0';
  return new Intl.NumberFormat('ru-RU', NUMBER_FORMAT_OPTIONS).format(value);
};