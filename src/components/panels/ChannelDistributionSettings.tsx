import React from 'react';
import { EditableCell, InfoTooltip } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Компонент для настройки распределения клиентов между каналами
 */
const ChannelDistributionSettings: React.FC = () => {
  const { channelDistribution, setChannelDistribution } = useFinancialContext();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-indigo-600 flex items-center">
        Распределение по каналам привлечения
        <InfoTooltip
          content="Укажите, какой процент новых клиентов приходит через каждый канал"
          position="right"
        />
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 mb-3">
            Прямые продажи
          </h3>
          <div className="flex items-center">
            <EditableCell
              value={channelDistribution.direct}
              onChange={(value) => {
                const newDirect = Math.min(100, Math.max(0, value));
                const newPartner = 100 - newDirect;
                setChannelDistribution({ direct: newDirect, partner: newPartner });
              }}
              min={0}
              max={100}
              step={1}
            />
            <span className="ml-2 text-blue-700">%</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Клиенты через собственный отдел продаж
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-green-800 mb-3">
            Партнёрская программа
          </h3>
          <div className="flex items-center">
            <EditableCell
              value={channelDistribution.partner}
              onChange={(value) => {
                const newPartner = Math.min(100, Math.max(0, value));
                const newDirect = 100 - newPartner;
                setChannelDistribution({ direct: newDirect, partner: newPartner });
              }}
              min={0}
              max={100}
              step={1}
            />
            <span className="ml-2 text-green-700">%</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Клиенты через партнёров
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Важно:</strong> Общая сумма должна составлять 100%. Изменение одного канала автоматически корректирует другой.
        </p>
      </div>
    </div>
  );
};

export default ChannelDistributionSettings;