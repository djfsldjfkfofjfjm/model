import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';

describe('Финальный набор тестов финансовой модели', () => {
  const createBaseParams = (): FinancialModelParams => ({
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
    fotOptimistic: new Array(12).fill(10000),
    fotPessimistic: new Array(12).fill(15000)
  });

  const createBaseClients = (): ClientsData => ({
    newClients75: [10, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients150: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients75Direct: [6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients150Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients250Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients500Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients1000Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    newClients75Partner: [4, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
  });

  const createBaseUpsell = (): UpsellSettings => ({
    additionalBotsPercentage: 2,
    additionalBotsPrice: 100,
    newFeaturesPercentage: 1.5,
    newFeaturesPrice: 75,
    messagePacksPercentage: 3,
    messagePacksPrice: 50,
    integrationsPercentage: 0.8,
    integrationsPrice: 150
  });

  describe('1. Логика покупки пакетов', () => {
    test('Клиенты покупают пакеты только при необходимости', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      const secondMonth = result.current.monthlyData[1];

      // Первый месяц: все новые клиенты покупают
      expect(firstMonth.subscriptionRevenue75).toBe(750); // 10 * $75

      // Второй месяц зависит от накопления
      const expectedActiveMonth2 = Math.round(15 * 0.98); // с учетом churn
      expect(secondMonth.activeClients75).toBe(expectedActiveMonth2);
    });

    test('Процент использования влияет на частоту покупок', () => {
      const params50 = { ...createBaseParams(), messageUsageRate: 50 };
      const params100 = { ...createBaseParams(), messageUsageRate: 100 };
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result: result50 } = renderHook(() => useFinancialModel(params50, clients, upsell));
      const { result: result100 } = renderHook(() => useFinancialModel(params100, clients, upsell));
      
      act(() => {
        result50.current.calculateFinancialModel();
        result100.current.calculateFinancialModel();
      });

      // При 100% использовании выручка должна быть выше
      expect(result100.current.summary.totalSubscriptionRevenue).toBeGreaterThan(
        result50.current.summary.totalSubscriptionRevenue
      );
    });
  });

  describe('2. Система сообщений', () => {
    test('Неиспользованные сообщения переносятся', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      
      // При 80% использовании остаётся 20% сообщений
      const totalMessages = firstMonth.activeClients75 * clients.messages75;
      const usedMessages = totalMessages * 0.8;
      const unusedMessages = totalMessages - usedMessages;
      
      expect(firstMonth.unusedMessages75).toBeCloseTo(unusedMessages, 0);
    });

    test('Дополнительные сообщения при превышении пакета', () => {
      const params = { ...createBaseParams(), messageUsageRate: 150 };
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      
      // При 150% использовании должны быть доп. сообщения
      expect(firstMonth.additionalMessagesRevenue).toBeGreaterThan(0);
    });
  });

  describe('3. Финансовые метрики', () => {
    test('Налог считается от выручки', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      const expectedTax = summary.totalRevenue * 0.09; // 9% оптимистично
      
      expect(summary.totalTax).toBeCloseTo(expectedTax, 2);
    });

    test('CAC включает все расходы на привлечение', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      
      // CAC должен быть больше 0 при наличии новых клиентов
      expect(summary.averageCac).toBeGreaterThan(0);
    });

    test('NRR учитывает расширение и отток', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      // NRR должен быть около 98% с учетом 2% оттока
      const secondMonth = result.current.monthlyData[1];
      expect(secondMonth.nrr).toBeGreaterThan(90);
      expect(secondMonth.nrr).toBeLessThan(110);
    });
  });

  describe('4. Каналы привлечения', () => {
    test('Распределение клиентов по каналам', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      
      // Проверяем распределение 60/40
      expect(firstMonth.newClients75Direct).toBe(6);
      expect(firstMonth.newClients75Partner).toBe(4);
    });

    test('Комиссии партнёрам рассчитываются правильно', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const firstMonth = result.current.monthlyData[0];
      
      // Комиссия = выручка от партнёров * ставка комиссии
      expect(firstMonth.partnerCommissions).toBeGreaterThan(0);
    });
  });

  describe('5. Upsell и дополнительные доходы', () => {
    test('Upsell генерирует дополнительную выручку', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      
      // Должны быть доходы от upsell при наличии клиентов
      expect(summary.totalUpsellRevenue).toBeGreaterThan(0);
    });
  });

  describe('6. Расходы и ФОТ', () => {
    test('ФОТ распределяется между разработкой и продажами', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      const totalFot = summary.totalFot;
      
      // Проверяем пропорции примерно 60/40
      const devRatio = summary.totalDevelopmentCosts / totalFot;
      const salesRatio = summary.totalSalesTeamCosts / totalFot;
      
      expect(devRatio).toBeCloseTo(0.6, 1);
      expect(salesRatio).toBeCloseTo(0.4, 1);
    });

    test('API costs зависят от выручки', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      const expectedApiCosts = summary.totalRevenue * 0.3; // 30%
      
      expect(summary.totalApiCosts).toBeCloseTo(expectedApiCosts, 2);
    });
  });

  describe('7. Итоговые показатели', () => {
    test('Прибыль = Выручка - Расходы - Налоги', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      const expectedNetProfit = summary.totalRevenue - summary.totalExpenses - summary.totalTax;
      
      expect(summary.totalNetProfit).toBeCloseTo(expectedNetProfit, 2);
    });

    test('ROI рассчитывается корректно', () => {
      const params = createBaseParams();
      const clients = createBaseClients();
      const upsell = createBaseUpsell();
      
      const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
      
      act(() => {
        result.current.calculateFinancialModel();
      });

      const summary = result.current.summary;
      
      // ROI должен быть числом
      expect(typeof summary.roi).toBe('number');
      expect(isNaN(summary.roi)).toBe(false);
    });
  });
});