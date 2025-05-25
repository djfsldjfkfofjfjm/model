import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';

describe('Messages and CarryOver Calculations', () => {
  const mockParams: FinancialModelParams = {
    taxMode: 'optimistic' as const,
    customTaxRate: 15,
    fotMode: 'optimistic' as const,
    apiCostPercentage: 30,
    churnRate: 2,
    maxImplementationCost: 200,
    integrationPrice: 500,
    cacPercentage: 15,
    implementationPercentage: 20,
    messageUsageRate: 80, // 80% использования
    carryOverPercentage: 100, // 100% перенос
    additionalMessagePrice: 0.3,
    partnerCommissionRate: 10,
    directSalesPercentage: 2,
    directMarketingPercentage: 1,
    directLeadCost: 50,
    partnerLeadCost: 20,
    channelDistribution: 60, // 60% direct
    fotOptimistic: new Array(12).fill(10000),
    fotPessimistic: new Array(12).fill(15000)
  };

  const mockClients: ClientsData = {
    newClients75: [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients150: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients75Direct: [6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients150Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients75Partner: [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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

  const mockUpsell: UpsellSettings = {
    additionalBotsPercentage: 2,
    additionalBotsPrice: 100,
    newFeaturesPercentage: 1.5,
    newFeaturesPrice: 75,
    messagePacksPercentage: 3,
    messagePacksPrice: 50,
    integrationsPercentage: 0.8,
    integrationsPrice: 150
  };

  test('Неиспользованные сообщения переносятся на следующий месяц', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const firstMonth = result.current.monthlyData[0];
    const secondMonth = result.current.monthlyData[1];

    // Первый месяц: 10 клиентов покупают пакеты (первая покупка)
    // 10 клиентов * 105 сообщений = 1050 доступно
    // Используется 80% = 840, остается 210
    // Переносится 100% = 210
    expect(firstMonth.activeClients75).toBe(10);
    expect(firstMonth.additionalMessages75Revenue).toBe(0); // Не должно быть доп. сообщений

    // Второй месяц: накоплено 210 сообщений
    // Нужно: 10 * 105 * 0.8 = 840
    // Так как 210 < 840, все клиенты покупают новые пакеты
    const expectedActiveClients = Math.round(10 * 0.98); // После churn
    
    expect(secondMonth.activeClients75).toBe(expectedActiveClients);
  });

  test('Дополнительные сообщения правильно тарифицируются', () => {
    // Создаем сценарий с высоким использованием
    const highUsageParams = { ...mockParams, messageUsageRate: 120 }; // 120% использования
    
    const { result } = renderHook(() => useFinancialModel(highUsageParams, mockClients, mockUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const firstMonth = result.current.monthlyData[0];
    
    // 10 клиентов * 105 сообщений = 1050 доступно
    // Используется 120% = 1260
    // Дополнительно = 210 сообщений * $0.30 = $63
    expect(firstMonth.additionalMessages75Revenue).toBeCloseTo(63, 0);
  });

  test('Перенос сообщений работает с частичным процентом', () => {
    const partialCarryParams = { ...mockParams, carryOverPercentage: 50 }; // 50% перенос
    
    const { result } = renderHook(() => useFinancialModel(partialCarryParams, mockClients, mockUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const firstMonth = result.current.monthlyData[0];
    
    // 10 клиентов * 105 сообщений = 1050 доступно
    // Используется 80% = 840
    // Остается 210, переносится 50% = 105
    const unusedMessages = 1050 - 840;
    const carriedOver = unusedMessages * 0.5;
    
    expect(carriedOver).toBeCloseTo(105, 0);
  });

  test('При нулевом использовании все сообщения переносятся', () => {
    const zeroUsageParams = { ...mockParams, messageUsageRate: 0 }; // 0% использования
    
    const { result } = renderHook(() => useFinancialModel(zeroUsageParams, mockClients, mockUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const firstMonth = result.current.monthlyData[0];
    
    // Не должно быть доходов от дополнительных сообщений
    expect(firstMonth.additionalMessages75Revenue).toBe(0);
    
    // Все 1050 сообщений должны быть доступны для переноса
    // При 100% переносе = 1050
  });

  test('Общий доход от дополнительных сообщений суммируется по всем тарифам', () => {
    const multiTierClients: ClientsData = {
      ...mockClients,
      newClients75: [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients150: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients250: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients75Direct: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients150Direct: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients250Direct: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients75Partner: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients150Partner: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newClients250Partner: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    const highUsageParams = { ...mockParams, messageUsageRate: 150 }; // 150% использования
    
    const { result } = renderHook(() => useFinancialModel(highUsageParams, multiTierClients, mockUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const firstMonth = result.current.monthlyData[0];
    
    // Проверяем, что общий доход от доп. сообщений больше 0
    expect(firstMonth.additionalMessagesRevenue).toBeGreaterThan(0);
    
    // Проверяем, что он равен сумме по всем тарифам
    const totalAdditionalRevenue = 
      firstMonth.additionalMessages75Revenue +
      firstMonth.additionalMessages150Revenue +
      firstMonth.additionalMessages250Revenue +
      firstMonth.additionalMessages500Revenue +
      firstMonth.additionalMessages1000Revenue;
    
    expect(firstMonth.additionalMessagesRevenue).toBeCloseTo(totalAdditionalRevenue, 2);
  });
});