import React from 'react';
import { EditableCell, InfoTooltip } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Компонент для настройки распределения ФОТ между разработкой и продажами
 */
const FOTDistributionSettings: React.FC = () => {
  // Временные заглушки пока контекст не обновлён
  const fotDistribution = { development: 60, sales: 40 };
  const setFotDistribution = (value: any) => console.log('FOT distribution:', value);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-indigo-600 flex items-center">
        Распределение ФОТ
        <InfoTooltip
          content="Укажите, как распределяется фонд оплаты труда между отделами"
          position="right"
        />
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-purple-800 mb-3">
            Разработка
          </h3>
          <div className="flex items-center">
            <EditableCell
              value={fotDistribution.development}
              onChange={(value) => {
                const newDevelopment = Math.min(100, Math.max(0, value));
                const newSales = 100 - newDevelopment;
                setFotDistribution({ development: newDevelopment, sales: newSales });
              }}
              min={0}
              max={100}
              step={1}
            />
            <span className="ml-2 text-purple-700">%</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Техническая команда: разработчики, DevOps, QA
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-orange-800 mb-3">
            Продажи
          </h3>
          <div className="flex items-center">
            <EditableCell
              value={fotDistribution.sales}
              onChange={(value) => {
                const newSales = Math.min(100, Math.max(0, value));
                const newDevelopment = 100 - newSales;
                setFotDistribution({ development: newDevelopment, sales: newSales });
              }}
              min={0}
              max={100}
              step={1}
            />
            <span className="ml-2 text-orange-700">%</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Отдел продаж, маркетинг, поддержка клиентов
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Рекомендация:</strong> Типичное распределение для SaaS: 60-70% на разработку, 30-40% на продажи.
        </p>
      </div>
    </div>
  );
};

export default FOTDistributionSettings;