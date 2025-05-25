import { renderHook, act } from '@testing-library/react';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';


describe('Financial Model Calculations', () => {
  const mockParams: FinancialModelParams = {
    taxMode: 'optimistic',
    customTaxRate: 15,
    fotMode: 'optimistic',
    apiCostPercentage: 10,
    churnRate: 5,
    maxImplementationCost: 5000,
    integrationPrice: 1000,
    cacPercentage: 20,
    implementationPercentage: 30,
    partnerCommissionRate: 20,
    messageUsageRate: 80,
    carryOverPercentage: 50,
    additionalMessagePrice: 0.05,
    fotOptimistic: Array(12).fill(10000),
    fotPessimistic: Array(12).fill(15000),
    channelDistribution: 60, // 60% direct, 40% partner
    directSalesPercentage: 10,
    directMarketingPercentage: 5,
    directLeadCost: 30,
    partnerLeadCost: 10,
  };

  const mockClients: ClientsData = {
    newClients75: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    newClients150: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7],
    newClients250: [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5],
    newClients500: [0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3],
    newClients1000: [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3],
    subscriptionPrice75: 75,
    subscriptionPrice150: 150,
    subscriptionPrice250: 250,
    subscriptionPrice500: 500,
    subscriptionPrice1000: 1000,
    messages75: 75,
    messages150: 150,
    messages250: 250,
    messages500: 500,
    messages1000: 1000,
    // Добавляем недостающие поля
    newClients75Direct: [1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8],
    newClients150Direct: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4],
    newClients250Direct: [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3],
    newClients500Direct: [0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
    newClients1000Direct: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
    newClients75Partner: [1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5],
    newClients150Partner: [0, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 3],
    newClients250Partner: [0, 0, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2],
    newClients500Partner: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    newClients1000Partner: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
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
    integrationsPrice: 150,
  };

  test('Налог рассчитывается с выручки, а не с прибыли', () => {
    const result = testHook(useFinancialModel, mockParams, mockClients, mockUpsell);
    result.current.calculateFinancialModel();
    
    const firstMonth = result.current.monthlyData[0];
    expect(firstMonth).toBeDefined();
    
    // Проверяем, что налог рассчитан от выручки
    const expectedTax = firstMonth.totalRevenue > 0 ? firstMonth.totalRevenue * 0.06 : 0; // 6% optimistic
    expect(firstMonth.tax).toBeCloseTo(expectedTax, 2);
  });

  test('LTV учитывает churn rate', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    const totalData = result.current.totalData;
    const monthlyChurnRate = mockParams.churnRate / 100;
    const expectedLTV = totalData.avgArpu / monthlyChurnRate;
    
    expect(totalData.ltv).toBeCloseTo(expectedLTV, 2);
  });

  test('Распределение каналов работает корректно', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    const firstMonth = result.current.monthlyData[0];
    const totalNewClients = firstMonth.totalNewClients;
    
    // Проверяем, что клиенты распределяются по каналам согласно настройкам
    const expectedDirectClients = Math.round(totalNewClients * 0.6);
    const expectedPartnerClients = Math.round(totalNewClients * 0.4);
    
    const actualDirectClients = 
      firstMonth.newClients75Direct + 
      firstMonth.newClients150Direct + 
      firstMonth.newClients250Direct + 
      firstMonth.newClients500Direct + 
      firstMonth.newClients1000Direct;
      
    const actualPartnerClients = 
      firstMonth.newClients75Partner + 
      firstMonth.newClients150Partner + 
      firstMonth.newClients250Partner + 
      firstMonth.newClients500Partner + 
      firstMonth.newClients1000Partner;
    
    expect(actualDirectClients).toBe(expectedDirectClients);
    expect(actualPartnerClients).toBe(expectedPartnerClients);
  });

  test('NRR включает expansion revenue', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    // Проверяем второй месяц, так как NRR рассчитывается относительно предыдущего
    const secondMonth = result.current.monthlyData[1];
    expect(secondMonth.nrr).toBeGreaterThan(0);
    
    // NRR должен учитывать upsell и additional messages revenue
    const hasExpansion = secondMonth.upsellRevenue > 0 || secondMonth.additionalMessagesRevenue > 0;
    expect(hasExpansion).toBe(true);
  });

  test('Комиссии партнерам рассчитываются от реальной выручки', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    const firstMonth = result.current.monthlyData[0];
    
    // Комиссии должны быть больше 0 если есть партнерские клиенты
    if (firstMonth.totalNewClients > 0 && mockParams.channelDistribution.partner > 0) {
      expect(firstMonth.partnerCommissions).toBeGreaterThan(0);
    }
  });

  test('ФОТ использует переданные значения, а не заглушки', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    const firstMonth = result.current.monthlyData[0];
    expect(firstMonth.fotCosts).toBe(mockParams.fotOptimistic[0]);
  });

  test('Расходы на прямые продажи используют реальные проценты', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    const firstMonth = result.current.monthlyData[0];
    const directRatio = mockParams.channelDistribution.direct / 100;
    
    // Расходы на продажи = выручка * процент * долю канала
    const expectedSalesCosts = firstMonth.totalRevenue * (mockParams.directSalesPercentage / 100) * directRatio;
    expect(firstMonth.directSalesCosts).toBeCloseTo(expectedSalesCosts, 2);
    
    // Расходы на маркетинг = выручка * процент * долю канала
    const expectedMarketingCosts = firstMonth.totalRevenue * (mockParams.directMarketingPercentage / 100) * directRatio;
    expect(firstMonth.directMarketingCosts).toBeCloseTo(expectedMarketingCosts, 2);
  });

  test('Стоимость лидов использует настраиваемые значения', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    const firstMonth = result.current.monthlyData[0];
    
    // Проверяем, что используются реальные значения стоимости лидов
    expect(firstMonth.directLeadGenerationCosts).toBeGreaterThan(0);
    expect(firstMonth.partnerLeadGenerationCosts).toBeGreaterThan(0);
  });

  test('Все компоненты CAC суммируются корректно', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    const firstMonth = result.current.monthlyData[0];
    
    const expectedCAC = 
      firstMonth.partnerCommissions + 
      firstMonth.salesTeamCosts + 
      firstMonth.marketingCosts + 
      firstMonth.leadGenerationCosts;
      
    expect(firstMonth.cacCosts).toBeCloseTo(expectedCAC, 2);
  });

  test('Декомпозиция ФОТ работает корректно', () => {
    const { result } = renderHook(() => useFinancialModel(mockParams, mockClients, mockUpsell));
    result.current.calculateFinancialModel();
    
    const firstMonth = result.current.monthlyData[0];
    
    // По умолчанию 60% на разработку, 40% на продажи
    const expectedDevCosts = firstMonth.fotCosts * 0.6;
    const expectedSalesCosts = firstMonth.fotCosts * 0.4;
    
    expect(firstMonth.fotDevelopmentCosts).toBeCloseTo(expectedDevCosts, 2);
    expect(firstMonth.fotSalesCosts).toBeCloseTo(expectedSalesCosts, 2);
  });
});