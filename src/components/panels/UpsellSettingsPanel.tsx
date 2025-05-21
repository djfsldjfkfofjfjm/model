import React from 'react';
import { EditableCell, InfoTooltip } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';
import { useFormatting } from '../../hooks';

/**
 * Интерфейс свойств компонента UpsellSettingsPanel
 */
export interface UpsellSettingsPanelProps {
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Компонент для настройки параметров Upsell
 */
const UpsellSettingsPanel: React.FC<UpsellSettingsPanelProps> = ({ 
  className = ""
}) => {
  const {
    totalData,
    additionalBotsRate,
    setAdditionalBotsRate,
    additionalBotsPrice,
    setAdditionalBotsPrice,
    newFeaturesRate,
    setNewFeaturesRate,
    newFeaturesPrice,
    setNewFeaturesPrice,
    messageExpansionRate,
    setMessageExpansionRate,
    messageExpansionPrice,
    setMessageExpansionPrice,
    additionalIntegrationsRate,
    setAdditionalIntegrationsRate,
    additionalIntegrationsPrice,
    setAdditionalIntegrationsPrice
  } = useFinancialContext();
  
  const { currency } = useFormatting();
  
  return (
    <div className={`bg-white p-6 rounded-2xl shadow ${className}`}>
      <h2 className="text-xl font-bold mb-6 text-indigo-600">
        Upsell-параметры
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Блок 1: Дополнительные боты */}
          <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow">
            <h4 className="text-sm font-medium text-indigo-700 mb-2 flex items-center">
              1. Дополнительные боты
              <InfoTooltip text="Выручка от продажи дополнительных ботов существующим клиентам" />
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">% клиентов в месяц</label>
                <EditableCell 
                  value={additionalBotsRate} 
                  onChange={setAdditionalBotsRate} 
                  min={0}
                  max={15}
                  step={0.1}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Средний чек, $</label>
                <EditableCell 
                  value={additionalBotsPrice} 
                  onChange={setAdditionalBotsPrice} 
                  min={0}
                  max={500}
                  step={5}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Доход: <span className="font-medium text-indigo-600">
                {currency(totalData.totalAdditionalBotsRevenue || 0)}
              </span> ({additionalBotsRate}% × ${additionalBotsPrice})
            </div>
          </div>
          
          {/* Блок 2: Новые функции */}
          <div className="bg-white p-4 rounded-lg border border-pink-100 shadow">
            <h4 className="text-sm font-medium text-pink-700 mb-2 flex items-center">
              2. Новые функции
              <InfoTooltip text="Выручка от продажи дополнительных функций существующим клиентам" />
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">% клиентов в месяц</label>
                <EditableCell 
                  value={newFeaturesRate} 
                  onChange={setNewFeaturesRate} 
                  min={0}
                  max={15}
                  step={0.1}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Средний чек, $</label>
                <EditableCell 
                  value={newFeaturesPrice} 
                  onChange={setNewFeaturesPrice} 
                  min={0}
                  max={500}
                  step={5}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Доход: <span className="font-medium text-pink-600">
                {currency(totalData.totalNewFeaturesRevenue || 0)}
              </span> ({newFeaturesRate}% × ${newFeaturesPrice})
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Блок 3: Расширение объема сообщений */}
          <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow">
            <h4 className="text-sm font-medium text-emerald-700 mb-2 flex items-center">
              3. Расширение объема сообщений
              <InfoTooltip text="Выручка от продажи дополнительных пакетов сообщений" />
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">% клиентов в месяц</label>
                <EditableCell 
                  value={messageExpansionRate} 
                  onChange={setMessageExpansionRate} 
                  min={0}
                  max={15}
                  step={0.1}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Средний чек, $</label>
                <EditableCell 
                  value={messageExpansionPrice} 
                  onChange={setMessageExpansionPrice} 
                  min={0}
                  max={500}
                  step={5}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Доход: <span className="font-medium text-emerald-600">
                {currency(totalData.totalMessageExpansionRevenue || 0)}
              </span> ({messageExpansionRate}% × ${messageExpansionPrice})
            </div>
          </div>
          
          {/* Блок 4: Дополнительные интеграции */}
          <div className="bg-white p-4 rounded-lg border border-amber-100 shadow">
            <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center">
              4. Дополнительные интеграции
              <InfoTooltip text="Выручка от создания дополнительных интеграций для существующих клиентов" />
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">% клиентов в месяц</label>
                <EditableCell 
                  value={additionalIntegrationsRate} 
                  onChange={setAdditionalIntegrationsRate} 
                  min={0}
                  max={15}
                  step={0.1}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Средний чек, $</label>
                <EditableCell 
                  value={additionalIntegrationsPrice} 
                  onChange={setAdditionalIntegrationsPrice} 
                  min={0}
                  max={500}
                  step={5}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Доход: <span className="font-medium text-amber-600">
                {currency(totalData.totalAdditionalIntegrationsRevenue || 0)}
              </span> ({additionalIntegrationsRate}% × ${additionalIntegrationsPrice})
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <h3 className="text-md font-semibold text-indigo-800 mb-2">Upsell (итого)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-indigo-700">
              Общий доход от upsell: <span className="font-bold">{currency(totalData.totalUpsellRevenue || 0)}</span>
            </p>
            <p className="text-sm text-indigo-700">
              % от общего дохода: <span className="font-bold">
                {totalData.totalRevenue ? Math.round((totalData.totalUpsellRevenue || 0) / totalData.totalRevenue * 1000) / 10 : 0}%
              </span>
            </p>
          </div>
          <div>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>Дополнительные боты: {currency(totalData.totalAdditionalBotsRevenue || 0)}</li>
              <li>Новые функции: {currency(totalData.totalNewFeaturesRevenue || 0)}</li>
              <li>Расширение сообщений: {currency(totalData.totalMessageExpansionRevenue || 0)}</li>
              <li>Доп. интеграции: {currency(totalData.totalAdditionalIntegrationsRevenue || 0)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellSettingsPanel;