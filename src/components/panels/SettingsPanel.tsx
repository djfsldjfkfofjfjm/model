import React from 'react';
import { EditableCell } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Интерфейс свойств компонента SettingsPanel
 */
export interface SettingsPanelProps {
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Компонент панели основных настроек финансовой модели
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  className = ""
}) => {
  const {
    taxMode,
    setTaxMode,
    customTaxRate,
    setCustomTaxRate,
    fotMode,
    setFotMode,
    subscriptionPrice75,
    setSubscriptionPrice75,
    subscriptionPrice150,
    setSubscriptionPrice150,
    subscriptionPrice250,
    setSubscriptionPrice250,
    subscriptionPrice500,
    setSubscriptionPrice500,
    subscriptionPrice1000,
    setSubscriptionPrice1000,
    integrationPrice,
    setIntegrationPrice,
    cacPercentage,
    setCacPercentage,
    churnRate,
    setChurnRate
  } = useFinancialContext();
  
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 ${className}`}>
      <h2 className="text-xl font-bold mb-6 text-indigo-600">
        Параметры финансовой модели
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Блок настроек налогового режима */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">Налоговый режим</label>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                taxMode === 'optimistic'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setTaxMode('optimistic')}
              data-testid="btn-tax-optimistic"
            >
              Оптимистичный (9%, ПВТ)
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                taxMode === 'pessimistic'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setTaxMode('pessimistic')}
              data-testid="btn-tax-pessimistic"
            >
              Пессимистичный (35%)
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                taxMode === 'custom'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setTaxMode('custom')}
              data-testid="btn-tax-custom"
            >
              Свой процент
            </button>
          </div>
          {taxMode === 'custom' && (
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1">Свой процент налога (%)</label>
              <EditableCell 
                value={customTaxRate} 
                onChange={setCustomTaxRate} 
                min={0}
                max={100}
                step={0.1}
              />
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            {taxMode === 'optimistic' && 'Налоговая ставка: 9%'}
            {taxMode === 'pessimistic' && 'Налоговая ставка: 35%'}
            {taxMode === 'custom' && `Налоговая ставка: ${customTaxRate}%`}
          </div>
        </div>
        
        {/* Блок настроек ФОТ */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">ФОТ</label>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                fotMode === 'optimistic'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setFotMode('optimistic')}
            >
              Оптимистичный
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                fotMode === 'pessimistic'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setFotMode('pessimistic')}
            >
              Пессимистичный
            </button>
          </div>
        </div>
        
        {/* Блок настроек подписки */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Стоимость подписки</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">API-only ($)</label>
              <EditableCell 
                value={subscriptionPrice75} 
                onChange={setSubscriptionPrice75} 
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Базовый ($)</label>
              <EditableCell 
                value={subscriptionPrice150} 
                onChange={setSubscriptionPrice150} 
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Стандарт ($)</label>
              <EditableCell 
                value={subscriptionPrice250} 
                onChange={setSubscriptionPrice250} 
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Премиум ($)</label>
              <EditableCell 
                value={subscriptionPrice500} 
                onChange={setSubscriptionPrice500} 
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Корпоративный ($)</label>
              <EditableCell 
                value={subscriptionPrice1000} 
                onChange={setSubscriptionPrice1000} 
                min={0}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Блок настроек внедрения */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Стоимость внедрения</h3>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Стоимость интеграции ($)</label>
            <EditableCell 
              value={integrationPrice} 
              onChange={setIntegrationPrice} 
              min={200}
              max={1000}
            />
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={integrationPrice}
              onChange={(e) => setIntegrationPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-indigo-600 font-semibold whitespace-nowrap">
              ${integrationPrice}
            </span>
          </div>
        </div>
        
        {/* Блок настроек CAC */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Расходы на привлечение</h3>
          <div className="mb-1">
            <label className="block text-xs text-gray-500 mb-1">CAC (% от внедрения)</label>
            <EditableCell 
              value={cacPercentage} 
              onChange={setCacPercentage} 
              min={0}
              max={100}
            />
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={cacPercentage}
              onChange={(e) => setCacPercentage(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-indigo-600 font-semibold whitespace-nowrap">
              {cacPercentage}% (${Math.round(integrationPrice * cacPercentage / 100)})
            </span>
          </div>
        </div>
        
        {/* Блок настроек Churn Rate */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Отток клиентов (Churn Rate)</h3>
          <div className="mb-1">
            <label className="block text-xs text-gray-500 mb-1">
              Ежемесячный % оттока клиентов
            </label>
            <EditableCell 
              value={churnRate} 
              onChange={setChurnRate} 
              min={0}
              max={100}
              step={0.1}
              data-testid="input-churnRate"
            />
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={churnRate}
              onChange={(e) => setChurnRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-indigo-600 font-semibold whitespace-nowrap">
              {churnRate}%
            </span>
          </div>
          
          <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs space-y-1 text-gray-600">
              <p>При ставке {churnRate}% в месяц:</p>
              <p>Через полгода останется: <span className="font-medium">
                {Math.round(100 * Math.pow(1 - churnRate/100, 6))}% клиентов
              </span></p>
              <p>Через год останется: <span className="font-medium">
                {Math.round(100 * Math.pow(1 - churnRate/100, 12))}% клиентов
              </span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
