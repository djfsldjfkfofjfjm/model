import React from 'react';

/**
 * Интерфейс свойств компонента EditableCell
 */
export interface EditableCellProps {
  /** Значение ячейки */
  value: number;
  /** Функция обработки изменения значения */
  onChange: (value: number) => void;
  /** Минимальное допустимое значение */
  min?: number;
  /** Максимальное допустимое значение */
  max?: number;
  /** Шаг изменения значения */
  step?: number;
  /** Дополнительные CSS классы */
  className?: string;
  /** data-testid для input элемента */
  'data-testid'?: string;
  /** Заблокировать редактирование */
  disabled?: boolean;
  /** Префикс (например, $) */
  prefix?: string;
  /** Суффикс (например, %) */
  suffix?: string;
}

/**
 * Компонент редактируемой ячейки с валидацией для числовых значений
 */
const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  onChange, 
  min = 0,
  max = Infinity,
  step = 1,
  className = "",
  'data-testid': dataTestId,
  disabled = false,
  prefix = "",
  suffix = ""
}) => {
  // Обработчик изменения ввода
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const maxProp = Number.isFinite(max) ? max : undefined;
  
  if (prefix || suffix) {
    return (
      <div className="flex items-center gap-1">
        {prefix && <span className="text-gray-600">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={maxProp}
          step={step}
          disabled={disabled}
          className={`w-full rounded-md border border-gray-300 p-2 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''} ${className}`}
          data-testid={dataTestId}
        />
        {suffix && <span className="text-gray-600">{suffix}</span>}
      </div>
    );
  }
  
  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={maxProp}
      step={step}
      disabled={disabled}
      className={`w-full rounded-md border border-gray-300 p-2 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''} ${className}`}
      data-testid={dataTestId}
    />
  );
};

export default EditableCell;
