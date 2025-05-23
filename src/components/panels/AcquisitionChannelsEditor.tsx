import React from 'react';
import { EditableCell, InfoTooltip } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Компонент для управления каналами привлечения клиентов
 */
const AcquisitionChannelsEditor: React.FC = () => {
  const { 
    directSalesPercentage, 
    setDirectSalesPercentage,
    directMarketingPercentage,
    setDirectMarketingPercentage,
    directLeadCost,
    setDirectLeadCost,
    partnerCommissionRate, 
    setPartnerCommissionRate,
    partnerLeadCost,
    setPartnerLeadCost
  } = useFinancialContext();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-indigo-600 flex items-center">
        Каналы привлечения клиентов
        <InfoTooltip
          content="Настройте параметры для двух основных каналов привлечения: прямые продажи и партнёрская программа"
          position="right"
        />
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Прямой канал */}
        <div className="bg-blue-50 p-6 rounded-xl">
          <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
            Прямые продажи
            <InfoTooltip
              content="Самостоятельное привлечение клиентов через собственный отдел продаж и маркетинг"
              position="right"
            />
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Расходы на продажи (% от выручки)
              </label>
              <EditableCell
                value={directSalesPercentage}
                onChange={setDirectSalesPercentage}
                min={0}
                max={100}
                step={0.1}
              />
              <p className="text-xs text-gray-500 mt-1">
                Зарплата отдела продаж при прямом привлечении
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Расходы на маркетинг (% от выручки)
              </label>
              <EditableCell
                value={directMarketingPercentage}
                onChange={setDirectMarketingPercentage}
                min={0}
                max={100}
                step={0.1}
              />
              <p className="text-xs text-gray-500 mt-1">
                Реклама, контент-маркетинг, мероприятия
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Стоимость лида ($)
              </label>
              <EditableCell
                value={directLeadCost}
                onChange={setDirectLeadCost}
                min={0}
                formatCurrency
              />
              <p className="text-xs text-gray-500 mt-1">
                Средняя стоимость привлечения одного лида
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              Общие расходы: {directSalesPercentage + directMarketingPercentage}% от выручки + ${directLeadCost}/лид
            </p>
          </div>
        </div>

        {/* Партнёрский канал */}
        <div className="bg-green-50 p-6 rounded-xl">
          <h3 className="text-lg font-medium text-green-800 mb-4 flex items-center">
            Партнёрская программа
            <InfoTooltip
              content="Привлечение клиентов через партнёров, которые получают комиссию с продаж"
              position="right"
            />
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комиссия партнёрам (% от внедрения)
              </label>
              <EditableCell
                value={partnerCommissionRate}
                onChange={setPartnerCommissionRate}
                min={0}
                max={100}
                step={0.1}
              />
              <p className="text-xs text-gray-500 mt-1">
                Процент от стоимости внедрения, выплачиваемый партнёру
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Стоимость лида от партнёра ($)
              </label>
              <EditableCell
                value={partnerLeadCost}
                onChange={setPartnerLeadCost}
                min={0}
                formatCurrency
              />
              <p className="text-xs text-gray-500 mt-1">
                Затраты на обработку и поддержку партнёрского лида
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              Комиссия: {partnerCommissionRate}% от внедрения + ${partnerLeadCost}/лид
            </p>
          </div>
        </div>
      </div>

      {/* Сравнение каналов */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Сравнение каналов</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Прямые продажи:</span>
            <ul className="text-xs text-gray-500 mt-1">
              <li>• Больше контроля над процессом</li>
              <li>• Выше постоянные расходы</li>
              <li>• Лучше для сложных продаж</li>
            </ul>
          </div>
          <div>
            <span className="text-gray-600">Партнёрская программа:</span>
            <ul className="text-xs text-gray-500 mt-1">
              <li>• Оплата за результат</li>
              <li>• Масштабируемость</li>
              <li>• Доступ к новым рынкам</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcquisitionChannelsEditor;