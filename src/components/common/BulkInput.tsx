import React, { useState } from 'react';

/**
 * Сворачиваемый ввод значений для массового изменения массивов
 */
export interface BulkInputProps {
  /** Сколько чисел ожидается */
  count: number;
  /** Функция, принимающая итоговый массив */
  onApply: (values: number[]) => void;
  /** Текст кнопки */
  title?: string;
}

/**
 * Компонент поля для быстрого ввода нескольких чисел сразу
 */
const BulkInput: React.FC<BulkInputProps> = ({ count, onApply, title = 'Массовый ввод' }) => {
  const [opened, setOpened] = useState(false);
  const [text, setText] = useState('');

  // Разбираем введённый текст на числа
  const parseNumbers = (input: string): number[] => {
    return input
      .trim()
      .split(/[\s,;]+/)
      .map((v) => parseFloat(v.replace(',', '.')))
      .filter((v) => !isNaN(v));
  };

  const handleApply = () => {
    const numbers = parseNumbers(text);
    if (numbers.length !== count) {
      alert(`Нужно ввести ${count} чисел`);
      return;
    }
    onApply(numbers);
    setText('');
    setOpened(false);
  };

  return (
    <div className="mb-2">
      <button
        type="button"
        className="text-xs text-indigo-600 underline"
        onClick={() => setOpened(!opened)}
      >
        {title}
      </button>
      {opened && (
        <div className="mt-1">
          <textarea
            className="w-full border rounded-md p-2 text-sm mb-1"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="button"
            className="px-2 py-1 bg-indigo-600 text-white text-xs rounded"
            onClick={handleApply}
          >
            Применить
          </button>
        </div>
      )}
    </div>
  );
};

export default BulkInput;
