import React from 'react';
import InfoTooltip from './InfoTooltip';

/**
 * Интерфейс свойств компонента MetricCard
 */
export interface MetricCardProps {
  /** Заголовок карточки */
  title: string;
  /** Значение метрики */
  value: number | string;
  /** Цвет значения метрики */
  color?: string;
  /** Иконка для отображения в правом верхнем углу */
  icon?: React.ReactNode;
  /** Тренд изменения метрики ('up' | 'down' | 'neutral') */
  trend?: 'up' | 'down' | 'neutral' | null;
  /** Дополнительное значение/подпись */
  subValue?: string | null;
  /** Увеличенный размер карточки (занимает две колонки) */
  large?: boolean;
  /** Текст подсказки при наведении */
  tooltip?: string | null;
  /** Функция форматирования числового значения */
  formatValue?: (value: number | string) => string;
  /** Дополнительные CSS классы */
  className?: string;
  /** data-testid для тестирования */
  'data-testid'?: string;
}

/**
 * Компонент карточки метрики для отображения статистических данных
 */
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  color = '#6366F1', 
  icon, 
  trend = null, 
  subValue = null, 
  large = false, 
  tooltip = null,
  formatValue,
  className = "",
  'data-testid': dataTestId // Принимаем data-testid из props
}) => {
  // Функция форматирования по умолчанию
  const defaultFormatCurrency = (value: number | string): string => {
    if (typeof value !== 'number') return String(value);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Используем предоставленную функцию форматирования или функцию по умолчанию
  const formatter = formatValue || defaultFormatCurrency;

  // Определяем цвет для отображения тренда
  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  // Определяем иконку для отображения тренда
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'down': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default: return null;
    }
  };
  
  return (
    <div 
      className={`bg-white rounded-2xl p-6 ${large ? 'col-span-2' : ''} 
        transition-all duration-300 hover:shadow-lg hover:translate-y-0.5 border border-gray-100 ${className}`}
      data-testid={dataTestId || "metric-card"} // Используем переданный testId или дефолтный
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          {title}
          {tooltip && <InfoTooltip text={tooltip} />}
        </h3>
        {icon && <div className="text-gray-400" data-testid="icon">{icon}</div>}
      </div>
      <p 
        className={`${large ? 'text-4xl' : 'text-3xl'} font-bold tracking-tight mb-1`} 
        style={{ color }}
        data-testid="value"
      >
        {typeof value === 'number' ? formatter(value) : value}
        {trend && (
          <span className={`ml-2 text-sm ${getTrendColor()}`} data-testid={`trend-icon-${trend}`}>
            {getTrendIcon()}
          </span>
        )}
      </p>
      {subValue && <p className="text-sm text-gray-500" data-testid="sub-value">{subValue}</p>}
    </div>
  );
};

export default MetricCard;
