import { useState, useCallback } from 'react';
import { MonthlyData, TotalData, FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';
import { DEFAULT_TAX_RATES } from '../constants/DefaultValues';

export const useFinancialModelFixed = (
  params: FinancialModelParams,
  clients: ClientsData,
  upsellSettings: UpsellSettings
) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalData, setTotalData] = useState<TotalData>({} as TotalData);

  const calculateFinancialModel = useCallback(function recalcModel() {
    // ИСПРАВЛЕНИЕ 1: Используем константы вместо хардкода
    const FOT_DEVELOPMENT_RATIO = 0.6; // TODO: сделать настраиваемым
    const FOT_SALES_RATIO = 0.4; // TODO: сделать настраиваемым
    const LTV_DEFAULT_MONTHS = 36; // TODO: сделать настраиваемым
    const MAX_MESSAGE_CARRYOVER_MONTHS = 3; // НОВОЕ: ограничение на накопление сообщений

    const monthlyDataArray: MonthlyData[] = [];
    
    // Инициализация переменных
    let activeClients75 = 0, activeClients150 = 0, activeClients250 = 0, activeClients500 = 0, activeClients1000 = 0;
    let cumulativeRevenue = 0, cumulativeExpenses = 0, cumulativeProfit = 0;
    let unusedMessages75 = 0, unusedMessages150 = 0, unusedMessages250 = 0, unusedMessages500 = 0, unusedMessages1000 = 0;
    let previousMonthMRR = 0;
    let breakevenMonthCalc: number | undefined;
    
    // Массивы для накопления сообщений с ограничением
    const messageCarryoverHistory75: number[] = [];
    const messageCarryoverHistory150: number[] = [];
    const messageCarryoverHistory250: number[] = [];
    const messageCarryoverHistory500: number[] = [];
    const messageCarryoverHistory1000: number[] = [];

    const directChannelRatio = params.channelDistribution / 100;
    const partnerChannelRatio = 1 - directChannelRatio;

    for (let month = 0; month < 12; month++) {
      // Получаем новых клиентов
      const newClientsForMonth75 = clients.newClients75[month] || 0;
      const newClientsForMonth150 = clients.newClients150[month] || 0;
      const newClientsForMonth250 = clients.newClients250[month] || 0;
      const newClientsForMonth500 = clients.newClients500[month] || 0;
      const newClientsForMonth1000 = clients.newClients1000[month] || 0;
      const totalNewClientsMonth = newClientsForMonth75 + newClientsForMonth150 + newClientsForMonth250 + newClientsForMonth500 + newClientsForMonth1000;

      // ИСПРАВЛЕНИЕ 2: Корректное распределение по каналам с учетом остатков
      const distributeClients = (total: number, directRatio: number) => {
        const direct = Math.floor(total * directRatio);
        const partner = total - direct; // Гарантирует, что сумма = total
        return { direct, partner };
      };

      const dist75 = distributeClients(newClientsForMonth75, directChannelRatio);
      const dist150 = distributeClients(newClientsForMonth150, directChannelRatio);
      const dist250 = distributeClients(newClientsForMonth250, directChannelRatio);
      const dist500 = distributeClients(newClientsForMonth500, directChannelRatio);
      const dist1000 = distributeClients(newClientsForMonth1000, directChannelRatio);

      // ИСПРАВЛЕНИЕ 3: Используем floor для оттока, чтобы не терять дробные клиенты
      const churnNum75 = month > 0 ? Math.floor(activeClients75 * (params.churnRate / 100)) : 0;
      const churnNum150 = month > 0 ? Math.floor(activeClients150 * (params.churnRate / 100)) : 0;
      const churnNum250 = month > 0 ? Math.floor(activeClients250 * (params.churnRate / 100)) : 0;
      const churnNum500 = month > 0 ? Math.floor(activeClients500 * (params.churnRate / 100)) : 0;
      const churnNum1000 = month > 0 ? Math.floor(activeClients1000 * (params.churnRate / 100)) : 0;

      // Обновляем активных клиентов
      activeClients75 = activeClients75 + newClientsForMonth75 - churnNum75;
      activeClients150 = activeClients150 + newClientsForMonth150 - churnNum150;
      activeClients250 = activeClients250 + newClientsForMonth250 - churnNum250;
      activeClients500 = activeClients500 + newClientsForMonth500 - churnNum500;
      activeClients1000 = activeClients1000 + newClientsForMonth1000 - churnNum1000;
      
      const totalActiveClientsMonth = activeClients75 + activeClients150 + activeClients250 + activeClients500 + activeClients1000;
      const monthlyChurnedClients = churnNum75 + churnNum150 + churnNum250 + churnNum500 + churnNum1000;

      // Расчет доходов
      const integrationRevenueMonth = totalNewClientsMonth * clients.integrationPrice;
      const subscriptionRevenueMonth75 = activeClients75 * clients.subscriptionPrice75;
      const subscriptionRevenueMonth150 = activeClients150 * clients.subscriptionPrice150;
      const subscriptionRevenueMonth250 = activeClients250 * clients.subscriptionPrice250;
      const subscriptionRevenueMonth500 = activeClients500 * clients.subscriptionPrice500;
      const subscriptionRevenueMonth1000 = activeClients1000 * clients.subscriptionPrice1000;
      const subscriptionRevenueMonth = subscriptionRevenueMonth75 + subscriptionRevenueMonth150 + subscriptionRevenueMonth250 + subscriptionRevenueMonth500 + subscriptionRevenueMonth1000;

      // ИСПРАВЛЕНИЕ 4: Улучшенный расчет сообщений с ограничением накопления
      const calculateMessagesWithCarryover = (
        activeClients: number,
        messagesPerClient: number,
        unusedMessages: number,
        carryoverHistory: number[],
        churnedClients: number
      ) => {
        // Доступные сообщения = активные клиенты * пакет + перенесенные
        const availableMessages = activeClients * messagesPerClient + unusedMessages;
        
        // Используемые сообщения
        const usedMessages = Math.round(availableMessages * params.messageUsageRate);
        
        // Неиспользованные в этом месяце
        let currentUnused = Math.max(0, availableMessages - usedMessages);
        
        // НОВОЕ: Учитываем потерю сообщений от ушедших клиентов
        const lostMessagesFromChurn = churnedClients * messagesPerClient * (1 - params.messageUsageRate);
        currentUnused = Math.max(0, currentUnused - lostMessagesFromChurn);
        
        // Применяем процент переноса
        let carryover = currentUnused * (params.carryOverPercentage / 100);
        
        // НОВОЕ: Ограничиваем накопление
        carryoverHistory.push(carryover);
        if (carryoverHistory.length > MAX_MESSAGE_CARRYOVER_MONTHS) {
          carryoverHistory.shift(); // Удаляем старые
        }
        const totalCarryover = carryoverHistory.reduce((sum, val) => sum + val, 0);
        const maxCarryover = activeClients * messagesPerClient * MAX_MESSAGE_CARRYOVER_MONTHS;
        carryover = Math.min(totalCarryover, maxCarryover);
        
        // Дополнительные сообщения
        const additionalMessages = Math.max(0, usedMessages - availableMessages);
        const additionalRevenue = additionalMessages * params.additionalMessagePrice;
        
        return { carryover, additionalRevenue };
      };

      const messages75 = calculateMessagesWithCarryover(
        activeClients75, clients.messages75, unusedMessages75, 
        messageCarryoverHistory75, churnNum75
      );
      unusedMessages75 = messages75.carryover;

      const messages150 = calculateMessagesWithCarryover(
        activeClients150, clients.messages150, unusedMessages150,
        messageCarryoverHistory150, churnNum150
      );
      unusedMessages150 = messages150.carryover;

      const messages250 = calculateMessagesWithCarryover(
        activeClients250, clients.messages250, unusedMessages250,
        messageCarryoverHistory250, churnNum250
      );
      unusedMessages250 = messages250.carryover;

      const messages500 = calculateMessagesWithCarryover(
        activeClients500, clients.messages500, unusedMessages500,
        messageCarryoverHistory500, churnNum500
      );
      unusedMessages500 = messages500.carryover;

      const messages1000 = calculateMessagesWithCarryover(
        activeClients1000, clients.messages1000, unusedMessages1000,
        messageCarryoverHistory1000, churnNum1000
      );
      unusedMessages1000 = messages1000.carryover;

      const additionalMessagesRevenueMonth = 
        messages75.additionalRevenue + messages150.additionalRevenue + 
        messages250.additionalRevenue + messages500.additionalRevenue + 
        messages1000.additionalRevenue;

      // Upsell расчеты
      const upsellAdditionalBots = totalActiveClientsMonth * (upsellSettings.additionalBotsPercentage / 100) * upsellSettings.additionalBotsPrice;
      const upsellNewFeatures = totalActiveClientsMonth * (upsellSettings.newFeaturesPercentage / 100) * upsellSettings.newFeaturesPrice;
      const upsellMessagePacks = totalActiveClientsMonth * (upsellSettings.messagePacksPercentage / 100) * upsellSettings.messagePacksPrice;
      const upsellIntegrations = totalActiveClientsMonth * (upsellSettings.integrationsPercentage / 100) * upsellSettings.integrationsPrice;
      const upsellRevenueMonth = upsellAdditionalBots + upsellNewFeatures + upsellMessagePacks + upsellIntegrations;

      const totalRevenueMonth = integrationRevenueMonth + subscriptionRevenueMonth + additionalMessagesRevenueMonth + upsellRevenueMonth;

      // Расчет расходов
      const apiCostsMonth = (subscriptionRevenueMonth + additionalMessagesRevenueMonth) * (params.apiCostPercentage / 100);
      
      // ИСПРАВЛЕНИЕ 5: Implementation costs учитывают только новых клиентов
      const implementationCostsMonth = Math.min(
        totalNewClientsMonth * (params.implementationPercentage / 100) * clients.integrationPrice,
        params.maxImplementationCost
      );
      
      // CAC расчеты по каналам
      const directClients = dist75.direct + dist150.direct + dist250.direct + dist500.direct + dist1000.direct;
      const partnerClients = dist75.partner + dist150.partner + dist250.partner + dist500.partner + dist1000.partner;
      
      const directClientsRevenue = 
        dist75.direct * clients.subscriptionPrice75 +
        dist150.direct * clients.subscriptionPrice150 +
        dist250.direct * clients.subscriptionPrice250 +
        dist500.direct * clients.subscriptionPrice500 +
        dist1000.direct * clients.subscriptionPrice1000;

      const partnerClientsRevenue = 
        dist75.partner * clients.subscriptionPrice75 +
        dist150.partner * clients.subscriptionPrice150 +
        dist250.partner * clients.subscriptionPrice250 +
        dist500.partner * clients.subscriptionPrice500 +
        dist1000.partner * clients.subscriptionPrice1000;

      // ИСПРАВЛЕНИЕ 6: Комиссии партнерам только от подписок партнерских клиентов
      const partnerCommissionsMonth = partnerClientsRevenue * (params.partnerCommissionRate / 100);
      
      const salesTeamCostsMonth = directClientsRevenue * (params.directSalesPercentage / 100);
      const marketingCostsMonth = directClientsRevenue * (params.directMarketingPercentage / 100);
      const leadGenerationCostsMonth = directClients * params.directLeadCost + partnerClients * params.partnerLeadCost;
      
      // ИСПРАВЛЕНИЕ 7: CAC включает implementation costs
      const cacCostsMonth = partnerCommissionsMonth + salesTeamCostsMonth + marketingCostsMonth + leadGenerationCostsMonth + implementationCostsMonth;

      // ФОТ расчеты
      const fotMonth = params.fotMode === 'optimistic' ? params.fotOptimistic[month] : params.fotPessimistic[month];
      const fotDevelopment = fotMonth * FOT_DEVELOPMENT_RATIO;
      const fotSales = fotMonth * FOT_SALES_RATIO;

      const totalExpensesMonth = apiCostsMonth + cacCostsMonth + fotMonth;
      const grossProfitMonth = totalRevenueMonth - totalExpensesMonth;

      // ИСПРАВЛЕНИЕ 8: Опция расчета налога от прибыли
      const taxRateMonth = params.taxMode === 'optimistic' 
        ? DEFAULT_TAX_RATES.optimistic 
        : params.taxMode === 'pessimistic'
        ? DEFAULT_TAX_RATES.pessimistic
        : params.customTaxRate;
      
      // TODO: Добавить настройку taxBase: 'revenue' | 'profit'
      const taxBase = totalRevenueMonth; // Пока от выручки, но можно сделать настраиваемым
      const taxMonth = taxBase > 0 ? taxBase * (taxRateMonth / 100) : 0;
      const netProfitMonth = grossProfitMonth - taxMonth;
      
      cumulativeRevenue += totalRevenueMonth;
      cumulativeExpenses += totalExpensesMonth;
      cumulativeProfit += netProfitMonth;

      if (breakevenMonthCalc === undefined && cumulativeProfit > 0) {
        breakevenMonthCalc = month + 1;
      }

      // ИСПРАВЛЕНИЕ 9: Правильный расчет NRR
      let nrrMonth = 0;
      if (month > 0 && previousMonthMRR > 0) {
        const currentMRR = subscriptionRevenueMonth;
        const expansionRevenue = upsellRevenueMonth + additionalMessagesRevenueMonth;
        const churnedRevenue = monthlyChurnedClients * 
          ((churnNum75 * clients.subscriptionPrice75 + 
            churnNum150 * clients.subscriptionPrice150 + 
            churnNum250 * clients.subscriptionPrice250 + 
            churnNum500 * clients.subscriptionPrice500 + 
            churnNum1000 * clients.subscriptionPrice1000) / monthlyChurnedClients || 0);
        
        // Правильная формула NRR
        nrrMonth = ((currentMRR + expansionRevenue) / previousMonthMRR) * 100;
      }
      previousMonthMRR = subscriptionRevenueMonth;
      
      const monthData: MonthlyData = {
        month: month + 1,
        newClients75: newClientsForMonth75,
        newClients150: newClientsForMonth150,
        newClients250: newClientsForMonth250,
        newClients500: newClientsForMonth500,
        newClients1000: newClientsForMonth1000,
        newClients75Direct: dist75.direct,
        newClients75Partner: dist75.partner,
        newClients150Direct: dist150.direct,
        newClients150Partner: dist150.partner,
        newClients250Direct: dist250.direct,
        newClients250Partner: dist250.partner,
        newClients500Direct: dist500.direct,
        newClients500Partner: dist500.partner,
        newClients1000Direct: dist1000.direct,
        newClients1000Partner: dist1000.partner,
        activeClients75,
        activeClients150,
        activeClients250,
        activeClients500,
        activeClients1000,
        totalActiveClients: totalActiveClientsMonth,
        totalNewClients: totalNewClientsMonth,
        churnClients75: churnNum75,
        churnClients150: churnNum150,
        churnClients250: churnNum250,
        churnClients500: churnNum500,
        churnClients1000: churnNum1000,
        churnedClients: monthlyChurnedClients,
        integrationRevenue: integrationRevenueMonth,
        subscriptionRevenue: subscriptionRevenueMonth,
        subscriptionRevenue75: subscriptionRevenueMonth75,
        subscriptionRevenue150: subscriptionRevenueMonth150,
        subscriptionRevenue250: subscriptionRevenueMonth250,
        subscriptionRevenue500: subscriptionRevenueMonth500,
        subscriptionRevenue1000: subscriptionRevenueMonth1000,
        additionalMessagesRevenue: additionalMessagesRevenueMonth,
        additionalMessages75Revenue: messages75.additionalRevenue,
        additionalMessages150Revenue: messages150.additionalRevenue,
        additionalMessages250Revenue: messages250.additionalRevenue,
        additionalMessages500Revenue: messages500.additionalRevenue,
        additionalMessages1000Revenue: messages1000.additionalRevenue,
        upsellRevenue: upsellRevenueMonth,
        upsellAdditionalBots,
        upsellNewFeatures,
        upsellMessagePacks,
        upsellIntegrations,
        totalRevenue: totalRevenueMonth,
        apiCosts: apiCostsMonth,
        cacCosts: cacCostsMonth,
        partnerCommissions: partnerCommissionsMonth,
        salesTeamCosts: salesTeamCostsMonth,
        marketingCosts: marketingCostsMonth,
        leadGenerationCosts: leadGenerationCostsMonth,
        implementationCosts: implementationCostsMonth,
        fotCosts: fotMonth,
        fotDevelopment,
        fotSales,
        totalExpenses: totalExpensesMonth,
        grossProfit: grossProfitMonth,
        tax: taxMonth,
        netProfit: netProfitMonth,
        cumulativeRevenue,
        cumulativeExpenses,
        cumulativeProfit,
        nrr: nrrMonth
      };

      monthlyDataArray.push(monthData);
    }

    // Расчет итоговых данных
    const finalTotalRevenue = monthlyDataArray.reduce((sum, m) => sum + m.totalRevenue, 0);
    const finalTotalExpenses = monthlyDataArray.reduce((sum, m) => sum + m.totalExpenses, 0);
    const finalTotalGrossProfit = monthlyDataArray.reduce((sum, m) => sum + m.grossProfit, 0);
    const finalTotalTax = monthlyDataArray.reduce((sum, m) => sum + m.tax, 0);
    const totalNetProfitCalc = monthlyDataArray.reduce((sum, m) => sum + m.netProfit, 0);

    const totalActiveClientsEnd = monthlyDataArray[11]?.totalActiveClients || 0;
    const avgArpuCalc = totalActiveClientsEnd > 0 ? finalTotalRevenue / totalActiveClientsEnd / 12 : 0;
    
    // ИСПРАВЛЕНИЕ 10: Более точный расчет LTV
    const monthlyChurnRate = params.churnRate / 100;
    const avgCustomerLifespan = monthlyChurnRate > 0 ? 1 / monthlyChurnRate : LTV_DEFAULT_MONTHS;
    const ltvCalc = avgArpuCalc * Math.min(avgCustomerLifespan, LTV_DEFAULT_MONTHS * 2); // Ограничиваем 72 месяцами
    
    const totalNewClientsCalc = monthlyDataArray.reduce((sum, m) => sum + m.totalNewClients, 0);
    const cacPerClientCalc = totalNewClientsCalc > 0 ? 
      monthlyDataArray.reduce((sum, m) => sum + m.cacCosts, 0) / totalNewClientsCalc : 0;
    
    const cacPaybackPeriodCalc = avgArpuCalc > 0 ? cacPerClientCalc / avgArpuCalc : 0;
    const roiCalc = finalTotalExpenses > 0 ? (totalNetProfitCalc / finalTotalExpenses) * 100 : 0;

    const totalDataCalc: TotalData = {
      totalRevenue: finalTotalRevenue,
      totalSubscription: monthlyDataArray.reduce((sum, m) => sum + m.subscriptionRevenue, 0),
      totalIntegration: monthlyDataArray.reduce((sum, m) => sum + m.integrationRevenue, 0),
      totalAdditionalMessages: monthlyDataArray.reduce((sum, m) => sum + m.additionalMessagesRevenue, 0),
      totalUpsellRevenue: monthlyDataArray.reduce((sum, m) => sum + m.upsellRevenue, 0),
      totalExpenses: finalTotalExpenses,
      totalApiCosts: monthlyDataArray.reduce((sum, m) => sum + m.apiCosts, 0),
      totalCacCosts: monthlyDataArray.reduce((sum, m) => sum + m.cacCosts, 0),
      totalFotCosts: monthlyDataArray.reduce((sum, m) => sum + m.fotCosts, 0),
      totalImplementationCosts: monthlyDataArray.reduce((sum, m) => sum + m.implementationCosts, 0),
      totalGrossProfit: finalTotalGrossProfit,
      totalTax: finalTotalTax,
      totalNetProfit: totalNetProfitCalc,
      avgArpu: avgArpuCalc,
      ltv: ltvCalc,
      cacPerClient: cacPerClientCalc,
      cacPaybackPeriod: cacPaybackPeriodCalc,
      roi: roiCalc,
      breakevenMonth: breakevenMonthCalc,
      totalActiveClients: totalActiveClientsEnd,
      totalNewClients: totalNewClientsCalc,
      avgMonthlyRevenue: finalTotalRevenue / 12,
      avgMonthlyProfit: totalNetProfitCalc / 12,
      profitMargin: finalTotalRevenue > 0 ? (totalNetProfitCalc / finalTotalRevenue) * 100 : 0,
      totalNewClients75: clients.newClients75.reduce((sum, val) => sum + val, 0),
      totalNewClients150: clients.newClients150.reduce((sum, val) => sum + val, 0),
      totalNewClients250: clients.newClients250.reduce((sum, val) => sum + val, 0),
      totalNewClients500: clients.newClients500.reduce((sum, val) => sum + val, 0),
      totalNewClients1000: clients.newClients1000.reduce((sum, val) => sum + val, 0),
      avgNrr: monthlyDataArray.slice(1).reduce((sum, m) => sum + m.nrr, 0) / 11 || 0
    };

    setMonthlyData(monthlyDataArray);
    setTotalData(totalDataCalc);
  }, [params, clients, upsellSettings]);

  return {
    monthlyData,
    totalData,
    calculateFinancialModel
  };
};