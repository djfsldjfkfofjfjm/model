import { useMemo } from 'react';
import { formatCurrency, formatPercent, formatNumber } from '../constants/FormatOptions';

/**
 * Хук для форматирования значений
 * @returns Объект с функциями форматирования
 */
export const useFormatting = () => {
  const formatters = useMemo(() => ({
    /**
     * Форматирование валюты
     * @param value Значение для форматирования
     * @returns Отформатированная строка
     */
    currency: (value: any): string => formatCurrency(value),
    
    /**
     * Форматирование процентов
     * @param value Значение для форматирования (0-100)
     * @returns Отформатированная строка
     */
    percent: (value: any): string => formatPercent(value),
    
    /**
     * Форматирование чисел
     * @param value Значение для форматирования
     * @returns Отформатированная строка
     */
    number: (value: any): string => formatNumber(value)
  }), []);
  
  return formatters;
};