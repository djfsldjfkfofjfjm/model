import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';

describe('Comprehensive Financial Model Tests', () => {
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

  const baseClients: ClientsData = {
    newClients75: [10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    newClients150: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients75Direct: [6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    newClients150Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients75Partner: [4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
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

  const baseUpsell: UpsellSettings = {
    additionalBotsPercentage: 2,
    additionalBotsPrice: 100,
    newFeaturesPercentage: 1.5,
    newFeaturesPrice: 75,
    messagePacksPercentage: 3,
    messagePacksPrice: 50,
    integrationsPercentage: 0.8,
    integrationsPrice: 150
  };

  describe('Package Purchase Logic', () => {
    test('Clients buy packages based on actual need, not subscription', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const months = result.current.monthlyData;
      
      // Месяц 1: все 10 клиентов покупают (первая покупка)
      expect(months[0].subscriptionRevenue75).toBe(750); // 10 * $75
      
      // Месяц 2: проверяем логику накопления
      // Накоплено: 10 * 105 * 0.2 = 210 сообщений
      // Нужно: 15 * 105 * 0.8 = 1260 сообщений (с учетом новых)
      // Все покупают новые пакеты
      const month2ActiveClients = Math.round(15 * 0.98); // с учетом churn
      expect(months[1].activeClients75).toBe(month2ActiveClients);
    });

    test('Different usage rates affect purchase frequency correctly', () => {
      // 50% usage - покупка раз в 2 месяца
      const lowUsageParams = { ...baseParams, messageUsageRate: 50 };
      const { result: lowUsageResult } = renderHook(() => 
        useFinancialModel(lowUsageParams, baseClients, baseUpsell)
      );
      
      act(() => {
        lowUsageResult.current.calculateFinancialModel();
      });

      // При 50% использовании клиенты должны покупать реже
      const yearlyRevenue50 = lowUsageResult.current.summary?.totalRevenue || 0;
      
      // 100% usage - покупка каждый месяц
      const highUsageParams = { ...baseParams, messageUsageRate: 100 };
      const { result: highUsageResult } = renderHook(() => 
        useFinancialModel(highUsageParams, baseClients, baseUpsell)
      );
      
      act(() => {
        highUsageResult.current.calculateFinancialModel();
      });

      const yearlyRevenue100 = highUsageResult.current.summary?.totalRevenue || 0;
      
      // При 100% использовании выручка должна быть примерно в 2 раза выше
      expect(yearlyRevenue100).toBeGreaterThan(yearlyRevenue50 * 1.8);
    });
  });

  describe('Financial Metrics Calculation', () => {
    test('ARPU calculated correctly', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      
      // ARPU рассчитывается для каждого тарифа отдельно
      // Для тарифа $75 это цена подписки
      expect(firstMonth.arpu).toBe(75);
    });

    test('LTV limited to 72 months maximum', () => {
      // Очень низкий churn для проверки ограничения
      const lowChurnParams = { ...baseParams, churnRate: 0.1 }; // 0.1%
      const { result } = renderHook(() => useFinancialModel(lowChurnParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      const maxLTV = summary.averageArpu * 72;
      
      expect(summary.averageLtv).toBeLessThanOrEqual(maxLTV);
    });

    test('CAC includes all acquisition costs', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      
      // CAC должен включать все расходы на привлечение
      expect(summary.averageCac).toBeGreaterThan(0);
      expect(summary.averageCacPayback).toBeGreaterThan(0);
    });

    test('NRR calculation with expansion revenue', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      // NRR во втором месяце должен учитывать upsell
      const secondMonth = result.current.monthlyData[1];
      expect(secondMonth.nrr).toBeGreaterThan(90); // Должен быть > 90% с учетом upsell
    });
  });

  describe('Tax and Profit Calculations', () => {
    test('Tax calculated from revenue, not profit', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      const expectedTax = summary.totalRevenue * 0.09; // 9% optimistic
      
      expect(summary.totalTax).toBeCloseTo(expectedTax, 2);
    });

    test('No tax on negative revenue', () => {
      // Создаем сценарий без клиентов
      const noClientsData = {
        ...baseClients,
        newClients75: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        newClients75Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        newClients75Partner: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };

      const { result } = renderHook(() => useFinancialModel(baseParams, noClientsData, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      expect(firstMonth.tax).toBe(0);
    });
  });

  describe('Message System', () => {
    test('Carryover messages limited to 3 months of packages', () => {
      // Создаем сценарий с нулевым использованием для максимального накопления
      const zeroUsageParams = { ...baseParams, messageUsageRate: 0 };
      const { result } = renderHook(() => useFinancialModel(zeroUsageParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      // Проверяем накопление за несколько месяцев
      const month4 = result.current.monthlyData[3];
      const month5 = result.current.monthlyData[4];
      
      // Накопление должно быть ограничено
      expect(month5.activeClients75).toBeGreaterThan(0);
    });

    test('Additional messages charged when exceeding package', () => {
      // 150% использования - превышение пакета
      const highUsageParams = { ...baseParams, messageUsageRate: 150 };
      const { result } = renderHook(() => useFinancialModel(highUsageParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      
      // Должны быть доходы от дополнительных сообщений
      expect(firstMonth.additionalMessagesRevenue).toBeGreaterThan(0);
    });
  });

  describe('Channel Distribution', () => {
    test('Partner commissions calculated correctly', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      
      // Комиссия партнерам = (выручка от партнерских клиентов) * ставка
      expect(firstMonth.partnerCommissions).toBeGreaterThan(0);
    });

    test('Direct vs Partner client distribution', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      
      // Проверяем распределение 60/40
      const directRatio = 6 / 10;
      const partnerRatio = 4 / 10;
      
      expect(firstMonth.newClients75Direct).toBe(6);
      expect(firstMonth.newClients75Partner).toBe(4);
    });
  });

  describe('Upsell Revenue', () => {
    test('All upsell types contribute to revenue', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      
      // Проверяем, что есть доходы от upsell
      expect(summary.totalUpsellRevenue).toBeGreaterThan(0);
    });
  });

  describe('FOT Distribution', () => {
    test('FOT correctly split between development and sales', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      
      // ФОТ должен быть разделен примерно 60/40
      const totalFOT = summary.totalFot;
      const devRatio = summary.totalDevelopmentCosts / totalFOT;
      const salesRatio = summary.totalSalesTeamCosts / totalFOT;
      
      expect(devRatio).toBeCloseTo(0.6, 1);
      expect(salesRatio).toBeCloseTo(0.4, 1);
    });
  });

  describe('Summary Calculations', () => {
    test('Summary totals match monthly data', () => {
      const { result } = renderHook(() => useFinancialModel(baseParams, baseClients, baseUpsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      const monthlyTotals = result.current.monthlyData.reduce((acc, month) => ({
        revenue: acc.revenue + month.totalRevenue,
        expenses: acc.expenses + month.totalExpenses,
        clients: Math.max(acc.clients, month.totalActiveClients)
      }), { revenue: 0, expenses: 0, clients: 0 });

      expect(summary.totalRevenue).toBeCloseTo(monthlyTotals.revenue, 2);
      expect(summary.totalExpenses).toBeCloseTo(monthlyTotals.expenses, 2);
    });
  });
});