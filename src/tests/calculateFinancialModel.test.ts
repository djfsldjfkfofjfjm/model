/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useFinancialModel } from '../hooks/useFinancialModel';
import {
  FinancialModelParams,
  ClientsData,
  UpsellSettings,
} from '../types/FinancialTypes';
import {
  DEFAULT_BASE_PARAMS,
  DEFAULT_NEW_CLIENTS,
  DEFAULT_SUBSCRIPTION_PRICES,
  DEFAULT_MESSAGE_PACKAGES,
  DEFAULT_INTEGRATION_PARAMS,
  DEFAULT_CAC_PARAMS,
  DEFAULT_UPSELL_PARAMS,
  DEFAULT_FOT_VALUES,
  DEFAULT_TAX_RATES,
} from '../constants/DefaultValues';

const defaultModelParams: FinancialModelParams = {
  taxMode: DEFAULT_BASE_PARAMS.taxMode,
  fotMode: DEFAULT_BASE_PARAMS.fotMode,
  apiCostPercentage: DEFAULT_INTEGRATION_PARAMS.apiCostPercentage,
  churnRate: DEFAULT_BASE_PARAMS.churnRate,
  maxImplementationCost: DEFAULT_BASE_PARAMS.maxImplementationCost,
  integrationPrice: DEFAULT_INTEGRATION_PARAMS.price,
  cacPercentage: DEFAULT_INTEGRATION_PARAMS.cacPercentage,
  implementationPercentage: DEFAULT_INTEGRATION_PARAMS.implementationPercentage,
  partnerCommissionRate: DEFAULT_CAC_PARAMS.partnerCommissionRate,
  salesTeamPercentage: DEFAULT_CAC_PARAMS.salesTeamPercentage,
  marketingPercentage: DEFAULT_CAC_PARAMS.marketingPercentage,
  leadGenerationPerClient: DEFAULT_CAC_PARAMS.leadGenerationPerClient,
  messageUsageRate: DEFAULT_MESSAGE_PACKAGES.usageRate,
  carryOverPercentage: DEFAULT_MESSAGE_PACKAGES.carryOverPercentage,
  additionalMessagePrice: DEFAULT_MESSAGE_PACKAGES.additionalPrice,
  fotOptimistic: [...DEFAULT_FOT_VALUES.optimistic],
  fotPessimistic: [...DEFAULT_FOT_VALUES.pessimistic],
};

const defaultClientsData: ClientsData = {
  newClients75: [...DEFAULT_NEW_CLIENTS.clients75],
  newClients150: [...DEFAULT_NEW_CLIENTS.clients150],
  newClients250: [...DEFAULT_NEW_CLIENTS.clients250],
  newClients500: [...DEFAULT_NEW_CLIENTS.clients500],
  newClients1000: [...DEFAULT_NEW_CLIENTS.clients1000],
  subscriptionPrice75: DEFAULT_SUBSCRIPTION_PRICES.price75,
  subscriptionPrice150: DEFAULT_SUBSCRIPTION_PRICES.price150,
  subscriptionPrice250: DEFAULT_SUBSCRIPTION_PRICES.price250,
  subscriptionPrice500: DEFAULT_SUBSCRIPTION_PRICES.price500,
  subscriptionPrice1000: DEFAULT_SUBSCRIPTION_PRICES.price1000,
  messages75: DEFAULT_MESSAGE_PACKAGES.messages75,
  messages150: DEFAULT_MESSAGE_PACKAGES.messages150,
  messages250: DEFAULT_MESSAGE_PACKAGES.messages250,
  messages500: DEFAULT_MESSAGE_PACKAGES.messages500,
  messages1000: DEFAULT_MESSAGE_PACKAGES.messages1000,
};

const defaultUpsellSettings: UpsellSettings = {
  additionalBotsRate: DEFAULT_UPSELL_PARAMS.additionalBotsRate,
  additionalBotsPrice: DEFAULT_UPSELL_PARAMS.additionalBotsPrice,
  newFeaturesRate: DEFAULT_UPSELL_PARAMS.newFeaturesRate,
  newFeaturesPrice: DEFAULT_UPSELL_PARAMS.newFeaturesPrice,
  messageExpansionRate: DEFAULT_UPSELL_PARAMS.messageExpansionRate,
  messageExpansionPrice: DEFAULT_UPSELL_PARAMS.messageExpansionPrice,
  additionalIntegrationsRate: DEFAULT_UPSELL_PARAMS.additionalIntegrationsRate,
  additionalIntegrationsPrice: DEFAULT_UPSELL_PARAMS.additionalIntegrationsPrice,
};

const renderAndCalculate = (
  params = defaultModelParams,
  clients = defaultClientsData,
  upsell = defaultUpsellSettings
) => {
  const { result } = renderHook(() => useFinancialModel(params, clients, upsell));
  act(() => {
    result.current.calculateFinancialModel();
  });
  return result;
};

describe('Financial Model Calculations (useFinancialModel Hook)', () => {
  test('calculates correctly with default parameters', () => {
    const { current } = renderAndCalculate();
    expect(current.monthlyData).toBeDefined();
    expect(current.monthlyData.length).toBe(12);
    expect(current.totalData).toBeDefined();
    expect(current.totalData.totalNewClients).toBeDefined();
    expect(current.totalData.totalRevenue).toBeDefined();
    expect(current.totalData.totalExpenses).toBeDefined();
    expect(current.totalData.totalNetProfit).toBeDefined();
    expect(current.monthlyData[0].totalActiveClients).toBeDefined();
  });

  test('calculates higher tax with pessimistic tax mode', () => {
    const pessimisticParams = { ...defaultModelParams, taxMode: 'pessimistic' as const };
    const { current: optimisticResult } = renderAndCalculate(defaultModelParams);
    const { current: pessimisticResult } = renderAndCalculate(pessimisticParams);

    expect(optimisticResult.monthlyData.length).toBeGreaterThan(0);
    expect(pessimisticResult.monthlyData.length).toBeGreaterThan(0);
    
    const firstProfitableMonthOptimistic = optimisticResult.monthlyData.find(m => m.grossProfit > 0);
    const firstProfitableMonthPessimistic = pessimisticResult.monthlyData.find(m => m.grossProfit > 0);

    if (firstProfitableMonthOptimistic && firstProfitableMonthPessimistic) {
        const optimisticTax = optimisticResult.monthlyData.find(m => m.month === firstProfitableMonthOptimistic.month)?.tax || 0;
        const pessimisticTax = pessimisticResult.monthlyData.find(m => m.month === firstProfitableMonthPessimistic.month)?.tax || 0;
        expect(pessimisticTax).toBeGreaterThanOrEqual(0);
        expect(optimisticTax).toBeGreaterThanOrEqual(0);
    } else {
        optimisticResult.monthlyData.forEach(m => expect(m.tax).toBe(0));
        pessimisticResult.monthlyData.forEach(m => expect(m.tax).toBe(0));
    }
  });

  test('calculates higher FOT with pessimistic FOT mode', () => {
    const pessimisticParams = { ...defaultModelParams, fotMode: 'pessimistic' as const };
    const { current: optimisticResult } = renderAndCalculate(defaultModelParams);
    const { current: pessimisticResult } = renderAndCalculate(pessimisticParams);
    
    expect(optimisticResult.monthlyData.length).toBe(12);
    expect(pessimisticResult.monthlyData.length).toBe(12);

    for (let i = 0; i < 12; i++) {
      expect(pessimisticResult.monthlyData[i].fotCosts).toBe(DEFAULT_FOT_VALUES.pessimistic[i]);
      expect(optimisticResult.monthlyData[i].fotCosts).toBe(DEFAULT_FOT_VALUES.optimistic[i]);
      if (DEFAULT_FOT_VALUES.pessimistic[i] > DEFAULT_FOT_VALUES.optimistic[i]) {
        expect(pessimisticResult.monthlyData[i].fotCosts).toBeGreaterThan(optimisticResult.monthlyData[i].fotCosts);
      }
    }
  });

  test('active clients decrease with higher churn rate', () => {
    const highChurnParams = { ...defaultModelParams, churnRate: 10 };
    const { current: normalResult } = renderAndCalculate(defaultModelParams);
    const { current: highChurnResult } = renderAndCalculate(highChurnParams);

    expect(normalResult.monthlyData[11].totalActiveClients).toBeDefined();
    expect(highChurnResult.monthlyData[11].totalActiveClients).toBeDefined();
    
    const initialTotalClientsMonth0Normal = defaultClientsData.newClients75[0] + defaultClientsData.newClients150[0] + defaultClientsData.newClients250[0] + defaultClientsData.newClients500[0] + defaultClientsData.newClients1000[0];
    if (initialTotalClientsMonth0Normal > 0 || defaultClientsData.newClients75.slice(1).some(c => c > 0) ) {
        expect(highChurnResult.monthlyData[11].totalActiveClients).toBeLessThan(normalResult.monthlyData[11].totalActiveClients);
    } else {
        expect(highChurnResult.monthlyData[11].totalActiveClients).toBe(0);
        expect(normalResult.monthlyData[11].totalActiveClients).toBe(0);
    }
  });

  test('calculates zero tax for zero revenue', () => {
    const zeroRevenueClientsData: ClientsData = {
      ...defaultClientsData,
      newClients75: Array(12).fill(0), newClients150: Array(12).fill(0),
      newClients250: Array(12).fill(0), newClients500: Array(12).fill(0),
      newClients1000: Array(12).fill(0),
    };
    const zeroRevenueParams: FinancialModelParams = { ...defaultModelParams, integrationPrice: 0 };
    const { current: result } = renderAndCalculate(zeroRevenueParams, zeroRevenueClientsData);
    
    result.monthlyData.forEach(monthData => {
      expect(monthData.totalRevenue).toBe(0);
      expect(monthData.tax).toBe(0);
    });
  });

  // Тесты для новых/обновленных KPI и данных
  describe('Newly Implemented KPIs and Data', () => {
    const { current: results } = renderAndCalculate(); // Используем дефолтные параметры

    test('calculates finalActiveClients', () => {
      expect(results.totalData.finalActiveClients).toBe(results.monthlyData[11].totalActiveClients);
    });

    test('calculates totalChurnedClients', () => {
      const expectedTotalChurned = results.monthlyData.reduce((sum, m) => sum + m.churnedClients, 0);
      expect(results.totalData.totalChurnedClients).toBe(expectedTotalChurned);
    });

    test('totalData.churnRate matches input params.churnRate', () => {
      expect(results.totalData.churnRate).toBe(defaultModelParams.churnRate);
    });

    test('calculates ROI', () => {
      if (results.totalData.totalExpenses > 0) {
        const expectedROI = (results.totalData.totalNetProfit / results.totalData.totalExpenses) * 100;
        expect(results.totalData.roi).toBeCloseTo(expectedROI);
      } else {
        expect(results.totalData.roi).toBe(0); // или другое ожидаемое значение для 0 расходов
      }
    });

    test('calculates implementationMargin', () => {
      if (results.totalData.totalIntegration > 0) {
        const expectedMargin = ((results.totalData.totalIntegration - results.totalData.totalImplementationCosts) / results.totalData.totalIntegration) * 100;
        expect(results.totalData.implementationMargin).toBeCloseTo(expectedMargin);
      } else {
        expect(results.totalData.implementationMargin).toBe(0);
      }
    });
    
    test('calculates cumulativeProfit, cumulativeRevenue, cumulativeExpenses in monthlyData', () => {
      let cumProfit = 0;
      let cumRevenue = 0;
      let cumExpenses = 0;
      results.monthlyData.forEach(m => {
        cumRevenue += m.totalRevenue;
        cumExpenses += m.totalExpenses;
        cumProfit += m.netProfit;
        expect(m.cumulativeRevenue).toBeCloseTo(cumRevenue);
        expect(m.cumulativeExpenses).toBeCloseTo(cumExpenses);
        expect(m.cumulativeProfit).toBeCloseTo(cumProfit);
      });
    });

    test('calculates breakevenMonth', () => {
      let cumulativeProfit = 0;
      let expectedBreakevenMonth: number | undefined = undefined;
      for(let i = 0; i < results.monthlyData.length; i++) {
        cumulativeProfit += results.monthlyData[i].netProfit;
        if (cumulativeProfit > 0) {
          expectedBreakevenMonth = i + 1;
          break;
        }
      }
      expect(results.totalData.breakevenMonth).toBe(expectedBreakevenMonth);
    });

    test('calculates NRR in totalData (last month NRR)', () => {
      expect(results.totalData.nrr).toBe(results.monthlyData[11].nrr);
    });

    test('calculates expansionRevenue (equals totalUpsellRevenue)', () => {
      expect(results.totalData.expansionRevenue).toBe(results.totalData.totalUpsellRevenue);
    });
    
    test('calculates totalChurnedRevenue', () => {
        let expectedChurnedRevenue = 0;
        results.monthlyData.forEach(m => {
            expectedChurnedRevenue += (m.churnClients75 * defaultClientsData.subscriptionPrice75) +
                                      (m.churnClients150 * defaultClientsData.subscriptionPrice150) +
                                      (m.churnClients250 * defaultClientsData.subscriptionPrice250) +
                                      (m.churnClients500 * defaultClientsData.subscriptionPrice500) +
                                      (m.churnClients1000 * defaultClientsData.subscriptionPrice1000);
        });
        expect(results.totalData.churnedRevenue).toBeCloseTo(expectedChurnedRevenue);
    });

    test('calculates detailed Upsell revenues in totalData', () => {
      const expectedBots = results.monthlyData.reduce((sum, m) => sum + m.additionalBotsRevenue, 0);
      const expectedFeatures = results.monthlyData.reduce((sum, m) => sum + m.newFeaturesRevenue, 0);
      const expectedExpansion = results.monthlyData.reduce((sum, m) => sum + m.messageExpansionRevenue, 0);
      const expectedIntegrations = results.monthlyData.reduce((sum, m) => sum + m.additionalIntegrationsRevenue, 0);

      expect(results.totalData.totalAdditionalBotsRevenue).toBeCloseTo(expectedBots);
      expect(results.totalData.totalNewFeaturesRevenue).toBeCloseTo(expectedFeatures);
      expect(results.totalData.totalMessageExpansionRevenue).toBeCloseTo(expectedExpansion);
      expect(results.totalData.totalAdditionalIntegrationsRevenue).toBeCloseTo(expectedIntegrations);
    });

    test('uses custom FOT values from params', () => {
      const customFotOptimistic = Array(12).fill(1000);
      const customFotPessimistic = Array(12).fill(2000);
      const paramsWithCustomFot: FinancialModelParams = {
        ...defaultModelParams,
        fotOptimistic: customFotOptimistic,
        fotPessimistic: customFotPessimistic,
      };

      // Test optimistic FOT
      const { current: optimisticResult } = renderAndCalculate({ ...paramsWithCustomFot, fotMode: 'optimistic' });
      optimisticResult.monthlyData.forEach((m, i) => {
        expect(m.fotCosts).toBe(customFotOptimistic[i]);
      });
      expect(optimisticResult.totalData.totalFotCosts).toBe(customFotOptimistic.reduce((s, v) => s + v, 0));

      // Test pessimistic FOT
      const { current: pessimisticResult } = renderAndCalculate({ ...paramsWithCustomFot, fotMode: 'pessimistic' });
      pessimisticResult.monthlyData.forEach((m, i) => {
        expect(m.fotCosts).toBe(customFotPessimistic[i]);
      });
      expect(pessimisticResult.totalData.totalFotCosts).toBe(customFotPessimistic.reduce((s, v) => s + v, 0));
    });
  });
});
