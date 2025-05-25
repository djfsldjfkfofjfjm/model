import React from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import { useFormatting } from '../../hooks';
import InfoTooltip from '../common/InfoTooltip';

const MessageUsageStats: React.FC = () => {
  const { monthlyData, messageUsagePercentage } = useFinancialContext();
  const { number, percent } = useFormatting();

  // Защита от пустых данных
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Статистика использования сообщений
        </h2>
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    );
  }

  // Расчет общей статистики за год
  const yearlyStats = monthlyData.reduce((acc, month) => {
    // Суммируем использованные сообщения по всем тарифам
    const totalUsed = (month.usedMessages75 || 0) + 
                      (month.usedMessages150 || 0) + 
                      (month.usedMessages250 || 0) + 
                      (month.usedMessages500 || 0) + 
                      (month.usedMessages1000 || 0);
    
    // Суммируем доступные сообщения
    const totalAvailable = (month.availableMessages75 || 0) + 
                          (month.availableMessages150 || 0) + 
                          (month.availableMessages250 || 0) + 
                          (month.availableMessages500 || 0) + 
                          (month.availableMessages1000 || 0);
    
    // Суммируем дополнительные сообщения
    const totalAdditional = (month.additionalMessages75 || 0) + 
                           (month.additionalMessages150 || 0) + 
                           (month.additionalMessages250 || 0) + 
                           (month.additionalMessages500 || 0) + 
                           (month.additionalMessages1000 || 0);

    return {
      totalUsed: acc.totalUsed + totalUsed,
      totalAvailable: acc.totalAvailable + totalAvailable,
      totalAdditional: acc.totalAdditional + totalAdditional,
      totalRevenue: acc.totalRevenue + (month.additionalMessagesRevenue || 0)
    };
  }, { totalUsed: 0, totalAvailable: 0, totalAdditional: 0, totalRevenue: 0 });

  // Рассчитываем процент использования
  const actualUsagePercent = yearlyStats.totalAvailable > 0 
    ? (yearlyStats.totalUsed / yearlyStats.totalAvailable) * 100 
    : 0;

  // Статистика по тарифам
  const tariffStats = [
    { name: 'API-only ($75)', key: '75', color: 'purple' },
    { name: 'Базовый ($150)', key: '150', color: 'blue' },
    { name: 'Стандарт ($250)', key: '250', color: 'green' },
    { name: 'Премиум ($500)', key: '500', color: 'orange' },
    { name: 'Корпоративный ($1000)', key: '1000', color: 'red' }
  ].map(tariff => {
    const stats = monthlyData.reduce((acc, month) => {
      const used = month[`usedMessages${tariff.key}`] || 0;
      const available = month[`availableMessages${tariff.key}`] || 0;
      const additional = month[`additionalMessages${tariff.key}`] || 0;
      const activeClients = month[`activeClients${tariff.key}`] || 0;
      
      return {
        totalUsed: acc.totalUsed + used,
        totalAvailable: acc.totalAvailable + available,
        totalAdditional: acc.totalAdditional + additional,
        avgClients: acc.avgClients + activeClients / monthlyData.length
      };
    }, { totalUsed: 0, totalAvailable: 0, totalAdditional: 0, avgClients: 0 });

    const usagePercent = stats.totalAvailable > 0 
      ? (stats.totalUsed / stats.totalAvailable) * 100 
      : 0;

    return {
      ...tariff,
      ...stats,
      usagePercent
    };
  });

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          📊 Статистика использования сообщений
          <InfoTooltip text="Анализ использования включенных в тарифы сообщений" />
        </h2>

        {/* Главные показатели */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-700 mb-2">
              Заданный % использования
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              {percent(messageUsagePercentage)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Параметр модели
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-green-700 mb-2">
              Фактический % использования
            </h3>
            <p className="text-2xl font-bold text-green-900">
              {percent(actualUsagePercent)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              От доступных сообщений
            </p>
          </div>

          <div className="bg-orange-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-orange-700 mb-2">
              Доп. сообщения
            </h3>
            <p className="text-2xl font-bold text-orange-900">
              {number(yearlyStats.totalAdditional)}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Сверх пакетов
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-purple-700 mb-2">
              Доход от доп. сообщений
            </h3>
            <p className="text-2xl font-bold text-purple-900">
              ${number(yearlyStats.totalRevenue)}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              За весь период
            </p>
          </div>
        </div>

        {/* Детализация по тарифам */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Использование по тарифам
          </h3>
          
          <div className="space-y-3">
            {tariffStats.map((tariff) => (
              <div key={tariff.key} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium text-${tariff.color}-700`}>
                    {tariff.name}
                  </h4>
                  <span className="text-sm text-gray-600">
                    ~{Math.round(tariff.avgClients)} клиентов в среднем
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Использовано:</span>
                    <p className="font-semibold">{number(tariff.totalUsed)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Доступно:</span>
                    <p className="font-semibold">{number(tariff.totalAvailable)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Дополнительно:</span>
                    <p className="font-semibold">{number(tariff.totalAdditional)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">% использования:</span>
                    <p className={`font-semibold ${
                      tariff.usagePercent > 100 ? 'text-red-600' : 
                      tariff.usagePercent > 80 ? 'text-orange-600' : 
                      'text-green-600'
                    }`}>
                      {percent(tariff.usagePercent)}
                    </p>
                  </div>
                </div>

                {/* Прогресс-бар */}
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-${tariff.color}-500 transition-all duration-300`}
                    style={{ width: `${Math.min(tariff.usagePercent, 100)}%` }}
                  />
                </div>
                {tariff.usagePercent > 100 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Превышение на {(tariff.usagePercent - 100).toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Помесячная динамика */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Помесячная динамика использования
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Месяц</th>
                  <th className="text-right py-2">Использовано</th>
                  <th className="text-right py-2">Доступно</th>
                  <th className="text-right py-2">% исп.</th>
                  <th className="text-right py-2">Доп. сообщения</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => {
                  const monthUsed = (month.usedMessages75 || 0) + 
                                   (month.usedMessages150 || 0) + 
                                   (month.usedMessages250 || 0) + 
                                   (month.usedMessages500 || 0) + 
                                   (month.usedMessages1000 || 0);
                  
                  const monthAvailable = (month.availableMessages75 || 0) + 
                                        (month.availableMessages150 || 0) + 
                                        (month.availableMessages250 || 0) + 
                                        (month.availableMessages500 || 0) + 
                                        (month.availableMessages1000 || 0);
                  
                  const monthAdditional = month.totalAdditionalMessages || 0;
                  const monthUsagePercent = monthAvailable > 0 
                    ? (monthUsed / monthAvailable) * 100 
                    : 0;

                  return (
                    <tr key={month.month} className="border-b hover:bg-gray-50">
                      <td className="py-2">Месяц {month.month}</td>
                      <td className="text-right py-2">{number(monthUsed)}</td>
                      <td className="text-right py-2">{number(monthAvailable)}</td>
                      <td className={`text-right py-2 font-medium ${
                        monthUsagePercent > 100 ? 'text-red-600' : 
                        monthUsagePercent > 80 ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>
                        {percent(monthUsagePercent)}
                      </td>
                      <td className="text-right py-2">{number(monthAdditional)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageUsageStats;