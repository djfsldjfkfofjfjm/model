import React, { useEffect, useState } from 'react';
import InfoTooltip from './InfoTooltip';

interface SmartGrowthSlidersProps {
  values: number[];
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  title?: string;
}

/**
 * Компонент с умными слайдерами для настройки роста по кварталам
 * Автоматически распределяет значения внутри квартала
 */
const SmartGrowthSliders: React.FC<SmartGrowthSlidersProps> = ({
  values,
  onChange,
  min = 0,
  max = 50,
  title = "Настройка роста по кварталам"
}) => {
  const [quarters, setQuarters] = useState<number[]>([]);
  const [growthRate, setGrowthRate] = useState(10);
  const [distribution, setDistribution] = useState<'even' | 'growing' | 'declining'>('even');
  
  // Инициализация квартальных значений
  useEffect(() => {
    const q1 = Math.round((values[0] + values[1] + values[2]) / 3);
    const q2 = Math.round((values[3] + values[4] + values[5]) / 3);
    const q3 = Math.round((values[6] + values[7] + values[8]) / 3);
    const q4 = Math.round((values[9] + values[10] + values[11]) / 3);
    setQuarters([q1, q2, q3, q4]);
  }, []);

  // Распределение значений внутри квартала
  const distributeQuarter = (quarterValue: number, quarterIndex: number): number[] => {
    const monthsInQuarter = 3;
    const startMonth = quarterIndex * monthsInQuarter;
    
    switch (distribution) {
      case 'even':
        return Array(monthsInQuarter).fill(quarterValue);
      
      case 'growing':
        const growthStep = quarterValue * 0.1;
        return [
          Math.round(quarterValue - growthStep),
          quarterValue,
          Math.round(quarterValue + growthStep)
        ];
      
      case 'declining':
        const declineStep = quarterValue * 0.1;
        return [
          Math.round(quarterValue + declineStep),
          quarterValue,
          Math.round(quarterValue - declineStep)
        ];
      
      default:
        return Array(monthsInQuarter).fill(quarterValue);
    }
  };

  // Обновление значений при изменении кварталов
  const updateValues = (newQuarters: number[]) => {
    const newValues: number[] = [];
    newQuarters.forEach((quarter, index) => {
      newValues.push(...distributeQuarter(quarter, index));
    });
    onChange(newValues);
    setQuarters(newQuarters);
  };

  // Применение роста
  const applyGrowth = () => {
    const newQuarters = quarters.map((q, index) => {
      const growthFactor = 1 + (growthRate / 100) * index;
      return Math.round(Math.min(max, q * growthFactor));
    });
    updateValues(newQuarters);
  };

  // Быстрые пресеты
  const presets = {
    startup: { name: "Стартап", values: [2, 5, 10, 20] },
    steady: { name: "Стабильный", values: [10, 12, 14, 16] },
    aggressive: { name: "Агрессивный", values: [5, 15, 30, 50] },
    seasonal: { name: "Сезонный", values: [15, 20, 25, 15] }
  };

  const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];
  const monthGroups = [
    ['Янв', 'Фев', 'Мар'],
    ['Апр', 'Май', 'Июн'],
    ['Июл', 'Авг', 'Сен'],
    ['Окт', 'Ноя', 'Дек']
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          {title}
          <InfoTooltip
            content="Настройте рост по кварталам с помощью слайдеров. Значения автоматически распределятся по месяцам."
            position="right"
          />
        </h3>
      </div>

      {/* Быстрые пресеты */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => updateValues(preset.values)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Квартальные слайдеры */}
      <div className="space-y-4">
        {quarters.map((quarter, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">{quarterNames[index]}</span>
              <span className="text-sm text-gray-500">
                {monthGroups[index].join(', ')}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={min}
                max={max}
                value={quarter}
                onChange={(e) => {
                  const newQuarters = [...quarters];
                  newQuarters[index] = parseInt(e.target.value);
                  updateValues(newQuarters);
                }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #6366F1 0%, #6366F1 ${(quarter / max) * 100}%, #E5E7EB ${(quarter / max) * 100}%, #E5E7EB 100%)`
                }}
              />
              <input
                type="number"
                value={quarter}
                onChange={(e) => {
                  const newQuarters = [...quarters];
                  newQuarters[index] = Math.max(min, Math.min(max, parseInt(e.target.value) || 0));
                  updateValues(newQuarters);
                }}
                className="w-16 px-2 py-1 text-center border rounded"
                min={min}
                max={max}
              />
            </div>
            
            {/* Предпросмотр месячных значений */}
            <div className="mt-2 flex gap-2 text-xs text-gray-600">
              {distributeQuarter(quarter, index).map((monthValue, monthIndex) => (
                <span key={monthIndex} className="bg-white px-2 py-1 rounded">
                  {monthGroups[index][monthIndex]}: {monthValue}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Настройки распределения */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Распределение внутри квартала</h4>
        <div className="flex gap-2">
          {(['even', 'growing', 'declining'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setDistribution(type);
                updateValues(quarters);
              }}
              className={`px-3 py-1 text-sm rounded-lg transition-all ${
                distribution === type
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type === 'even' && '📊 Равномерно'}
              {type === 'growing' && '📈 Рост'}
              {type === 'declining' && '📉 Снижение'}
            </button>
          ))}
        </div>
      </div>

      {/* Автоматический рост */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Автоматический рост</h4>
        <div className="flex items-center gap-4">
          <span className="text-sm">Рост между кварталами:</span>
          <input
            type="range"
            min={0}
            max={50}
            value={growthRate}
            onChange={(e) => setGrowthRate(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium w-12">{growthRate}%</span>
          <button
            onClick={applyGrowth}
            className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            Применить
          </button>
        </div>
      </div>

      {/* Сводка */}
      <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
        <span className="text-sm text-gray-600">Всего за год:</span>
        <span className="text-lg font-bold text-gray-800">
          {values.reduce((sum, v) => sum + v, 0)}
        </span>
      </div>
    </div>
  );
};

export default SmartGrowthSliders;