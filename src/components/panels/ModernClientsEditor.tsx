import React, { useState } from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import { 
  GrowthCurveEditor, 
  SmartGrowthSliders, 
  VisualPatternInput,
  InfoTooltip 
} from '../common';

/**
 * Современный редактор клиентов с инновационными методами ввода данных
 */
const ModernClientsEditor: React.FC = () => {
  const {
    newClients75, setNewClients75,
    newClients150, setNewClients150,
    newClients250, setNewClients250,
    newClients500, setNewClients500,
    newClients1000, setNewClients1000
  } = useFinancialContext();

  const [selectedTariff, setSelectedTariff] = useState(150);
  const [inputMode, setInputMode] = useState<'curve' | 'sliders' | 'patterns'>('curve');

  const tariffs = [
    { value: 75, label: '$75', color: '#10B981' },
    { value: 150, label: '$150', color: '#6366F1' },
    { value: 250, label: '$250', color: '#F59E0B' },
    { value: 500, label: '$500', color: '#EC4899' },
    { value: 1000, label: '$1000', color: '#8B5CF6' }
  ];

  const getCurrentData = () => {
    switch (selectedTariff) {
      case 75: return { values: newClients75, setter: setNewClients75 };
      case 150: return { values: newClients150, setter: setNewClients150 };
      case 250: return { values: newClients250, setter: setNewClients250 };
      case 500: return { values: newClients500, setter: setNewClients500 };
      case 1000: return { values: newClients1000, setter: setNewClients1000 };
      default: return { values: newClients150, setter: setNewClients150 };
    }
  };

  const { values, setter } = getCurrentData();
  const currentColor = tariffs.find(t => t.value === selectedTariff)?.color || '#6366F1';

  // Копирование данных между тарифами
  const copyToOtherTariffs = () => {
    const confirmation = window.confirm('Скопировать текущие значения во все тарифы?');
    if (confirmation) {
      setNewClients75([...values]);
      setNewClients150([...values]);
      setNewClients250([...values]);
      setNewClients500([...values]);
      setNewClients1000([...values]);
    }
  };

  // Применение множителя к другим тарифам
  const applyMultiplier = () => {
    const multipliers = {
      75: 1.5,
      150: 1.2,
      250: 1.0,
      500: 0.6,
      1000: 0.3
    };

    setNewClients75(values.map(v => Math.round(v * multipliers[75])));
    setNewClients150(values.map(v => Math.round(v * multipliers[150])));
    setNewClients250(values.map(v => Math.round(v * multipliers[250])));
    setNewClients500(values.map(v => Math.round(v * multipliers[500])));
    setNewClients1000(values.map(v => Math.round(v * multipliers[1000])));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-indigo-600 flex items-center">
          Современный редактор клиентов
          <InfoTooltip
            content="Используйте инновационные методы ввода данных для быстрой и удобной настройки"
            position="right"
          />
        </h2>
      </div>

      {/* Выбор тарифа */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Выберите тариф</label>
        <div className="flex flex-wrap gap-2">
          {tariffs.map((tariff) => (
            <button
              key={tariff.value}
              onClick={() => setSelectedTariff(tariff.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTariff === tariff.value
                  ? 'text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedTariff === tariff.value ? tariff.color : undefined
              }}
            >
              {tariff.label}
            </button>
          ))}
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
            values={values}
            onChange={setter}
            min={0}
            max={50}
            title={`Новые клиенты - тариф ${tariffs.find(t => t.value === selectedTariff)?.label}`}
            color={currentColor}
          />
        )}
        
        {inputMode === 'sliders' && (
          <SmartGrowthSliders
            values={values}
            onChange={setter}
            min={0}
            max={50}
            title={`Квартальная настройка - тариф ${tariffs.find(t => t.value === selectedTariff)?.label}`}
          />
        )}
        
        {inputMode === 'patterns' && (
          <VisualPatternInput
            values={values}
            onChange={setter}
            min={0}
            max={50}
            title={`Паттерны роста - тариф ${tariffs.find(t => t.value === selectedTariff)?.label}`}
          />
        )}
      </div>

      {/* Быстрые действия */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Быстрые действия</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyToOtherTariffs}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
          >
            📋 Копировать во все тарифы
          </button>
          <button
            onClick={applyMultiplier}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
          >
            ✨ Умное распределение по тарифам
          </button>
          <button
            onClick={() => setter(Array(12).fill(0))}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
          >
            🗑️ Очистить
          </button>
        </div>
      </div>

      {/* Сводка по всем тарифам */}
      <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Сводка по всем тарифам (новые клиенты за год)</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tariffs.map((tariff) => {
            const data = tariff.value === 75 ? newClients75 :
                         tariff.value === 150 ? newClients150 :
                         tariff.value === 250 ? newClients250 :
                         tariff.value === 500 ? newClients500 : newClients1000;
            const total = data.reduce((sum, v) => sum + v, 0);
            
            return (
              <div key={tariff.value} className="bg-white p-3 rounded-lg text-center">
                <div 
                  className="text-lg font-bold mb-1"
                  style={{ color: tariff.color }}
                >
                  {tariff.label}
                </div>
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-xs text-gray-500">клиентов/год</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-indigo-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Всего новых клиентов:</span>
            <span className="text-xl font-bold text-indigo-600">
              {newClients75.reduce((sum, v) => sum + v, 0) +
               newClients150.reduce((sum, v) => sum + v, 0) +
               newClients250.reduce((sum, v) => sum + v, 0) +
               newClients500.reduce((sum, v) => sum + v, 0) +
               newClients1000.reduce((sum, v) => sum + v, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernClientsEditor;