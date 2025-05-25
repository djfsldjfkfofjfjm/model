import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';

describe('Детальный анализ проблемы с % использования сообщений', () => {
  const baseParams: FinancialModelParams = {
    messageUsageRate: 50, // Начинаем с 50%
    carryOverPercentage: 80, // 80% переносится
    additionalMessagePrice: 0.05,
    integrationPrice: 500,
    churnRate: 5,
    apiCostPercentage: 10,
    channelDistribution: {
      direct: 60,
      partner: 40
    },
    partnerCommissionRate: 20,
    partnerLeadCost: 100,
    directSalesPercentage: 15,
    directMarketingPercentage: 10,
    directLeadCost: 150,
    implementationPercentage: 20,
    maxImplementationCost: 100,
    fotMode: 'optimistic',
    fotOptimistic: new Array(12).fill(50000),
    fotPessimistic: new Array(12).fill(70000),
    taxMode: 'optimistic',
    customTaxRate: 15,
    messageCarryoverLimit: 3
  };

  const testClients: ClientsData = {
    newClients75: [10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    newClients150: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    subscriptionPrice75: 75,
    subscriptionPrice150: 150,
    subscriptionPrice250: 250,
    subscriptionPrice500: 500,
    subscriptionPrice1000: 1000,
    messages75: 1000,
    messages150: 2500,
    messages250: 5000,
    messages500: 12500,
    messages1000: 30000
  };

  const emptyUpsell: UpsellSettings = {
    additionalBotsPercentage: 0,
    additionalBotsPrice: 0,
    newFeaturesPercentage: 0,
    newFeaturesPrice: 0,
    messagePacksPercentage: 0,
    messagePacksPrice: 0,
    integrationsPercentage: 0,
    integrationsPrice: 0
  };

  it('ДЕМОНСТРАЦИЯ ПРОБЛЕМЫ: при разных % использования', () => {
    console.log('\n🔴 АНАЛИЗ ПРОБЛЕМЫ С % ИСПОЛЬЗОВАНИЯ СООБЩЕНИЙ\n');
    
    const usageRates = [30, 50, 70, 90, 110, 130, 150];
    const results: any[] = [];
    
    usageRates.forEach(rate => {
      const params = { ...baseParams, messageUsageRate: rate };
      const { result } = renderHook(() => useFinancialModel(params, testClients, emptyUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });
      
      const totalData = result.current.totalData;
      const monthlyData = result.current.monthlyData;
      
      // Считаем общее количество покупок пакетов за год
      let totalPackagesPurchased = 0;
      let totalAdditionalMessages = 0;
      
      monthlyData.forEach((month, index) => {
        // Проверяем сколько клиентов купили пакет в этом месяце
        const buyingClients = Math.floor(month.subscriptionRevenue75 / testClients.subscriptionPrice75);
        totalPackagesPurchased += buyingClients;
        totalAdditionalMessages += month.additionalMessages75;
      });
      
      results.push({
        rate,
        totalRevenue: totalData.totalRevenue,
        subscriptionRevenue: totalData.totalSubscription,
        additionalMessagesRevenue: totalData.totalAdditionalMessagesRevenue,
        totalProfit: totalData.totalNetProfit,
        totalPackagesPurchased,
        totalAdditionalMessages,
        avgMonthlyProfit: totalData.avgMonthlyProfit
      });
    });
    
    // Выводим таблицу результатов
    console.table(results);
    
    // Анализ проблемы
    console.log('\n📊 АНАЛИЗ ПОВЕДЕНИЯ:');
    
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const curr = results[i];
      
      console.log(`\n${prev.rate}% → ${curr.rate}%:`);
      console.log(`  Покупок пакетов: ${prev.totalPackagesPurchased} → ${curr.totalPackagesPurchased} (${curr.totalPackagesPurchased - prev.totalPackagesPurchased >= 0 ? '+' : ''}${curr.totalPackagesPurchased - prev.totalPackagesPurchased})`);
      console.log(`  Выручка подписок: $${prev.subscriptionRevenue.toFixed(0)} → $${curr.subscriptionRevenue.toFixed(0)} (${curr.subscriptionRevenue - prev.subscriptionRevenue >= 0 ? '+' : ''}$${(curr.subscriptionRevenue - prev.subscriptionRevenue).toFixed(0)})`);
      console.log(`  Доп. сообщения: ${prev.totalAdditionalMessages} → ${curr.totalAdditionalMessages} (${curr.totalAdditionalMessages - prev.totalAdditionalMessages >= 0 ? '+' : ''}${curr.totalAdditionalMessages - prev.totalAdditionalMessages})`);
      console.log(`  Выручка доп. сообщ.: $${prev.additionalMessagesRevenue.toFixed(0)} → $${curr.additionalMessagesRevenue.toFixed(0)} (${curr.additionalMessagesRevenue - prev.additionalMessagesRevenue >= 0 ? '+' : ''}$${(curr.additionalMessagesRevenue - prev.additionalMessagesRevenue).toFixed(0)})`);
      console.log(`  ОБЩАЯ ПРИБЫЛЬ: $${prev.totalProfit.toFixed(0)} → $${curr.totalProfit.toFixed(0)} (${curr.totalProfit - prev.totalProfit >= 0 ? '+' : ''}$${(curr.totalProfit - prev.totalProfit).toFixed(0)})`);
      
      if (curr.totalProfit < prev.totalProfit) {
        console.log(`  ⚠️ ПРОБЛЕМА: Прибыль упала при увеличении использования!`);
      }
    }
  });

  it('Детальный анализ одного месяца при низком и высоком использовании', () => {
    console.log('\n🔍 ДЕТАЛЬНЫЙ АНАЛИЗ ПЕРВЫХ 3 МЕСЯЦЕВ\n');
    
    // Сценарий 1: Низкое использование (40%)
    const lowUsageParams = { ...baseParams, messageUsageRate: 40 };
    const { result: lowResult } = renderHook(() => useFinancialModel(lowUsageParams, testClients, emptyUpsell));
    
    act(() => {
      lowResult.current.calculateFinancialModel();
    });
    
    // Сценарий 2: Высокое использование (120%)
    const highUsageParams = { ...baseParams, messageUsageRate: 120 };
    const { result: highResult } = renderHook(() => useFinancialModel(highUsageParams, testClients, emptyUpsell));
    
    act(() => {
      highResult.current.calculateFinancialModel();
    });
    
    console.log('СЦЕНАРИЙ 1: 40% использования');
    console.log('=====================================');
    for (let i = 0; i < 3; i++) {
      const month = lowResult.current.monthlyData[i];
      console.log(`\nМесяц ${i + 1}:`);
      console.log(`  Активные клиенты: ${month.activeClients75}`);
      console.log(`  Накоплено с прошлого месяца: ${i === 0 ? 0 : lowResult.current.monthlyData[i-1].unusedMessages75}`);
      console.log(`  Нужен новый пакет: ${month.unusedMessages75 < month.activeClients75 * 1000 ? 'ДА' : 'НЕТ'}`);
      console.log(`  Купят пакет клиентов: ${Math.floor(month.subscriptionRevenue75 / 75)}`);
      console.log(`  Доступно сообщений: ${month.availableMessages75}`);
      console.log(`  Использовано: ${month.usedMessages75} (${40}% от ${month.activeClients75 * 1000})`);
      console.log(`  Осталось: ${month.availableMessages75 - month.usedMessages75}`);
      console.log(`  Перенесено на след. месяц: ${month.unusedMessages75}`);
      console.log(`  Выручка от подписок: $${month.subscriptionRevenue75}`);
    }
    
    console.log('\n\nСЦЕНАРИЙ 2: 120% использования');
    console.log('=====================================');
    for (let i = 0; i < 3; i++) {
      const month = highResult.current.monthlyData[i];
      console.log(`\nМесяц ${i + 1}:`);
      console.log(`  Активные клиенты: ${month.activeClients75}`);
      console.log(`  Накоплено с прошлого месяца: ${i === 0 ? 0 : highResult.current.monthlyData[i-1].unusedMessages75}`);
      console.log(`  Нужен новый пакет: ${month.unusedMessages75 < month.activeClients75 * 1000 ? 'ДА' : 'НЕТ'}`);
      console.log(`  Купят пакет клиентов: ${Math.floor(month.subscriptionRevenue75 / 75)}`);
      console.log(`  Доступно сообщений: ${month.availableMessages75}`);
      console.log(`  Использовано: ${month.usedMessages75} (${120}% от ${month.activeClients75 * 1000})`);
      console.log(`  Дополнительные сообщения: ${month.additionalMessages75}`);
      console.log(`  Выручка от подписок: $${month.subscriptionRevenue75}`);
      console.log(`  Выручка от доп. сообщений: $${month.additionalMessages75Revenue}`);
    }
    
    console.log('\n\n📈 СРАВНЕНИЕ ИТОГОВ:');
    console.log(`40% использования - Общая прибыль: $${lowResult.current.totalData.totalNetProfit.toFixed(0)}`);
    console.log(`120% использования - Общая прибыль: $${highResult.current.totalData.totalNetProfit.toFixed(0)}`);
    console.log(`Разница: $${(highResult.current.totalData.totalNetProfit - lowResult.current.totalData.totalNetProfit).toFixed(0)}`);
  });

  it('Проверка логики покупки пакетов при накоплении', () => {
    console.log('\n🛒 АНАЛИЗ ЛОГИКИ ПОКУПКИ ПАКЕТОВ\n');
    
    // Тест с очень низким использованием для максимального накопления
    const veryLowUsageParams = { ...baseParams, messageUsageRate: 10 }; // 10% использования
    const { result } = renderHook(() => useFinancialModel(veryLowUsageParams, testClients, emptyUpsell));
    
    act(() => {
      result.current.calculateFinancialModel();
    });
    
    const monthlyData = result.current.monthlyData;
    
    monthlyData.forEach((month, index) => {
      console.log(`\nМесяц ${index + 1}:`);
      console.log(`  Активные клиенты: ${month.activeClients75}`);
      console.log(`  Накоплено сообщений: ${index === 0 ? 0 : monthlyData[index-1].unusedMessages75}`);
      
      // Рассчитываем, нужен ли новый пакет
      const previousUnused = index === 0 ? 0 : monthlyData[index-1].unusedMessages75;
      const neededMessages = month.activeClients75 * 1000; // Сколько нужно на месяц
      const needNewPackage = previousUnused < neededMessages;
      
      console.log(`  Нужно сообщений на месяц: ${neededMessages}`);
      console.log(`  Нужен новый пакет? ${needNewPackage ? 'ДА' : 'НЕТ'}`);
      
      // Проверяем сколько клиентов купили пакет
      const buyingClients = Math.floor(month.subscriptionRevenue75 / 75);
      console.log(`  Купили пакет: ${buyingClients} клиентов`);
      console.log(`  Выручка от подписок: $${month.subscriptionRevenue75}`);
      
      // Проверяем логику
      if (needNewPackage && buyingClients !== month.activeClients75) {
        console.log(`  ⚠️ ПРОБЛЕМА: Должны были купить все ${month.activeClients75}, а купили ${buyingClients}`);
      } else if (!needNewPackage && buyingClients > 0) {
        const expectedBuying = Math.max(0, month.activeClients75 - Math.floor(previousUnused / 1000));
        console.log(`  💡 Ожидалось покупок: ${expectedBuying}, фактически: ${buyingClients}`);
      }
    });
  });
});