import React, { useState } from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import { 
  GrowthCurveEditor, 
  SmartGrowthSliders, 
  VisualPatternInput,
  InfoTooltip,
  EditableCell
} from '../common';

/**
 * Современный редактор ФОТ с инновационными методами ввода
 */
const ModernFOTEditor: React.FC = () => {
  const {
    fotMode,
    setFotMode,
    fotOptimistic,
    setFotOptimistic,
    fotPessimistic,
    setFotPessimistic,
  } = useFinancialContext();

  const [inputMode, setInputMode] = useState<'curve' | 'sliders' | 'patterns'>('curve');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState({
    development: 60,
    sales: 25,
    admin: 15
  });
  
  const [lockedValues, setLockedValues] = useState({
    development: false,
    sales: false,
    admin: false
  });

  const currentFot = fotMode === 'optimistic' ? fotOptimistic : fotPessimistic;
  const setCurrentFot = fotMode === 'optimistic' ? setFotOptimistic : setFotPessimistic;

  // Быстрые пресеты для стартапов
  const applyStartupPreset = (stage: 'seed' | 'series-a' | 'growth') => {
    const presets = {
      seed: {
        name: 'Seed стадия',
        optimistic: [500, 800, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000],
        pessimistic: [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000]
      },
      'series-a': {
        name: 'Series A',
        optimistic: [5000, 6000, 7000, 8000, 10000, 12000, 15000, 18000, 20000, 25000, 30000, 35000],
        pessimistic: [5000, 7000, 9000, 12000, 15000, 18000, 22000, 26000, 30000, 35000, 40000, 45000]
      },
      growth: {
        name: 'Стадия роста',
        optimistic: [20000, 22000, 25000, 28000, 32000, 36000, 40000, 45000, 50000, 55000, 60000, 65000],
        pessimistic: [20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 70000, 80000, 90000]
      }
    };

    const preset = presets[stage];
    setFotOptimistic(preset.optimistic);
    setFotPessimistic(preset.pessimistic);
  };

  const getBreakdownValues = () => {
    return currentFot.map(total => ({
      development: Math.round(total * breakdown.development / 100),
      sales: Math.round(total * breakdown.sales / 100),
      admin: Math.round(total * breakdown.admin / 100)
    }));
  };

  const updateBreakdown = (department: 'development' | 'sales' | 'admin', value: number) => {
    const newBreakdown = { ...breakdown };
    newBreakdown[department] = Math.max(0, Math.min(100, value));
    
    // Получаем незакрепленные департаменты (исключая изменяемый)
    const allDepts = ['development', 'sales', 'admin'] as const;
    const unlockedOtherDepts = allDepts.filter(d => d !== department && !lockedValues[d]);
    const lockedOtherDepts = allDepts.filter(d => d !== department && lockedValues[d]);
    
    // Сумма закрепленных значений
    const lockedSum = lockedOtherDepts.reduce((sum, dept) => sum + newBreakdown[dept], 0);
    const remainingForUnlocked = 100 - newBreakdown[department] - lockedSum;
    
    if (unlockedOtherDepts.length > 0 && remainingForUnlocked >= 0) {
      // Распределяем остаток между незакрепленными департаментами
      const currentUnlockedSum = unlockedOtherDepts.reduce((sum, dept) => sum + newBreakdown[dept], 0);
      
      if (currentUnlockedSum > 0) {
        // Пропорционально масштабируем незакрепленные
        const scale = remainingForUnlocked / currentUnlockedSum;
        unlockedOtherDepts.forEach(dept => {
          newBreakdown[dept] = Math.round(newBreakdown[dept] * scale);
        });
      } else {
        // Если все незакрепленные были 0, распределяем поровну
        const equalShare = Math.floor(remainingForUnlocked / unlockedOtherDepts.length);
        unlockedOtherDepts.forEach((dept, index) => {
          newBreakdown[dept] = equalShare + (index === 0 ? remainingForUnlocked % unlockedOtherDepts.length : 0);
        });
      }
      
      // Корректируем округление
      const finalSum = Object.values(newBreakdown).reduce((sum, val) => sum + val, 0);
      if (finalSum !== 100 && unlockedOtherDepts.length > 0) {
        const diff = 100 - finalSum;
        newBreakdown[unlockedOtherDepts[0]] += diff;
      }
    } else if (remainingForUnlocked < 0) {
      // Если остаток отрицательный, сбрасываем изменяемое значение
      newBreakdown[department] = 100 - lockedSum;
    }
    
    setBreakdown(newBreakdown);
  };

  const toggleLock = (department: 'development' | 'sales' | 'admin') => {
    setLockedValues(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-indigo-600 flex items-center">
          Современный редактор ФОТ
          <InfoTooltip
            content="Используйте инновационные методы для планирования фонда оплаты труда"
            position="right"
          />
        </h2>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              fotMode === 'optimistic'
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            onClick={() => setFotMode('optimistic')}
          >
            😊 Оптимистичный
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              fotMode === 'pessimistic'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            onClick={() => setFotMode('pessimistic')}
          >
            😰 Пессимистичный
          </button>
        </div>
      </div>

      {/* Быстрые пресеты для стартапов */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">🚀 Быстрые пресеты для стартапов</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => applyStartupPreset('seed')}
            className="p-3 bg-white rounded-lg hover:bg-gray-50 text-left border border-purple-200"
          >
            <div className="font-medium mb-1">🌱 Seed стадия</div>
            <div className="text-xs space-y-1">
              <div className="text-green-600">Оптимистичный: $500 → $5K</div>
              <div className="text-orange-600">Пессимистичный: $500 → $9K</div>
              <div className="text-gray-500">Рост за год: 10-18x</div>
            </div>
          </button>
          <button
            onClick={() => applyStartupPreset('series-a')}
            className="p-3 bg-white rounded-lg hover:bg-gray-50 text-left border border-purple-200"
          >
            <div className="font-medium mb-1">🎯 Series A</div>
            <div className="text-xs space-y-1">
              <div className="text-green-600">Оптимистичный: $5K → $35K</div>
              <div className="text-orange-600">Пессимистичный: $5K → $45K</div>
              <div className="text-gray-500">Рост за год: 7-9x</div>
            </div>
          </button>
          <button
            onClick={() => applyStartupPreset('growth')}
            className="p-3 bg-white rounded-lg hover:bg-gray-50 text-left border border-purple-200"
          >
            <div className="font-medium mb-1">📈 Growth стадия</div>
            <div className="text-xs space-y-1">
              <div className="text-green-600">Оптимистичный: $20K → $65K</div>
              <div className="text-orange-600">Пессимистичный: $20K → $90K</div>
              <div className="text-gray-500">Рост за год: 3.2-4.5x</div>
            </div>
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-600 text-center">
          Пресеты основаны на типичных показателях роста команд для каждой стадии развития стартапа
        </div>
      </div>

      {/* Режимы ввода */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setInputMode('curve')}
            className={`pb-2 px-1 font-medium transition-all ${
              inputMode === 'curve'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📈 Рисование кривой
          </button>
          <button
            onClick={() => setInputMode('sliders')}
            className={`pb-2 px-1 font-medium transition-all ${
              inputMode === 'sliders'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎚️ Умные слайдеры
          </button>
          <button
            onClick={() => setInputMode('patterns')}
            className={`pb-2 px-1 font-medium transition-all ${
              inputMode === 'patterns'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎨 Визуальные паттерны
          </button>
        </div>
      </div>

      {/* Контент в зависимости от режима */}
      <div className="mb-6">
        {inputMode === 'curve' && (
          <GrowthCurveEditor
            values={currentFot}
            onChange={setCurrentFot}
            min={0}
            max={100000}
            title={`ФОТ - ${fotMode === 'optimistic' ? 'Оптимистичный' : 'Пессимистичный'} сценарий`}
            color={fotMode === 'optimistic' ? '#10B981' : '#F97316'}
            showPresets={false}
          />
        )}
        
        {inputMode === 'sliders' && (
          <SmartGrowthSliders
            values={currentFot}
            onChange={setCurrentFot}
            min={0}
            max={100000}
            title={`Квартальная настройка ФОТ - ${fotMode === 'optimistic' ? 'Оптимистичный' : 'Пессимистичный'}`}
          />
        )}
        
        {inputMode === 'patterns' && (
          <VisualPatternInput
            values={currentFot}
            onChange={setCurrentFot}
            min={0}
            max={100000}
            title={`Паттерны роста ФОТ - ${fotMode === 'optimistic' ? 'Оптимистичный' : 'Пессимистичный'}`}
          />
        )}
      </div>

      {/* Декомпозиция ФОТ */}
      <div className="mb-6">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <span>{showBreakdown ? '📊' : '📈'}</span>
          {showBreakdown ? 'Скрыть декомпозицию' : 'Показать декомпозицию по отделам'}
        </button>
        
        {showBreakdown && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="font-medium text-purple-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>💻 Разработка</span>
                    <button
                      onClick={() => toggleLock('development')}
                      className={`text-xs px-1 py-1 rounded transition-colors ${
                        lockedValues.development 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={lockedValues.development ? 'Открепить значение' : 'Закрепить значение'}
                    >
                      {lockedValues.development ? '🔒' : '🔓'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <EditableCell
                      value={breakdown.development}
                      onChange={(value) => updateBreakdown('development', value)}
                      min={0}
                      max={100}
                      step={1}
                      disabled={lockedValues.development}
                    />
                    <span className="text-purple-600">%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">Разработчики, DevOps, QA</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-blue-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>💼 Продажи</span>
                    <button
                      onClick={() => toggleLock('sales')}
                      className={`text-xs px-1 py-1 rounded transition-colors ${
                        lockedValues.sales 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={lockedValues.sales ? 'Открепить значение' : 'Закрепить значение'}
                    >
                      {lockedValues.sales ? '🔒' : '🔓'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <EditableCell
                      value={breakdown.sales}
                      onChange={(value) => updateBreakdown('sales', value)}
                      min={0}
                      max={100}
                      step={1}
                      disabled={lockedValues.sales}
                    />
                    <span className="text-blue-600">%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">Sales, маркетинг, поддержка</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📋 Админ</span>
                    <button
                      onClick={() => toggleLock('admin')}
                      className={`text-xs px-1 py-1 rounded transition-colors ${
                        lockedValues.admin 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={lockedValues.admin ? 'Открепить значение' : 'Закрепить значение'}
                    >
                      {lockedValues.admin ? '🔒' : '🔓'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <EditableCell
                      value={breakdown.admin}
                      onChange={(value) => updateBreakdown('admin', value)}
                      min={0}
                      max={100}
                      step={1}
                      disabled={lockedValues.admin}
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">HR, финансы, операции</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center space-y-1">
              <div>Сумма должна быть 100%. Используйте 🔒/🔓 для закрепления значений.</div>
              <div>Закрепленные значения не изменяются при корректировке других департаментов.</div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Месяц</th>
                    <th className="text-right py-2">Всего</th>
                    <th className="text-right py-2 text-purple-700">Разработка</th>
                    <th className="text-right py-2 text-blue-700">Продажи</th>
                    <th className="text-right py-2 text-gray-700">Админ</th>
                  </tr>
                </thead>
                <tbody>
                  {getBreakdownValues().slice(0, 3).map((month, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{index + 1}</td>
                      <td className="text-right font-medium">${currentFot[index].toLocaleString()}</td>
                      <td className="text-right text-purple-600">${month.development.toLocaleString()}</td>
                      <td className="text-right text-blue-600">${month.sales.toLocaleString()}</td>
                      <td className="text-right text-gray-600">${month.admin.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="text-center py-2 text-gray-500">...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Сравнение сценариев */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Сравнение сценариев</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-green-600 font-medium mb-2">Оптимистичный</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Год:</span>
                <span className="font-medium">${fotOptimistic.reduce((a, b) => a + b, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Среднее:</span>
                <span className="font-medium">${Math.round(fotOptimistic.reduce((a, b) => a + b, 0) / 12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Рост:</span>
                <span className="font-medium">
                  {Math.round(((fotOptimistic[11] - fotOptimistic[0]) / fotOptimistic[0]) * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-orange-600 font-medium mb-2">Пессимистичный</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Год:</span>
                <span className="font-medium">${fotPessimistic.reduce((a, b) => a + b, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Среднее:</span>
                <span className="font-medium">${Math.round(fotPessimistic.reduce((a, b) => a + b, 0) / 12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Рост:</span>
                <span className="font-medium">
                  {Math.round(((fotPessimistic[11] - fotPessimistic[0]) / fotPessimistic[0]) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span>Разница между сценариями:</span>
            <span className="font-medium text-red-600">
              ${Math.abs(fotPessimistic.reduce((a, b) => a + b, 0) - fotOptimistic.reduce((a, b) => a + b, 0)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Советы */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Совет:</strong> Планируйте ФОТ с учётом найма. Если планируете нанять разработчика через 3 месяца, 
          заложите рост ФОТ начиная с 4-го месяца.
        </p>
      </div>
    </div>
  );
};

export default ModernFOTEditor;