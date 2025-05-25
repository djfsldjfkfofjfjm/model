import React, { useMemo } from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';

const MessageSystemDiagnostic: React.FC = () => {
  const { 
    messageUsageRate,
    additionalMessagePrice,
    apiCostPercentage,
    monthlyData,
    subscriptionPrice75,
    messages75
  } = useFinancialContext();

  // Расчёт для демонстрации проблемы (1 клиент тарифа $75)
  const analysis = useMemo(() => {
    const packageSize = messages75;
    const usedMessages = packageSize * (messageUsageRate / 100);
    const additionalMessages = Math.max(0, usedMessages - packageSize);
    
    const subscriptionRevenue = subscriptionPrice75;
    const additionalRevenue = additionalMessages * additionalMessagePrice;
    const totalRevenue = subscriptionRevenue + additionalRevenue;
    
    const apiCosts = totalRevenue * (apiCostPercentage / 100);
    const netRevenue = totalRevenue - apiCosts;
    
    return {
      packageSize,
      usedMessages: Math.round(usedMessages),
      additionalMessages: Math.round(additionalMessages),
      subscriptionRevenue,
      additionalRevenue: additionalRevenue.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      apiCosts: apiCosts.toFixed(2),
      netRevenue: netRevenue.toFixed(2)
    };
  }, [messageUsageRate, additionalMessagePrice, apiCostPercentage, subscriptionPrice75, messages75]);

  // Цвет индикатора
  const getColor = (value: number) => {
    if (value < 80) return 'text-yellow-600';
    if (value > 120) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🔍 Диагностика системы сообщений
        <span className="text-sm font-normal text-gray-500">
          (пример для 1 клиента тарифа ${subscriptionPrice75})
        </span>
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Левая колонка - Использование */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 border-b pb-2">Использование сообщений</h4>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Размер пакета:</span>
            <span className="font-mono">{analysis.packageSize} сообщ.</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Использование:</span>
            <span className={`font-mono font-semibold ${getColor(messageUsageRate)}`}>
              {messageUsageRate}% = {analysis.usedMessages} сообщ.
            </span>
          </div>
          
          {analysis.additionalMessages > 0 && (
            <div className="flex justify-between items-center bg-red-50 p-2 rounded">
              <span className="text-red-700">Превышение:</span>
              <span className="font-mono text-red-700 font-semibold">
                +{analysis.additionalMessages} сообщ.
              </span>
            </div>
          )}
        </div>

        {/* Правая колонка - Финансы */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 border-b pb-2">Финансовый эффект</h4>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Подписка:</span>
            <span className="font-mono">${analysis.subscriptionRevenue}</span>
          </div>
          
          {parseFloat(analysis.additionalRevenue) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Доп. сообщения:</span>
              <span className="font-mono text-red-600">+${analysis.additionalRevenue}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center font-semibold border-t pt-2">
            <span>Общая выручка:</span>
            <span className="font-mono">${analysis.totalRevenue}</span>
          </div>
          
          <div className="flex justify-between items-center text-red-600">
            <span>API costs ({apiCostPercentage}%):</span>
            <span className="font-mono">-${analysis.apiCosts}</span>
          </div>
          
          <div className="flex justify-between items-center font-semibold border-t pt-2">
            <span>Чистая выручка:</span>
            <span className={`font-mono ${parseFloat(analysis.netRevenue) < parseFloat(analysis.subscriptionRevenue) * 0.7 ? 'text-red-600' : 'text-green-600'}`}>
              ${analysis.netRevenue}
            </span>
          </div>
        </div>
      </div>

      {/* Предупреждение */}
      {messageUsageRate > 100 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Внимание:</strong> При использовании {'>'}100% клиенты платят за дополнительные сообщения, 
            что увеличивает API costs и может снижать маржинальность!
          </p>
        </div>
      )}

      {/* Рекомендация */}
      <div className="mt-4 text-xs text-gray-500">
        <strong>💡 Совет:</strong> Оптимальное использование 80-100% максимизирует прибыль без дополнительных расходов.
      </div>
    </div>
  );
};

export default MessageSystemDiagnostic;