import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';

describe('Логика покупки пакетов диалогов', () => {
  const baseParams: FinancialModelParams = {
    taxMode: 'optimistic',
    customTaxRate: 15,
    fotMode: 'optimistic',
    apiCostPercentage: 30,
    churnRate: 0,
    maxImplementationCost: 200,
    integrationPrice: 500,
    cacPercentage: 50,
    implementationPercentage: 20,
    partnerCommissionRate: 10,
    messageUsageRate: 100, // будем менять
    carryOverPercentage: 100,
    additionalMessagePrice: 0.30,
    fotOptimistic: Array(12).fill(1000),
    fotPessimistic: Array(12).fill(2000),
    channelDistribution: { direct: 60, partner: 40 },
    directSalesPercentage: 2,
    directMarketingPercentage: 1,
    directLeadCost: 50,
    partnerLeadCost: 20
  };

  const oneClient: ClientsData = {
    newClients75: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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

  const noUpsell: UpsellSettings = {
    additionalBotsPercentage: 0,
    additionalBotsPrice: 0,
    newFeaturesPercentage: 0,
    newFeaturesPrice: 0,
    messagePacksPercentage: 0,
    messagePacksPrice: 0,
    integrationsPercentage: 0,
    integrationsPrice: 0
  };

  test('При 100% использовании клиент покупает пакет каждый месяц', () => {
    const params = { ...baseParams, messageUsageRate: 100 };
    const { result } = renderHook(() => 
      useFinancialModel(params, oneClient, noUpsell)
    );
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const monthlyData = result.current.monthlyData;
    
    console.log('\n📊 Тест: 100% использование - покупка каждый месяц');
    monthlyData.forEach((month, i) => {
      console.log(`Месяц ${i + 1}: Накоплено=${month.unusedMessages75}, Покупка=${month.subscriptionRevenue75 > 0 ? 'ДА' : 'НЕТ'}`);
      
      // При 100% использовании не должно быть накопления
      expect(month.unusedMessages75).toBe(0);
      // Должна быть покупка каждый месяц
      expect(month.subscriptionRevenue75).toBe(75);
    });
  });

  test('При 50% использовании покупки происходят реже', () => {
    const params = { ...baseParams, messageUsageRate: 50 };
    const { result } = renderHook(() => 
      useFinancialModel(params, oneClient, noUpsell)
    );
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const monthlyData = result.current.monthlyData;
    const totalPurchases = monthlyData.filter(m => m.subscriptionRevenue75 > 0).length;
    
    console.log('\n📊 Тест: 50% использование - покупки через месяц');
    monthlyData.forEach((month, i) => {
      console.log(`Месяц ${i + 1}: Накоплено=${month.unusedMessages75}, Покупка=${month.subscriptionRevenue75 > 0 ? 'ДА' : 'НЕТ'}`);
    });
    
    // При 50% использовании покупок должно быть меньше 12
    expect(totalPurchases).toBeLessThan(12);
    expect(totalPurchases).toBeGreaterThan(0);
  });

  test('При очень низком использовании (20%) покупки редкие', () => {
    const params = { ...baseParams, messageUsageRate: 20 };
    const { result } = renderHook(() => 
      useFinancialModel(params, oneClient, noUpsell)
    );
    
    act(() => {
      result.current.calculateFinancialModel();
    });

    const monthlyData = result.current.monthlyData;
    const totalPurchases = monthlyData.filter(m => m.subscriptionRevenue75 > 0).length;
    
    console.log('\n📊 Тест: 20% использование - редкие покупки');
    let purchaseMonths = [];
    monthlyData.forEach((month, i) => {
      if (month.subscriptionRevenue75 > 0) {
        purchaseMonths.push(i + 1);
      }
      console.log(`Месяц ${i + 1}: Накоплено=${month.unusedMessages75}, Покупка=${month.subscriptionRevenue75 > 0 ? 'ДА' : 'НЕТ'}`);
    });
    
    console.log(`Покупки в месяцах: ${purchaseMonths.join(', ')}`);
    
    // При 20% использовании покупок должно быть очень мало
    expect(totalPurchases).toBeLessThanOrEqual(3);
  });

  test('Общая выручка от подписок зависит от процента использования', () => {
    const scenarios = [
      { usage: 20, expected: 'очень низкая' },
      { usage: 50, expected: 'средняя' },
      { usage: 80, expected: 'высокая' },
      { usage: 100, expected: 'максимальная' },
      { usage: 120, expected: 'максимальная + доп. сообщения' }
    ];

    const results = scenarios.map(scenario => {
      const params = { ...baseParams, messageUsageRate: scenario.usage };
      const { result } = renderHook(() => 
        useFinancialModel(params, oneClient, noUpsell)
      );
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      return {
        usage: scenario.usage,
        subscriptionRevenue: result.current.totalData.totalSubscription,
        additionalMessagesRevenue: result.current.totalData.totalAdditionalMessagesRevenue
      };
    });

    console.log('\n📊 Влияние процента использования на выручку:');
    results.forEach(r => {
      console.log(`${r.usage}% использования: Подписки=$${r.subscriptionRevenue}, Доп.сообщения=$${r.additionalMessagesRevenue}`);
    });

    // Проверяем логичность
    expect(results[0].subscriptionRevenue).toBeLessThan(results[3].subscriptionRevenue); // 20% < 100%
    expect(results[1].subscriptionRevenue).toBeLessThan(results[3].subscriptionRevenue); // 50% < 100%
    expect(results[4].additionalMessagesRevenue).toBeGreaterThan(0); // При 120% есть доп. сообщения
  });
});