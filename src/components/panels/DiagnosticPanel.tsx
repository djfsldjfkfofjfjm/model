import React from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';

const DiagnosticPanel: React.FC = () => {
  const { 
    messageUsageRate,
    carryOverPercentage,
    additionalMessagePrice,
    monthlyData
  } = useFinancialContext();

  // Получаем данные первого месяца для диагностики
  const firstMonth = monthlyData[0];

  return (
    <div className="fixed bottom-4 left-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold text-blue-800 mb-2">🔬 Диагностика параметров сообщений</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold">Текущие параметры:</span>
          <ul className="ml-4 mt-1">
            <li>• Использование: <span className="font-mono bg-blue-100 px-1">{messageUsageRate}%</span></li>
            <li>• Перенос: <span className="font-mono bg-blue-100 px-1">{carryOverPercentage}%</span></li>
            <li>• Цена доп.: <span className="font-mono bg-blue-100 px-1">${additionalMessagePrice}</span></li>
          </ul>
        </div>

        {firstMonth && (
          <div>
            <span className="font-semibold">Результат (месяц 1):</span>
            <ul className="ml-4 mt-1">
              <li>• Доп. сообщения: <span className="font-mono bg-blue-100 px-1">{firstMonth.totalAdditionalMessages || 0}</span></li>
              <li>• Выручка от доп.: <span className="font-mono bg-blue-100 px-1">${firstMonth.additionalMessagesRevenue?.toFixed(2) || 0}</span></li>
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-blue-600 mt-3">
        Откройте консоль (F12) для детальных логов
      </p>
    </div>
  );
};

export default DiagnosticPanel;