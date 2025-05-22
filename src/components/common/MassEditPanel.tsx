import React, { useState, useRef } from 'react';
import { InfoTooltip } from './index';

/**
 * Интерфейс свойств компонента MassEditPanel
 */
export interface MassEditPanelProps {
  /** Количество значений в массиве */
  count: number;
  /** Функция для применения изменений */
  onApply: (values: number[]) => void;
  /** Текущие значения для предварительного просмотра */
  currentValues?: number[];
  /** Заголовок панели */
  title?: string;
  /** Подсказка */
  tooltip?: string;
  /** Дополнительные CSS классы */
  className?: string;
  /** Минимальное значение */
  min?: number;
  /** Максимальное значение */
  max?: number;
  /** Шаг изменения */
  step?: number;
}

/**
 * Улучшенный компонент для массового редактирования значений
 */
const MassEditPanel: React.FC<MassEditPanelProps> = ({
  count,
  onApply,
  currentValues = [],
  title = 'Массовое редактирование',
  tooltip,
  className = "",
  min = 0,
  max = 10000,
  step = 1
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'pattern' | 'preset'>('text');
  const [textInput, setTextInput] = useState('');
  const [patternStart, setPatternStart] = useState(0);
  const [patternStep, setPatternStep] = useState(0);
  const [patternType, setPatternType] = useState<'linear' | 'exponential'>('linear');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Предустановленные шаблоны
  const presets = [
    { name: 'Все нули', values: () => Array(count).fill(0) },
    { name: 'Все единицы', values: () => Array(count).fill(1) },
    { name: 'Линейный рост 1-12', values: () => Array.from({length: count}, (_, i) => i + 1) },
    { name: 'Удвоение каждый месяц', values: () => Array.from({length: count}, (_, i) => Math.pow(2, i)) },
    { name: 'Первые 3 месяца по 1, остальные по 2', values: () => Array.from({length: count}, (_, i) => i < 3 ? 1 : 2) },
    { name: 'Постепенный рост', values: () => Array.from({length: count}, (_, i) => Math.floor(i / 3) + 1) },
    { name: 'Пиковая нагрузка (середина года)', values: () => Array.from({length: count}, (_, i) => 
      i < 3 ? 1 : i < 6 ? 2 : i < 9 ? 3 : 2) },
  ];

  // Разбор текстового ввода
  const parseTextInput = (input: string): number[] => {
    const cleanInput = input.trim();
    
    // Проверяем, не JSON ли это
    if (cleanInput.startsWith('[') && cleanInput.endsWith(']')) {
      try {
        const parsed = JSON.parse(cleanInput);
        if (Array.isArray(parsed) && parsed.every(v => typeof v === 'number')) {
          return parsed;
        }
      } catch {}
    }
    
    // Обычный парсинг чисел
    return cleanInput
      .split(/[\s,;|\n\t]+/)
      .map(v => parseFloat(v.replace(',', '.')))
      .filter(v => !isNaN(v));
  };

  // Генерация по шаблону
  const generatePattern = (): number[] => {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      if (patternType === 'linear') {
        result.push(Math.max(min, Math.min(max, patternStart + i * patternStep)));
      } else {
        result.push(Math.max(min, Math.min(max, patternStart * Math.pow(1 + patternStep / 100, i))));
      }
    }
    return result;
  };

  // Применение изменений
  const handleApply = () => {
    let values: number[] = [];
    
    if (mode === 'text') {
      values = parseTextInput(textInput);
    } else if (mode === 'pattern') {
      values = generatePattern();
    }
    
    if (values.length !== count) {
      alert(`Необходимо ${count} значений. Получено: ${values.length}`);
      return;
    }
    
    // Валидация значений
    const validValues = values.map(v => Math.max(min, Math.min(max, v)));
    onApply(validValues);
    setIsOpen(false);
  };

  // Применение пресета
  const applyPreset = (preset: typeof presets[0]) => {
    const values = preset.values().slice(0, count);
    onApply(values);
    setIsOpen(false);
  };

  // Экспорт в JSON
  const exportValues = () => {
    const data = JSON.stringify(currentValues, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `values_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Импорт из файла
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const values = JSON.parse(content);
        if (Array.isArray(values) && values.length === count) {
          onApply(values);
          setIsOpen(false);
        } else {
          alert(`Файл должен содержать массив из ${count} чисел`);
        }
      } catch {
        alert('Ошибка чтения файла');
      }
    };
    reader.readAsText(file);
  };

  // Копирование текущих значений
  const copyCurrentValues = () => {
    const text = currentValues.join(', ');
    navigator.clipboard.writeText(text).then(() => {
      alert('Значения скопированы в буфер обмена');
    });
  };

  return (
    <div className={`bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-indigo-800 flex items-center">
          {title}
          {tooltip && <InfoTooltip text={tooltip} className="ml-1" />}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={exportValues}
            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
            title="Экспорт в файл"
          >
            📁 Экспорт
          </button>
          <button
            onClick={copyCurrentValues}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            title="Копировать значения"
          >
            📋 Копировать
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`text-xs px-3 py-1 rounded font-medium transition-all ${
              isOpen 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            {isOpen ? '🔽 Свернуть' : '🔧 Редактировать'}
          </button>
        </div>
      </div>

      {/* Превью текущих значений */}
      <div className="text-xs text-gray-600 mb-2">
        Текущие: [{currentValues.slice(0, 8).join(', ')}{currentValues.length > 8 ? '...' : ''}]
      </div>

      {isOpen && (
        <div className="space-y-4 bg-white rounded-lg p-4 border border-indigo-100">
          {/* Выбор режима */}
          <div className="flex space-x-2 border-b pb-3">
            <button
              onClick={() => setMode('preset')}
              className={`px-3 py-1 text-xs rounded font-medium ${
                mode === 'preset' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎯 Пресеты
            </button>
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1 text-xs rounded font-medium ${
                mode === 'text' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Текст
            </button>
            <button
              onClick={() => setMode('pattern')}
              className={`px-3 py-1 text-xs rounded font-medium ${
                mode === 'pattern' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Шаблон
            </button>
          </div>

          {/* Режим пресетов */}
          {mode === 'preset' && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Быстрые шаблоны:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="text-left text-xs p-2 bg-gray-50 hover:bg-indigo-50 border rounded transition-colors"
                  >
                    <div className="font-medium text-gray-800">{preset.name}</div>
                    <div className="text-gray-500">
                      [{preset.values().slice(0, 6).join(', ')}{preset.values().length > 6 ? '...' : ''}]
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Режим текстового ввода */}
          {mode === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Введите {count} чисел (разделители: пробел, запятая, точка с запятой)
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={3}
                  placeholder="Например: 1 2 3 4 5 6 7 8 9 10 11 12"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Поддерживается JSON формат: [1, 2, 3, ...] или простой список чисел
                </div>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".json,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                >
                  📂 Импорт из файла
                </button>
                <button
                  onClick={() => setTextInput(currentValues.join(', '))}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  📋 Вставить текущие
                </button>
              </div>
            </div>
          )}

          {/* Режим шаблона */}
          {mode === 'pattern' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Начальное значение</label>
                  <input
                    type="number"
                    value={patternStart}
                    onChange={(e) => setPatternStart(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    min={min}
                    max={max}
                    step={step}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {patternType === 'linear' ? 'Шаг' : 'Рост (%)'}
                  </label>
                  <input
                    type="number"
                    value={patternStep}
                    onChange={(e) => setPatternStep(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    step={patternType === 'linear' ? step : 0.1}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Тип прогрессии</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPatternType('linear')}
                    className={`px-3 py-1 text-xs rounded ${
                      patternType === 'linear' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Линейная
                  </button>
                  <button
                    onClick={() => setPatternType('exponential')}
                    className={`px-3 py-1 text-xs rounded ${
                      patternType === 'exponential' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Экспоненциальная
                  </button>
                </div>
              </div>
              
              {/* Превью шаблона */}
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="text-gray-600 mb-1">Превью:</div>
                <div className="font-mono text-gray-800">
                  [{generatePattern().slice(0, 8).join(', ')}{count > 8 ? '...' : ''}]
                </div>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MassEditPanel;