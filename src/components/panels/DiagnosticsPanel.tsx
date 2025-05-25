import React from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';

const DiagnosticsPanel: React.FC = () => {
  const { 
    messageUsageRate,
    messageUsagePercentage,
    monthlyData,
    totalData
  } = useFinancialContext();

  const firstMonth = monthlyData[0] || {};
  const lastMonth = monthlyData[11] || {};

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">🔍 Диагностика системы сообщений</h2>
      
      <div className="space-y-4">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="font-medium text-gray-700">Параметры в контексте:</h3>
          <p className="text-sm text-gray-600">messageUsageRate: {messageUsageRate}%</p>
          <p className="text-sm text-gray-600">messageUsagePercentage: {messageUsagePercentage}%</p>
        </div>

        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="font-medium text-gray-700">Первый месяц:</h3>
          <p className="text-sm text-gray-600">Активные клиенты: {firstMonth.totalActiveClients || 0}</p>
          <p className="text-sm text-gray-600">Использовано сообщений (всего): {Math.round(
            (firstMonth.usedMessages75 || 0) +
            (firstMonth.usedMessages150 || 0) +
            (firstMonth.usedMessages250 || 0) +
            (firstMonth.usedMessages500 || 0) +
            (firstMonth.usedMessages1000 || 0)
          )}</p>
          <p className="text-sm text-gray-600">Доступно сообщений (всего): {Math.round(
            (firstMonth.availableMessages75 || 0) +
            (firstMonth.availableMessages150 || 0) +
            (firstMonth.availableMessages250 || 0) +
            (firstMonth.availableMessages500 || 0) +
            (firstMonth.availableMessages1000 || 0)
          )}</p>
        </div>

        <div className="border-l-4 border-yellow-500 pl-4">
          <h3 className="font-medium text-gray-700">Последний месяц:</h3>
          <p className="text-sm text-gray-600">Активные клиенты: {lastMonth.totalActiveClients || 0}</p>
          <p className="text-sm text-gray-600">Дополнительные сообщения: {lastMonth.totalAdditionalMessages || 0}</p>
          <p className="text-sm text-gray-600">Выручка от доп. сообщений: ${lastMonth.additionalMessagesRevenue || 0}</p>
        </div>

        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="font-medium text-gray-700">Проверка расчётов:</h3>
          {firstMonth.activeClients75 > 0 && (
            <p className="text-sm text-gray-600">
              Тариф $75: {firstMonth.activeClients75} клиентов × 105 сообщений × {messageUsageRate}% = {
                Math.round(firstMonth.activeClients75 * 105 * messageUsageRate / 100)
              } использовано
            </p>
          )}
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Если отображается 10% вместо ожидаемых 80%, проверьте:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700 list-disc list-inside">
            <li>Не изменили ли вы значение вручную</li>
            <li>Правильно ли сохранилось значение после изменения</li>
            <li>Обновилась ли модель после изменения параметра</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPanel;