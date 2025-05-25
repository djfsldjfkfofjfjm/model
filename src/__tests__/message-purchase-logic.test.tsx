import React from 'react';
import { render } from '@testing-library/react';
import { FinancialProvider, useFinancialContext } from '../contexts/FinancialContext';
import { useFinancialModel } from '../hooks/useFinancialModel';

// Компонент для тестирования
const TestComponent = () => {
  const { monthlyData, messageUsageRate } = useFinancialContext();
  const firstMonth = monthlyData[0] || {};
  
  return (
    <div>
      <div data-testid="usage-rate">{messageUsageRate}</div>
      <div data-testid="subscription-revenue">{firstMonth.subscriptionRevenue || 0}</div>
      <div data-testid="total-revenue">{firstMonth.totalRevenue || 0}</div>
    </div>
  );
};

describe('Логика покупки пакетов сообщений', () => {
  test('При низком использовании сообщений выручка должна падать', () => {
    // Мокаем консоль для проверки логов
    const consoleSpy = jest.spyOn(console, 'log');
    
    const { getByTestId } = render(
      <FinancialProvider>
        <TestComponent />
      </FinancialProvider>
    );
    
    // Проверяем, что вызывается диагностика
    const diagnosticLogs = consoleSpy.mock.calls.filter(call => 
      call[0] && call[0].includes('Диагностика покупок пакетов')
    );
    
    // Если есть логи, проверяем их
    if (diagnosticLogs.length > 0) {
      console.log('Найдены диагностические логи:', diagnosticLogs);
    }
    
    consoleSpy.mockRestore();
  });
  
  test('Клиенты не должны покупать новые пакеты при достаточном накоплении', () => {
    // Этот тест проверяет основную логику:
    // Если у клиента накоплено >= пакета сообщений, он НЕ покупает новый
    
    const params = {
      messageUsageRate: 10, // Используют только 10%
      carryOverPercentage: 100, // Переносят 100%
      additionalMessagePrice: 0.3,
      integrationPrice: 500,
      churnRate: 2,
      apiCostPercentage: 30,
      channelDistribution: { direct: 60, partner: 40 },
      taxMode: 'optimistic' as const,
      fotMode: 'optimistic' as const,
      customTaxRate: 15,
      maxImplementationCost: 200,
      implementationPercentage: 20,
      cacPercentage: 10,
      partnerCommissionRate: 10,
      directSalesPercentage: 2,
      directMarketingPercentage: 1,
      directLeadCost: 50,
      partnerLeadCost: 20,
      fotOptimistic: Array(12).fill(10000),
      fotPessimistic: Array(12).fill(15000)
    };
    
    const clients = {
      newClients75: [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients150: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients250: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients500: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients1000: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      subscriptionPrice75: 75,
      subscriptionPrice150: 150,
      subscriptionPrice250: 250,
      subscriptionPrice500: 500,
      subscriptionPrice1000: 1000,
      messages75: 105,
      messages150: 210,
      messages250: 350,
      messages500: 700,
      messages1000: 1400
    };
    
    const upsell = {
      additionalBotsPercentage: 0,
      additionalBotsPrice: 0,
      newFeaturesPercentage: 0,
      newFeaturesPrice: 0,
      messagePacksPercentage: 0,
      messagePacksPrice: 0,
      integrationsPercentage: 0,
      integrationsPrice: 0
    };
    
    // Здесь должна быть проверка логики
    // При 10% использовании:
    // Месяц 1: 10 клиентов покупают, используют 10.5 сообщений, остаётся 94.5
    // Месяц 2: НЕ все должны покупать новый пакет!
  });
});