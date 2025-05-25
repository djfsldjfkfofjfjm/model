import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';

describe('Влияние процента использования сообщений на прибыль', () => {
  const baseParams: FinancialModelParams = {
    taxMode: 'optimistic',
    customTaxRate: 15,
    fotMode: 'optimistic',
    apiCostPercentage: 30,
    churnRate: 2,
    maxImplementationCost: 200,
    integrationPrice: 500,
    cacPercentage: 50,
    implementationPercentage: 20,
    partnerCommissionRate: 10,
    messageUsageRate: 80, // будем менять
    carryOverPercentage: 100,
    additionalMessagePrice: 0.30,
    fotOptimistic: Array(12).fill(5000),
    fotPessimistic: Array(12).fill(7000),
    channelDistribution: { direct: 60, partner: 40 },
    directSalesPercentage: 2,
    directMarketingPercentage: 1,
    directLeadCost: 50,
    partnerLeadCost: 20
  };

  const activeClients: ClientsData = {
    newClients75: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    newClients150: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    newClients250: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    newClients500: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    newClients1000: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    subscriptionPrice75: 75,
    subscriptionPrice150: 150,
    subscriptionPrice250: 250,
    subscriptionPrice500: 500,
    subscriptionPrice1000: 1000,
    messages75: 105,
    messages150: 210,
    messages250: 350,
    messages500: 700,
    messages1000: 1400,
    integrationPrice: 500
  };

  const defaultUpsell: UpsellSettings = {
    additionalBotsPercentage: 2,
    additionalBotsPrice: 100,
    newFeaturesPercentage: 1.5,
    newFeaturesPrice: 75,
    messagePacksPercentage: 3,
    messagePacksPrice: 50,
    integrationsPercentage: 0.8,
    integrationsPrice: 150
  };

  test('Анализ влияния процента использования на финансовые показатели', () => {
    const scenarios = [
      { usage: 50, description: 'Низкое использование' },
      { usage: 80, description: 'Нормальное использование' },
      { usage: 100, description: 'Полное использование' },
      { usage: 120, description: 'Превышение на 20%' },
      { usage: 150, description: 'Превышение на 50%' }
    ];

    const results = scenarios.map(scenario => {
      const params = { ...baseParams, messageUsageRate: scenario.usage };
      const { result } = renderHook(() => 
        useFinancialModel(params, activeClients, defaultUpsell)
      );
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      return {
        usage: scenario.usage,
        description: scenario.description,
        totalRevenue: result.current.totalData.totalRevenue,
        subscriptionRevenue: result.current.totalData.totalSubscription,
        additionalMessagesRevenue: result.current.totalData.totalAdditionalMessagesRevenue,
        apiCosts: result.current.totalData.totalApiCosts,
        netProfit: result.current.totalData.totalNetProfit,
        profitMargin: result.current.totalData.profitMargin
      };
    });

    console.log('\n📊 АНАЛИЗ ВЛИЯНИЯ ИСПОЛЬЗОВАНИЯ СООБЩЕНИЙ НА ПРИБЫЛЬ:\n');
    console.log('%-ное использование | Общая выручка | Подписки | Доп. сообщения | API costs | Чистая прибыль | Маржа %');
    console.log(''.padEnd(100, '-'));
    
    results.forEach(r => {
      console.log(
        `${r.usage.toString().padEnd(18)} | ` +
        `$${r.totalRevenue.toFixed(0).padEnd(13)} | ` +
        `$${r.subscriptionRevenue.toFixed(0).padEnd(8)} | ` +
        `$${r.additionalMessagesRevenue.toFixed(0).padEnd(14)} | ` +
        `$${r.apiCosts.toFixed(0).padEnd(9)} | ` +
        `$${r.netProfit.toFixed(0).padEnd(14)} | ` +
        `${r.profitMargin.toFixed(1)}%`
      );
    });

    // Проверяем логичность результатов
    // 1. При увеличении использования должна расти выручка от доп. сообщений
    expect(results[4].additionalMessagesRevenue).toBeGreaterThan(results[3].additionalMessagesRevenue);
    expect(results[3].additionalMessagesRevenue).toBeGreaterThan(results[2].additionalMessagesRevenue);
    
    // 2. API costs должны расти с ростом доп. сообщений
    expect(results[4].apiCosts).toBeGreaterThan(results[0].apiCosts);
    
    // 3. Выручка от подписок должна быть одинаковой (все платят каждый месяц)
    expect(results[0].subscriptionRevenue).toBe(results[4].subscriptionRevenue);
    
    console.log('\n✅ Все проверки пройдены! Система работает корректно.');
  });
});