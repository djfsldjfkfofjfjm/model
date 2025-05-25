import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';

describe('Детальная проверка системы сообщений', () => {
  const defaultParams: FinancialModelParams = {
    taxMode: 'optimistic',
    customTaxRate: 15,
    fotMode: 'optimistic',
    apiCostPercentage: 30,
    churnRate: 0, // Отключаем отток для чистоты теста
    maxImplementationCost: 200,
    integrationPrice: 500,
    cacPercentage: 50,
    implementationPercentage: 20,
    partnerCommissionRate: 10,
    messageUsageRate: 80, // 80% использования
    carryOverPercentage: 100, // 100% переносится
    additionalMessagePrice: 0.30,
    fotOptimistic: Array(12).fill(1000),
    fotPessimistic: Array(12).fill(2000),
    channelDistribution: { direct: 60, partner: 40 },
    directSalesPercentage: 2,
    directMarketingPercentage: 1,
    directLeadCost: 50,
    partnerLeadCost: 20
  };

  const defaultClients: ClientsData = {
    newClients75: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1 клиент тарифа $75 в первый месяц
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
    messages1000: 1400,
    integrationPrice: 500
  };

  const defaultUpsell: UpsellSettings = {
    additionalBotsPercentage: 0,
    additionalBotsPrice: 0,
    newFeaturesPercentage: 0,
    newFeaturesPrice: 0,
    messagePacksPercentage: 0,
    messagePacksPrice: 0,
    integrationsPercentage: 0,
    integrationsPrice: 0
  };

  test('Клиенты должны платить подписку каждый месяц независимо от накопленных сообщений', () => {
    const { result } = renderHook(() => 
      useFinancialModel(defaultParams, defaultClients, defaultUpsell)
    );
    
    act(() => {
      result.current.calculateFinancialModel();
    });
    const monthlyData = result.current.monthlyData;

    // Проверяем каждый месяц
    for (let i = 0; i < 12; i++) {
      const month = monthlyData[i];
      console.log(`Месяц ${i + 1}:`, {
        'Активные клиенты $75': month.activeClients75,
        'Выручка от подписок $75': month.subscriptionRevenue75,
        'Накоплено сообщений': month.unusedMessages75
      });

      // В SaaS модели ВСЕ активные клиенты платят подписку
      expect(month.subscriptionRevenue75).toBe(
        month.activeClients75 * 75,
        `Месяц ${i + 1}: Выручка должна = активные клиенты * цена подписки`
      );
    }
  });

  test('При 80% использовании не должно быть дополнительных сообщений', () => {
    const { result } = renderHook(() => 
      useFinancialModel(defaultParams, defaultClients, defaultUpsell)
    );
    
    act(() => {
      result.current.calculateFinancialModel();
    });
    const monthlyData = result.current.monthlyData;

    monthlyData.forEach((month, index) => {
      console.log(`Месяц ${index + 1} - Использование сообщений:`, {
        'Доступно': month.availableMessages75,
        'Использовано': month.usedMessages75,
        'Дополнительные': month.additionalMessages75
      });

      // При 80% использовании не должно быть превышения
      expect(month.additionalMessages75).toBe(0);
    });
  });

  test('При 120% использовании должны появиться дополнительные сообщения', () => {
    const highUsageParams = { ...defaultParams, messageUsageRate: 120 };
    
    const { result } = renderHook(() => 
      useFinancialModel(highUsageParams, defaultClients, defaultUpsell)
    );
    
    act(() => {
      result.current.calculateFinancialModel();
    });
    const firstMonth = result.current.monthlyData[0];

    const expectedUsed = 1 * 105 * 1.2; // 126 сообщений
    const expectedAdditional = expectedUsed - 105; // 21 сообщение

    expect(firstMonth.additionalMessages75).toBe(21);
    expect(firstMonth.additionalMessagesRevenue).toBeCloseTo(21 * 0.30, 2);
  });

  test('Накопление сообщений должно работать правильно', () => {
    const lowUsageParams = { ...defaultParams, messageUsageRate: 50 }; // 50% использования
    
    const { result } = renderHook(() => 
      useFinancialModel(lowUsageParams, defaultClients, defaultUpsell)
    );
    
    act(() => {
      result.current.calculateFinancialModel();
    });
    const monthlyData = result.current.monthlyData;

    // Месяц 1: использовано 52.5, осталось 52.5
    expect(monthlyData[0].unusedMessages75).toBe(52.5);
    
    // Месяц 2: было 52.5 + новые 105 = 157.5 доступно
    // Использовано 52.5, осталось 105
    expect(monthlyData[1].unusedMessages75).toBe(105);
  });

  test('Изменение процента использования должно влиять на прибыль правильно', () => {
    // Тест с низким использованием
    const lowUsage = { ...defaultParams, messageUsageRate: 50 };
    const { result: lowResult } = renderHook(() => 
      useFinancialModel(lowUsage, defaultClients, defaultUpsell)
    );
    act(() => {
      lowResult.current.calculateFinancialModel();
    });

    // Тест с высоким использованием  
    const highUsage = { ...defaultParams, messageUsageRate: 150 };
    const { result: highResult } = renderHook(() => 
      useFinancialModel(highUsage, defaultClients, defaultUpsell)
    );
    act(() => {
      highResult.current.calculateFinancialModel();
    });

    const lowProfit = lowResult.current.totalData.totalNetProfit;
    const highProfit = highResult.current.totalData.totalNetProfit;

    console.log('Влияние использования на прибыль:', {
      'При 50% использовании': lowProfit,
      'При 150% использовании': highProfit,
      'Разница': highProfit - lowProfit
    });

    // При высоком использовании прибыль должна быть выше из-за доп. сообщений
    // НО также растут API costs!
    expect(highProfit).not.toBe(lowProfit);
  });
});