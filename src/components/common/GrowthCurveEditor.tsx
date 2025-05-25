import React, { useState, useRef, useEffect } from 'react';
import InfoTooltip from './InfoTooltip';

interface GrowthCurveEditorProps {
  values: number[];
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  title?: string;
  color?: string;
  showPresets?: boolean;
}

/**
 * Инновационный компонент для интуитивного ввода данных по месяцам
 * Поддерживает рисование кривой мышью/пальцем, пресеты роста и умные паттерны
 */
const GrowthCurveEditor: React.FC<GrowthCurveEditorProps> = ({
  values,
  onChange,
  min = 0,
  max = 50,
  title = "Рост клиентов",
  color = "#6366F1",
  showPresets = true
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  // Пресеты роста
  const growthPresets = {
    linear: {
      name: 'Линейный рост',
      icon: '📈',
      generate: (base: number) => Array.from({ length: 12 }, (_, i) => Math.round(base + (i * base * 0.1)))
    },
    exponential: {
      name: 'Экспоненциальный',
      icon: '🚀',
      generate: (base: number) => Array.from({ length: 12 }, (_, i) => Math.round(base * Math.pow(1.15, i)))
    },
    seasonal: {
      name: 'Сезонный',
      icon: '🌊',
      generate: (base: number) => Array.from({ length: 12 }, (_, i) => {
        const seasonalFactor = 1 + 0.3 * Math.sin((i - 3) * Math.PI / 6);
        return Math.round(base * seasonalFactor * (1 + i * 0.05));
      })
    },
    sShape: {
      name: 'S-образный',
      icon: '〰️',
      generate: (base: number) => Array.from({ length: 12 }, (_, i) => {
        const x = (i - 6) / 3;
        const sigmoid = 1 / (1 + Math.exp(-x));
        return Math.round(base * (0.5 + sigmoid));
      })
    },
    steady: {
      name: 'Стабильный',
      icon: '➡️',
      generate: (base: number) => Array.from({ length: 12 }, () => base)
    }
  };

  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Преобразование координат
  const xScale = (index: number) => (index / 11) * chartWidth + padding.left;
  const yScale = (value: number) => {
    const normalized = (value - min) / (max - min);
    return padding.top + chartHeight * (1 - normalized);
  };

  // Обратное преобразование
  const getValueFromY = (y: number): number => {
    const normalized = 1 - (y - padding.top) / chartHeight;
    return Math.round(Math.max(min, Math.min(max, min + normalized * (max - min))));
  };

  const getIndexFromX = (x: number): number => {
    const normalized = (x - padding.left) / chartWidth;
    return Math.round(Math.max(0, Math.min(11, normalized * 11)));
  };

  // Обработчики рисования
  const handleStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const index = getIndexFromX(x);
    const value = getValueFromY(y);
    
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
    setIsDrawing(true);
    setSelectedPreset(null);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDrawing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const index = getIndexFromX(x);
    const value = getValueFromY(y);
    
    const newValues = [...values];
    newValues[index] = value;
    
    // Сглаживание соседних значений для плавной кривой
    if (index > 0) {
      const prevDiff = newValues[index] - newValues[index - 1];
      if (Math.abs(prevDiff) > max * 0.3) {
        newValues[index - 1] = newValues[index] - Math.sign(prevDiff) * max * 0.3;
      }
    }
    if (index < 11) {
      const nextDiff = newValues[index + 1] - newValues[index];
      if (Math.abs(nextDiff) > max * 0.3) {
        newValues[index + 1] = newValues[index] + Math.sign(nextDiff) * max * 0.3;
      }
    }
    
    onChange(newValues);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  // Применение пресета
  const applyPreset = (presetKey: string) => {
    const preset = growthPresets[presetKey as keyof typeof growthPresets];
    if (preset) {
      const baseValue = values[0] || 5;
      const newValues = preset.generate(baseValue);
      onChange(newValues.map(v => Math.min(max, v)));
      setSelectedPreset(presetKey);
    }
  };

  // Создание пути для SVG
  const createPath = () => {
    const points = values.map((value, index) => ({
      x: xScale(index),
      y: yScale(value)
    }));

    // Создаём плавную кривую через точки
    const path = points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      
      const prevPoint = points[index - 1];
      const cpx1 = prevPoint.x + (point.x - prevPoint.x) / 3;
      const cpy1 = prevPoint.y;
      const cpx2 = prevPoint.x + 2 * (point.x - prevPoint.x) / 3;
      const cpy2 = point.y;
      
      return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${point.x} ${point.y}`;
    }, '');

    return path;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          {title}
          <InfoTooltip
            content="Нарисуйте кривую роста мышью или выберите готовый паттерн. На мобильном устройстве используйте палец."
            position="right"
          />
        </h3>
        {showPresets && (
          <div className="flex gap-2">
            {Object.entries(growthPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  selectedPreset === key
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={preset.name}
              >
                <span className="mr-1">{preset.icon}</span>
                <span className="hidden sm:inline">{preset.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className="relative bg-white rounded-lg border border-gray-200 cursor-crosshair select-none"
        style={{ width, height }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleStart(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handleEnd}
      >
        <svg ref={svgRef} width={width} height={height} className="overflow-visible">
          {/* Сетка */}
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i}>
              <line
                x1={xScale(i)}
                y1={padding.top}
                x2={xScale(i)}
                y2={height - padding.bottom}
                stroke="#E5E7EB"
                strokeDasharray="2,2"
              />
              <text
                x={xScale(i)}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {months[i]}
              </text>
            </g>
          ))}
          
          {/* Горизонтальные линии */}
          {Array.from({ length: 5 }, (_, i) => {
            const value = min + (max - min) * (i / 4);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={yScale(value)}
                  x2={width - padding.right}
                  y2={yScale(value)}
                  stroke="#E5E7EB"
                />
                <text
                  x={padding.left - 10}
                  y={yScale(value) + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {Math.round(value)}
                </text>
              </g>
            );
          })}

          {/* Область под кривой */}
          <path
            d={`${createPath()} L ${xScale(11)} ${height - padding.bottom} L ${xScale(0)} ${height - padding.bottom} Z`}
            fill={color}
            fillOpacity={0.1}
          />

          {/* Линия графика */}
          <path
            d={createPath()}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Точки данных */}
          {values.map((value, index) => (
            <g key={index}>
              <circle
                cx={xScale(index)}
                cy={yScale(value)}
                r={6}
                fill={color}
                stroke="white"
                strokeWidth={2}
                className="cursor-pointer hover:r-8 transition-all"
              />
              <text
                x={xScale(index)}
                y={yScale(value) - 10}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {value}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Мобильные контролы */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <button
          onClick={() => onChange(values.map(v => Math.max(min, v - 1)))}
          className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
        >
          Уменьшить все -1
        </button>
        <button
          onClick={() => onChange(values.map(v => Math.min(max, v + 1)))}
          className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
        >
          Увеличить все +1
        </button>
      </div>

      {/* Быстрый ввод суммы */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Всего за год:</span>
        <input
          type="number"
          value={values.reduce((sum, v) => sum + v, 0)}
          onChange={(e) => {
            const total = parseInt(e.target.value) || 0;
            if (total > 0) {
              // Исправление: правильное распределение с учетом округления
              const baseValue = Math.floor(total / 12);
              const remainder = total - (baseValue * 12);
              const newValues = Array(12).fill(baseValue);
              // Распределяем остаток по первым месяцам
              for (let i = 0; i < remainder; i++) {
                newValues[i] = baseValue + 1;
              }
              onChange(newValues);
            } else {
              onChange(Array(12).fill(0));
            }
          }}
          className="w-24 px-2 py-1 border rounded text-sm"
          min={0}
        />
        <button
          onClick={() => {
            const total = values.reduce((sum, v) => sum + v, 0);
            if (total > 0) {
              const baseValue = Math.floor(total / 12);
              const remainder = total - (baseValue * 12);
              const newValues = Array(12).fill(baseValue);
              for (let i = 0; i < remainder; i++) {
                newValues[i] = baseValue + 1;
              }
              onChange(newValues);
            }
          }}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Распределить равномерно
        </button>
      </div>
    </div>
  );
};

export default GrowthCurveEditor;