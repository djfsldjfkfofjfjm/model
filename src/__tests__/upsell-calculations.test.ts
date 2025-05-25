import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';

describe('Upsell Calculations', () => {
  const baseParams: FinancialModelParams = {
    taxMode: 'optimistic' as const,
    customTaxRate: 15,
    fotMode: 'optimistic' as const,
    apiCostPercentage: 30,
    churnRate: 2,
    maxImplementationCost: 200,
    integrationPrice: 500,
    cacPercentage: 15,
    implementationPercentage: 20,
    messageUsageRate: 80,
    carryOverPercentage: 100,
    additionalMessagePrice: 0.3,
    partnerCommissionRate: 10,
    directSalesPercentage: 2,
    directMarketingPercentage: 1,
    directLeadCost: 50,
    partnerLeadCost: 20,
    channelDistribution: 60,
    fotOptimistic: new Array(12).fill(0), // Убираем ФОТ для чистоты тестов
    fotPessimistic: new Array(12).fill(0)
  };

  const mockClients: ClientsData = {
    newClients75: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 100 клиентов для простоты расчетов
    newClients150: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients75Direct: [60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients150Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients75Partner: [40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients150Partner: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250Partner: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500Partner: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000Partner: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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

  test('Upsell доходы рассчитываются по каждой категории', () => {
    const upsellSettings: UpsellSettings = {
      additionalBotsPercentage: 2,    // 2% клиентов
      additionalBotsPrice: 100,        // $100 за бота
      newFeaturesPercentage: 1.5,      // 1.5% клиентов
      newFeaturesPrice: 75,            // $75 за функции
      messagePacksPercentage: 3,       // 3% клиентов
      messagePacksPrice: 50,           // $50 за пакет
      integrationsPercentage: 0.8,     // 0.8% клиентов
      integrationsPrice: 150           // $150 за интеграцию
    };

    const { result } = renderHook(() => useFinancialModel(baseParams, mockClients, upsellSettings));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const firstMonth = result.current.monthlyData[0];
    
    // 100 активных клиентов
    expect(firstMonth.totalActiveClients).toBe(100);
    
    // Расчет по категориям:
    // Боты: 100 * 2% * $100 = $200
    expect(firstMonth.upsellAdditionalBots).toBeCloseTo(200, 2);
    
    // Функции: 100 * 1.5% * $75 = $112.50
    expect(firstMonth.upsellNewFeatures).toBeCloseTo(112.50, 2);
    
    // Пакеты сообщений: 100 * 3% * $50 = $150
    expect(firstMonth.upsellMessagePacks).toBeCloseTo(150, 2);
    
    // Интеграции: 100 * 0.8% * $150 = $120
    expect(firstMonth.upsellIntegrations).toBeCloseTo(120, 2);
    
    // Общий upsell: $200 + $112.50 + $150 + $120 = $582.50
    expect(firstMonth.upsellRevenue).toBeCloseTo(582.50, 2);
  });

  test('Upsell применяется к активным клиентам с учетом churn', () => {
    const upsellSettings: UpsellSettings = {
      additionalBotsPercentage: 10,    // 10% для простоты
      additionalBotsPrice: 100,
      newFeaturesPercentage: 0,
      newFeaturesPrice: 0,
      messagePacksPercentage: 0,
      messagePacksPrice: 0,
      integrationsPercentage: 0,
      integrationsPrice: 0
    };

    const { result } = renderHook(() => useFinancialModel(baseParams, mockClients, upsellSettings));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    // Проверяем несколько месяцев
    const firstMonth = result.current.monthlyData[0];
    const secondMonth = result.current.monthlyData[1];
    const thirdMonth = result.current.monthlyData[2];
    
    // Первый месяц: 100 клиентов * 10% * $100 = $1000
    expect(firstMonth.upsellRevenue).toBeCloseTo(1000, 2);
    
    // Второй месяц: ~98 клиентов (после 2% churn) * 10% * $100 = ~$980
    expect(secondMonth.upsellRevenue).toBeLessThan(1000);
    expect(secondMonth.upsellRevenue).toBeGreaterThan(950);
    
    // Третий месяц: еще меньше из-за churn
    expect(thirdMonth.upsellRevenue).toBeLessThan(secondMonth.upsellRevenue);
  });

  test('Нулевые проценты upsell дают нулевой доход', () => {
    const zeroUpsell: UpsellSettings = {
      additionalBotsPercentage: 0,
      additionalBotsPrice: 100,
      newFeaturesPercentage: 0,
      newFeaturesPrice: 75,
      messagePacksPercentage: 0,
      messagePacksPrice: 50,
      integrationsPercentage: 0,
      integrationsPrice: 150
    };

    const { result } = renderHook(() => useFinancialModel(baseParams, mockClients, zeroUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    result.current.monthlyData.forEach((month) => {
      expect(month.upsellRevenue).toBe(0);
      expect(month.upsellAdditionalBots).toBe(0);
      expect(month.upsellNewFeatures).toBe(0);
      expect(month.upsellMessagePacks).toBe(0);
      expect(month.upsellIntegrations).toBe(0);
    });
    
    expect(result.current.totalData.totalUpsellRevenue).toBe(0);
  });

  test('Upsell влияет на общую выручку и метрики', () => {
    const highUpsell: UpsellSettings = {
      additionalBotsPercentage: 5,
      additionalBotsPrice: 200,
      newFeaturesPercentage: 5,
      newFeaturesPrice: 100,
      messagePacksPercentage: 10,
      messagePacksPrice: 75,
      integrationsPercentage: 2,
      integrationsPrice: 300
    };

    const { result } = renderHook(() => useFinancialModel(baseParams, mockClients, highUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const firstMonth = result.current.monthlyData[0];
    
    // Проверяем, что upsell включен в общую выручку
    const expectedUpsell = 
      100 * 0.05 * 200 +  // Боты: $1000
      100 * 0.05 * 100 +  // Функции: $500
      100 * 0.10 * 75 +   // Пакеты: $750
      100 * 0.02 * 300;   // Интеграции: $600
    // Итого: $2850
    
    expect(firstMonth.upsellRevenue).toBeCloseTo(2850, 2);
    
    // Проверяем, что общая выручка включает upsell
    const baseRevenue = firstMonth.integrationRevenue + firstMonth.subscriptionRevenue + 
                       firstMonth.additionalMessagesRevenue;
    expect(firstMonth.totalRevenue).toBeCloseTo(baseRevenue + 2850, 2);
    
    // Проверяем влияние на ARPU
    expect(result.current.totalData.avgArpu).toBeGreaterThan(75); // Больше базовой подписки
  });

  test('Upsell суммируется корректно за весь период', () => {
    const consistentUpsell: UpsellSettings = {
      additionalBotsPercentage: 1,
      additionalBotsPrice: 100,
      newFeaturesPercentage: 1,
      newFeaturesPrice: 100,
      messagePacksPercentage: 1,
      messagePacksPrice: 100,
      integrationsPercentage: 1,
      integrationsPrice: 100
    };

    const { result } = renderHook(() => useFinancialModel(baseParams, mockClients, consistentUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    // Сумма помесячных upsell должна равняться общему
    const monthlyUpsellSum = result.current.monthlyData.reduce(
      (sum, month) => sum + month.upsellRevenue, 
      0
    );
    
    expect(result.current.totalData.totalUpsellRevenue).toBeCloseTo(monthlyUpsellSum, 2);
    
    // Проверяем детализацию по категориям
    const monthlyBotsSum = result.current.monthlyData.reduce(
      (sum, month) => sum + month.upsellAdditionalBots, 
      0
    );
    const monthlyFeaturesSum = result.current.monthlyData.reduce(
      (sum, month) => sum + month.upsellNewFeatures, 
      0
    );
    const monthlyPacksSum = result.current.monthlyData.reduce(
      (sum, month) => sum + month.upsellMessagePacks, 
      0
    );
    const monthlyIntegrationsSum = result.current.monthlyData.reduce(
      (sum, month) => sum + month.upsellIntegrations, 
      0
    );
    
    const categoriesSum = monthlyBotsSum + monthlyFeaturesSum + monthlyPacksSum + monthlyIntegrationsSum;
    expect(result.current.totalData.totalUpsellRevenue).toBeCloseTo(categoriesSum, 2);
  });

  test('Upsell работает с разными тарифами клиентов', () => {
    const mixedClients: ClientsData = {
      ...mockClients,
      newClients75: [20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients150: [20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients250: [20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients500: [20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients1000: [20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients75Direct: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients150Direct: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients250Direct: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients500Direct: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients1000Direct: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients75Partner: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients150Partner: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients250Partner: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients500Partner: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients1000Partner: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    const simpleUpsell: UpsellSettings = {
      additionalBotsPercentage: 10,
      additionalBotsPrice: 100,
      newFeaturesPercentage: 0,
      newFeaturesPrice: 0,
      messagePacksPercentage: 0,
      messagePacksPrice: 0,
      integrationsPercentage: 0,
      integrationsPrice: 0
    };

    const { result } = renderHook(() => useFinancialModel(baseParams, mixedClients, simpleUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const firstMonth = result.current.monthlyData[0];
    
    // 100 клиентов всего (20 * 5 тарифов)
    expect(firstMonth.totalActiveClients).toBe(100);
    
    // Upsell применяется ко всем клиентам независимо от тарифа
    // 100 * 10% * $100 = $1000
    expect(firstMonth.upsellRevenue).toBeCloseTo(1000, 2);
  });
});