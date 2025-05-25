import React from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';

const MessageUsageFixPanel: React.FC = () => {
  const { 
    messageUsageRate,
    setMessageUsageRate,
    messageUsagePercentage,
    setMessageUsagePercentage
  } = useFinancialContext();

  const fixMessageUsage = () => {
    console.log('🔧 Исправление messageUsageRate...');
    console.log('Было:', messageUsageRate);
    setMessageUsageRate(80); // Восстанавливаем правильное значение
    setMessageUsagePercentage(80);
    console.log('Стало: 80%');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold text-yellow-800 mb-2">⚠️ Проблема с использованием сообщений</h3>
      <p className="text-sm text-yellow-700 mb-3">
        Обнаружено: {messageUsageRate}% (должно быть 80-120%)
      </p>
      {messageUsageRate < 50 && (
        <button
          onClick={fixMessageUsage}
          className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
        >
          Исправить на 80%
        </button>
      )}
      <p className="text-xs text-yellow-600 mt-2">
        Это временная панель для диагностики
      </p>
    </div>
  );
};

export default MessageUsageFixPanel;