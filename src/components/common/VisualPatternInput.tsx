import React, { useState } from 'react';
import InfoTooltip from './InfoTooltip';

interface VisualPatternInputProps {
  values: number[];
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  title?: string;
}

/**
 * Визуальный компонент для выбора паттернов роста
 * Позволяет комбинировать различные шаблоны и настраивать их параметры
 */
const VisualPatternInput: React.FC<VisualPatternInputProps> = ({
  values,
  onChange,
  min = 0,
  max = 50,
  title = "Визуальные паттерны роста"
}) => {
  const [baseValue, setBaseValue] = useState(values[0] || 10);
  const [intensity, setIntensity] = useState(50);
  const [selectedPattern, setSelectedPattern] = useState<string>('');

  const patterns = {
    hockey: {
      name: 'Хоккейная клюшка',
      icon: '🏒',
      description: 'Медленный старт, затем резкий рост',
      preview: [1, 1, 2, 2, 3, 4, 8, 12, 18, 25, 35, 45]
    },
    wave: {
      name: 'Волна',
      icon: '🌊',
      description: 'Циклический рост с пиками и спадами',
      preview: [10, 15, 20, 15, 10, 15, 20, 25, 20, 15, 20, 25]
    },
    stairs: {
      name: 'Лестница',
      icon: '📶',
      description: 'Ступенчатый рост с периодами стабильности',
      preview: [5, 5, 5, 10, 10, 10, 15, 15, 15, 20, 20, 20]
    },
    viral: {
      name: 'Вирусный',
      icon: '🚀',
      description: 'Экспоненциальный рост',
      preview: [2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377]
    },
    plateau: {
      name: 'Плато',
      icon: '⛰️',
      description: 'Быстрый рост, затем стабилизация',
      preview: [5, 10, 20, 30, 35, 38, 40, 40, 40, 40, 40, 40]
    },
    seasonal: {
      name: 'Сезонность',
      icon: '📅',
      description: 'Пики в определённые месяцы',
      preview: [5, 8, 15, 10, 8, 5, 3, 5, 10, 20, 25, 15]
    }
  };

  const applyPattern = (patternKey: string) => {
    const pattern = patterns[patternKey as keyof typeof patterns];
    if (!pattern) return;

    const scaleFactor = (baseValue / 10) * (intensity / 50);
    const newValues = pattern.preview.map(v => 
      Math.round(Math.min(max, Math.max(min, v * scaleFactor)))
    );
    
    onChange(newValues);
    setSelectedPattern(patternKey);
  };

  const combinePatterns = (pattern1: string, pattern2: string, weight: number = 0.5) => {
    const p1 = patterns[pattern1 as keyof typeof patterns];
    const p2 = patterns[pattern2 as keyof typeof patterns];
    if (!p1 || !p2) return;

    const scaleFactor = (baseValue / 10) * (intensity / 50);
    const newValues = p1.preview.map((v1, i) => {
      const v2 = p2.preview[i];
      const combined = v1 * (1 - weight) + v2 * weight;
      return Math.round(Math.min(max, Math.max(min, combined * scaleFactor)));
    });
    
    onChange(newValues);
  };

  const months = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          {title}
          <InfoTooltip
            content="Выберите визуальный паттерн роста и настройте его интенсивность"
            position="right"
          />
        </h3>
      </div>

      {/* Настройки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Базовое значение</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={30}
              value={baseValue}
              onChange={(e) => {
                setBaseValue(parseInt(e.target.value));
                if (selectedPattern) applyPattern(selectedPattern);
              }}
              className="flex-1"
            />
            <span className="w-12 text-center font-medium">{baseValue}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Интенсивность</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={10}
              max={100}
              value={intensity}
              onChange={(e) => {
                setIntensity(parseInt(e.target.value));
                if (selectedPattern) applyPattern(selectedPattern);
              }}
              className="flex-1"
            />
            <span className="w-12 text-center font-medium">{intensity}%</span>
          </div>
        </div>
      </div>

      {/* Паттерны */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(patterns).map(([key, pattern]) => (
          <button
            key={key}
            onClick={() => applyPattern(key)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedPattern === key
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{pattern.icon}</span>
              <span className="font-medium text-gray-800">{pattern.name}</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">{pattern.description}</p>
            
            {/* Мини-превью */}
            <div className="h-12 flex items-end gap-0.5">
              {pattern.preview.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-indigo-400 rounded-t"
                  style={{ 
                    height: `${(value / Math.max(...pattern.preview)) * 100}%`,
                    opacity: selectedPattern === key ? 1 : 0.6
                  }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Текущие значения */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Текущие значения</h4>
        <div className="flex items-end gap-1 h-32">
          {values.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-indigo-500 rounded-t transition-all duration-300"
                style={{ height: `${(value / max) * 100}%` }}
              />
              <span className="text-xs text-gray-600 mt-1">{months[index]}</span>
              <span className="text-xs font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Комбинирование паттернов */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Комбинирование паттернов</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => combinePatterns('hockey', 'seasonal', 0.3)}
            className="px-3 py-1 bg-white rounded-lg text-sm hover:bg-gray-50"
          >
            🏒 + 📅 Хоккейная клюшка с сезонностью
          </button>
          <button
            onClick={() => combinePatterns('stairs', 'wave', 0.5)}
            className="px-3 py-1 bg-white rounded-lg text-sm hover:bg-gray-50"
          >
            📶 + 🌊 Ступенчатая волна
          </button>
          <button
            onClick={() => combinePatterns('viral', 'plateau', 0.7)}
            className="px-3 py-1 bg-white rounded-lg text-sm hover:bg-gray-50"
          >
            🚀 + ⛰️ Вирусный рост с плато
          </button>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="flex gap-2">
        <button
          onClick={() => onChange(values.map(v => Math.round(v * 1.1)))}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
        >
          +10% ко всем
        </button>
        <button
          onClick={() => onChange(values.map(v => Math.round(v * 0.9)))}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
        >
          -10% от всех
        </button>
        <button
          onClick={() => {
            const smoothed = values.map((v, i) => {
              if (i === 0 || i === 11) return v;
              return Math.round((values[i-1] + v + values[i+1]) / 3);
            });
            onChange(smoothed);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          Сгладить
        </button>
      </div>
    </div>
  );
};

export default VisualPatternInput;