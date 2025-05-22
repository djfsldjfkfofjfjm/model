import { useState, useCallback } from 'react';
import {
  FinancialModelParams,
  MonthlyData,
  TotalData,
  ClientsData,
  UpsellSettings
} from '../types/FinancialTypes';
import {
  DEFAULT_TAX_RATES
  // DEFAULT_FOT_VALUES, // Больше не используется напрямую здесь
} from '../constants/DefaultValues';

export const useFinancialModel = (
  params: FinancialModelParams,
  clients: ClientsData,
  upsellSettings: UpsellSettings
) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalData, setTotalData] = useState<TotalData>({} as TotalData);

  const calculateFinancialModel = useCallback(function recalcModel() {
    const data: MonthlyData[] = [];
    
    let activeClients75 = 0;
    let activeClients150 = 0;
    let activeClients250 = 0;
    let activeClients500 = 0;
    let activeClients1000 = 0;
    
    let cumulativeRevenue = 0;
    let cumulativeExpenses = 0;
    let cumulativeProfit = 0;

    let totalIntegrationRevenue = 0;
    let totalSubscriptionRevenue = 0;
    let totalAdditionalMessagesRevenueCalc = 0;
    let totalUpsellRevenueAccum = 0;
    let totalApiCostsCalc = 0;
    let totalCacCostsCalc = 0;
    let totalPartnerCommissionsCalc = 0;
    let totalSalesTeamCostsCalc = 0;
    let totalMarketingCostsCalc = 0;
    let totalLeadGenerationCostsCalc = 0;
    let totalImplementationCostsCalc = 0;
    let totalFotCostsCalc = 0;
    let totalGrossProfitCalc = 0;
    let totalTaxCalc = 0;
    let totalNetProfitCalc = 0;
    
    let previousMonthMRR = 0;
    let unusedMessages75 = 0;
    let unusedMessages150 = 0;
    let unusedMessages250 = 0;
    let unusedMessages500 = 0;
    let unusedMessages1000 = 0;

    let totalChurnedClientsAgg = 0;
    let totalChurnedRevenueAgg = 0;
    let totalAdditionalBotsRevenueAgg = 0;
    let totalNewFeaturesRevenueAgg = 0;
    let totalMessageExpansionRevenueAgg = 0;
    let totalAdditionalIntegrationsRevenueAgg = 0;

    let breakevenMonthCalc: number | undefined = undefined;


    for (let month = 0; month < 12; month++) {
      const newClientsForMonth75 = clients.newClients75[month] || 0;
      const newClientsForMonth150 = clients.newClients150[month] || 0;
      const newClientsForMonth250 = clients.newClients250[month] || 0;
      const newClientsForMonth500 = clients.newClients500[month] || 0;
      const newClientsForMonth1000 = clients.newClients1000[month] || 0;
      
      const churnNum75 = month > 0 ? Math.round(activeClients75 * (params.churnRate / 100)) : 0;
      const churnNum150 = month > 0 ? Math.round(activeClients150 * (params.churnRate / 100)) : 0;
      const churnNum250 = month > 0 ? Math.round(activeClients250 * (params.churnRate / 100)) : 0;
      const churnNum500 = month > 0 ? Math.round(activeClients500 * (params.churnRate / 100)) : 0;
      const churnNum1000 = month > 0 ? Math.round(activeClients1000 * (params.churnRate / 100)) : 0;
      const monthlyChurnedClients = churnNum75 + churnNum150 + churnNum250 + churnNum500 + churnNum1000;
      totalChurnedClientsAgg += monthlyChurnedClients;
      
      const churnedRevenueMonthly = 
          churnNum75 * clients.subscriptionPrice75 + 
          churnNum150 * clients.subscriptionPrice150 + 
          churnNum250 * clients.subscriptionPrice250 + 
          churnNum500 * clients.subscriptionPrice500 + 
          churnNum1000 * clients.subscriptionPrice1000;
      totalChurnedRevenueAgg += churnedRevenueMonthly;

      activeClients75 = activeClients75 + newClientsForMonth75 - churnNum75;
      activeClients150 = activeClients150 + newClientsForMonth150 - churnNum150;
      activeClients250 = activeClients250 + newClientsForMonth250 - churnNum250;
      activeClients500 = activeClients500 + newClientsForMonth500 - churnNum500;
      activeClients1000 = activeClients1000 + newClientsForMonth1000 - churnNum1000;
      
      
      const totalActiveClientsMonth = activeClients75 + activeClients150 + activeClients250 + activeClients500 + activeClients1000;
      const totalNewClientsMonth = newClientsForMonth75 + newClientsForMonth150 + newClientsForMonth250 + newClientsForMonth500 + newClientsForMonth1000;
      
      const integrationRevenueMonth = totalNewClientsMonth * params.integrationPrice;
      
      const subscriptionRevenueMonth75 = activeClients75 * clients.subscriptionPrice75;
      const subscriptionRevenueMonth150 = activeClients150 * clients.subscriptionPrice150;
      const subscriptionRevenueMonth250 = activeClients250 * clients.subscriptionPrice250;
      const subscriptionRevenueMonth500 = activeClients500 * clients.subscriptionPrice500;
      const subscriptionRevenueMonth1000 = activeClients1000 * clients.subscriptionPrice1000;
      const subscriptionRevenueMonth = subscriptionRevenueMonth75 + subscriptionRevenueMonth150 + subscriptionRevenueMonth250 + subscriptionRevenueMonth500 + subscriptionRevenueMonth1000;
      
      const availableMessagesMonth75 = clients.messages75 * activeClients75 + unusedMessages75;
      const usedMessagesMonth75 = activeClients75 * clients.messages75 * (params.messageUsageRate / 100);
      const additionalMessagesMonth75 = Math.max(0, usedMessagesMonth75 - availableMessagesMonth75);
      unusedMessages75 = Math.max(0, availableMessagesMonth75 - usedMessagesMonth75) * (params.carryOverPercentage / 100);

      const availableMessagesMonth150 = clients.messages150 * activeClients150 + unusedMessages150;
      const usedMessagesMonth150 = activeClients150 * clients.messages150 * (params.messageUsageRate / 100);
      const additionalMessagesMonth150 = Math.max(0, usedMessagesMonth150 - availableMessagesMonth150);
      unusedMessages150 = Math.max(0, availableMessagesMonth150 - usedMessagesMonth150) * (params.carryOverPercentage / 100);
      
      // ... (repeat for 250, 500, 1000)
      const availableMessagesMonth250 = clients.messages250 * activeClients250 + unusedMessages250;
      const usedMessagesMonth250 = activeClients250 * clients.messages250 * (params.messageUsageRate / 100);
      const additionalMessagesMonth250 = Math.max(0, usedMessagesMonth250 - availableMessagesMonth250);
      unusedMessages250 = Math.max(0, availableMessagesMonth250 - usedMessagesMonth250) * (params.carryOverPercentage / 100);

      const availableMessagesMonth500 = clients.messages500 * activeClients500 + unusedMessages500;
      const usedMessagesMonth500 = activeClients500 * clients.messages500 * (params.messageUsageRate / 100);
      const additionalMessagesMonth500 = Math.max(0, usedMessagesMonth500 - availableMessagesMonth500);
      unusedMessages500 = Math.max(0, availableMessagesMonth500 - usedMessagesMonth500) * (params.carryOverPercentage / 100);

      const availableMessagesMonth1000 = clients.messages1000 * activeClients1000 + unusedMessages1000;
      const usedMessagesMonth1000 = activeClients1000 * clients.messages1000 * (params.messageUsageRate / 100);
      const additionalMessagesMonth1000 = Math.max(0, usedMessagesMonth1000 - availableMessagesMonth1000);
      unusedMessages1000 = Math.max(0, availableMessagesMonth1000 - usedMessagesMonth1000) * (params.carryOverPercentage / 100);

      const totalAdditionalMessagesMonth = additionalMessagesMonth75 + additionalMessagesMonth150 + additionalMessagesMonth250 + additionalMessagesMonth500 + additionalMessagesMonth1000;
      const additionalMessagesRevenueMonth = totalAdditionalMessagesMonth * params.additionalMessagePrice;
      
      const additionalBotsClientsMonth = Math.round(totalActiveClientsMonth * (upsellSettings.additionalBotsRate / 100));
      const additionalBotsRevenueMonth = additionalBotsClientsMonth * upsellSettings.additionalBotsPrice;
      const newFeaturesClientsMonth = Math.round(totalActiveClientsMonth * (upsellSettings.newFeaturesRate / 100));
      const newFeaturesRevenueMonth = newFeaturesClientsMonth * upsellSettings.newFeaturesPrice;
      const messageExpansionClientsMonth = Math.round(totalActiveClientsMonth * (upsellSettings.messageExpansionRate / 100));
      const messageExpansionRevenueMonth = messageExpansionClientsMonth * upsellSettings.messageExpansionPrice;
      const additionalIntegrationsClientsMonth = Math.round(totalActiveClientsMonth * (upsellSettings.additionalIntegrationsRate / 100));
      const additionalIntegrationsRevenueMonth = additionalIntegrationsClientsMonth * upsellSettings.additionalIntegrationsPrice;
      const upsellRevenueMonth = additionalBotsRevenueMonth + newFeaturesRevenueMonth + messageExpansionRevenueMonth + additionalIntegrationsRevenueMonth;
      
      totalAdditionalBotsRevenueAgg += additionalBotsRevenueMonth;
      totalNewFeaturesRevenueAgg += newFeaturesRevenueMonth;
      totalMessageExpansionRevenueAgg += messageExpansionRevenueMonth;
      totalAdditionalIntegrationsRevenueAgg += additionalIntegrationsRevenueMonth;

      const totalRevenueMonth = integrationRevenueMonth + subscriptionRevenueMonth + additionalMessagesRevenueMonth + upsellRevenueMonth;
      
      const apiCostsMonth = (subscriptionRevenueMonth + additionalMessagesRevenueMonth) * (params.apiCostPercentage / 100);

      // CAC без учета глобального коэффициента
      const partnerCommissionsMonth = integrationRevenueMonth * (params.partnerCommissionRate / 100);
      const salesTeamCostsMonth = totalRevenueMonth * (params.salesTeamPercentage / 100);
      const marketingCostsMonth = integrationRevenueMonth * (params.marketingPercentage / 100);
      const leadGenerationCostsMonth = totalNewClientsMonth * params.leadGenerationPerClient;
      const calculatedImplCostsMonth = params.integrationPrice * (params.implementationPercentage / 100);
      const implementationCostsPerClientMonth = Math.min(calculatedImplCostsMonth, params.maxImplementationCost);
      const implementationCostsMonth = totalNewClientsMonth * implementationCostsPerClientMonth;
      const fotCostsMonth = params.fotMode === 'optimistic' 
        ? params.fotOptimistic[month] 
        : params.fotPessimistic[month];
      const cacCostsMonth = partnerCommissionsMonth + salesTeamCostsMonth + marketingCostsMonth + leadGenerationCostsMonth;
      const totalExpensesMonth = apiCostsMonth + cacCostsMonth + implementationCostsMonth + fotCostsMonth;
      
      const grossProfitMonth = totalRevenueMonth - totalExpensesMonth;
      const taxRateMonth = params.taxMode === 'optimistic' 
        ? DEFAULT_TAX_RATES.optimistic 
        : DEFAULT_TAX_RATES.pessimistic;
      // ИСПРАВЛЕНИЕ: Налог рассчитывается с выручки, а не с прибыли
      const taxMonth = totalRevenueMonth > 0 ? totalRevenueMonth * (taxRateMonth / 100) : 0;
      const netProfitMonth = grossProfitMonth - taxMonth;
      
      cumulativeRevenue += totalRevenueMonth;
      cumulativeExpenses += totalExpensesMonth;
      cumulativeProfit += netProfitMonth;

      if (breakevenMonthCalc === undefined && cumulativeProfit > 0) {
        breakevenMonthCalc = month + 1;
      }

      let nrrMonth = 0;
      if (month > 0 && previousMonthMRR > 0) {
        nrrMonth = ((previousMonthMRR + upsellRevenueMonth - churnedRevenueMonthly) / previousMonthMRR) * 100;
      }
      previousMonthMRR = subscriptionRevenueMonth;
      
      const monthData = {
        month: month + 1,
        newClients75: newClientsForMonth75, newClients150: newClientsForMonth150, newClients250: newClientsForMonth250, newClients500: newClientsForMonth500, newClients1000: newClientsForMonth1000,
        activeClients75, activeClients150, activeClients250, activeClients500, activeClients1000,
        totalActiveClients: totalActiveClientsMonth, totalNewClients: totalNewClientsMonth,
        churnClients75: churnNum75, churnClients150: churnNum150, churnClients250: churnNum250, churnClients500: churnNum500, churnClients1000: churnNum1000,
        churnedClients: monthlyChurnedClients, // Added
        integrationRevenue: integrationRevenueMonth,
        subscriptionRevenue: subscriptionRevenueMonth,
        subscriptionRevenue75: subscriptionRevenueMonth75, subscriptionRevenue150: subscriptionRevenueMonth150, subscriptionRevenue250: subscriptionRevenueMonth250, subscriptionRevenue500: subscriptionRevenueMonth500, subscriptionRevenue1000: subscriptionRevenueMonth1000,
        additionalMessagesRevenue: additionalMessagesRevenueMonth,
        upsellRevenue: upsellRevenueMonth,
        totalRevenue: totalRevenueMonth,
        nrr: nrrMonth,
        additionalBotsClients: additionalBotsClientsMonth, additionalBotsRevenue: additionalBotsRevenueMonth,
        newFeaturesClients: newFeaturesClientsMonth, newFeaturesRevenue: newFeaturesRevenueMonth,
        messageExpansionClients: messageExpansionClientsMonth, messageExpansionRevenue: messageExpansionRevenueMonth,
        additionalIntegrationsClients: additionalIntegrationsClientsMonth, additionalIntegrationsRevenue: additionalIntegrationsRevenueMonth,
        apiCosts: apiCostsMonth, cacCosts: cacCostsMonth,
        partnerCommissions: partnerCommissionsMonth, salesTeamCosts: salesTeamCostsMonth, marketingCosts: marketingCostsMonth, leadGenerationCosts: leadGenerationCostsMonth,
        implementationCosts: implementationCostsMonth, fotCosts: fotCostsMonth,
        totalExpenses: totalExpensesMonth,
        grossProfit: grossProfitMonth, tax: taxMonth, netProfit: netProfitMonth,
        arpu: totalActiveClientsMonth > 0 ? subscriptionRevenueMonth / totalActiveClientsMonth : 0,
        usedMessages75: usedMessagesMonth75, usedMessages150: usedMessagesMonth150, usedMessages250: usedMessagesMonth250, usedMessages500: usedMessagesMonth500, usedMessages1000: usedMessagesMonth1000,
        availableMessages75: availableMessagesMonth75, availableMessages150: availableMessagesMonth150, availableMessages250: availableMessagesMonth250, availableMessages500: availableMessagesMonth500, availableMessages1000: availableMessagesMonth1000,
        additionalMessages75: additionalMessagesMonth75, additionalMessages150: additionalMessagesMonth150, additionalMessages250: additionalMessagesMonth250, additionalMessages500: additionalMessagesMonth500, additionalMessages1000: additionalMessagesMonth1000,
        unusedMessages75: unusedMessages75, unusedMessages150: unusedMessages150, unusedMessages250: unusedMessages250, unusedMessages500: unusedMessages500, unusedMessages1000: unusedMessages1000,
        totalAdditionalMessages: totalAdditionalMessagesMonth,
        cumulativeRevenue, cumulativeExpenses, cumulativeProfit, // Added
      };
      
      
      data.push(monthData);
      
      totalIntegrationRevenue += integrationRevenueMonth;
      totalSubscriptionRevenue += subscriptionRevenueMonth;
      totalAdditionalMessagesRevenueCalc += additionalMessagesRevenueMonth;
      totalUpsellRevenueAccum += upsellRevenueMonth;
      totalApiCostsCalc += apiCostsMonth;
      totalCacCostsCalc += cacCostsMonth;
      totalPartnerCommissionsCalc += partnerCommissionsMonth;
      totalSalesTeamCostsCalc += salesTeamCostsMonth;
      totalMarketingCostsCalc += marketingCostsMonth;
      totalLeadGenerationCostsCalc += leadGenerationCostsMonth;
      totalImplementationCostsCalc += implementationCostsMonth;
      totalFotCostsCalc += fotCostsMonth;
      totalGrossProfitCalc += grossProfitMonth;
      totalTaxCalc += taxMonth;
      totalNetProfitCalc += netProfitMonth;
    }
    
    const finalTotalRevenue = totalIntegrationRevenue + totalSubscriptionRevenue + totalAdditionalMessagesRevenueCalc + totalUpsellRevenueAccum;
    const finalTotalExpenses = totalApiCostsCalc + totalCacCostsCalc + totalImplementationCostsCalc + totalFotCostsCalc;
    
    const avgMonthlyRevenueCalc = finalTotalRevenue / 12;
    const avgMonthlyProfitCalc = totalNetProfitCalc / 12;
    
    const avgArpuCalc = data.length > 0 ? data.reduce((sum, month) => sum + (month.arpu || 0), 0) / data.length : 0;
    const ltvCalc = avgArpuCalc * 36; // LTV period is 36 months
    
    const totalNewClientsAgg = data.reduce((sum, month) => sum + month.totalNewClients, 0);
    const cacPerClientCalc = totalNewClientsAgg > 0 ? totalCacCostsCalc / totalNewClientsAgg : 0;
    const ltvCacRatioCalc = cacPerClientCalc > 0 ? ltvCalc / cacPerClientCalc : 0;
    const cacPaybackPeriodCalc = avgArpuCalc > 0 ? cacPerClientCalc / avgArpuCalc : 0;
    const profitMarginCalc = finalTotalRevenue > 0 ? (totalNetProfitCalc / finalTotalRevenue) * 100 : 0;
    const roiCalc = finalTotalExpenses > 0 ? (totalNetProfitCalc / finalTotalExpenses) * 100 : 0;
    const implementationMarginCalc = totalIntegrationRevenue > 0 ? ((totalIntegrationRevenue - totalImplementationCostsCalc) / totalIntegrationRevenue) * 100 : 0;
    
    // NRR for the last month as an example for totalData.nrr, or average.
    // For simplicity, using last month's NRR if available.
    const lastMonthNrr = data.length > 0 ? data[data.length - 1].nrr : 0;

    const totalDataCalc: TotalData = {
      totalNewClients: totalNewClientsAgg,
      totalRevenue: finalTotalRevenue,
      totalExpenses: finalTotalExpenses,
      totalNetProfit: totalNetProfitCalc,
      totalGrossProfit: totalGrossProfitCalc,
      avgMonthlyRevenue: avgMonthlyRevenueCalc,
      avgMonthlyProfit: avgMonthlyProfitCalc,
      profitMargin: profitMarginCalc,
      totalIntegration: totalIntegrationRevenue,
      totalSubscription: totalSubscriptionRevenue,
      totalAdditionalMessagesRevenue: totalAdditionalMessagesRevenueCalc,
      totalUpsellRevenue: totalUpsellRevenueAccum,
      totalApiCosts: totalApiCostsCalc,
      totalCacCosts: totalCacCostsCalc,
      totalImplementationCosts: totalImplementationCostsCalc,
      totalFotCosts: totalFotCostsCalc,
      totalPartnerCommissions: totalPartnerCommissionsCalc,
      totalSalesTeamCosts: totalSalesTeamCostsCalc,
      totalMarketingCosts: totalMarketingCostsCalc,
      totalLeadGenerationCosts: totalLeadGenerationCostsCalc,
      avgArpu: avgArpuCalc,
      ltv: ltvCalc,
      cacPerClient: cacPerClientCalc,
      ltvCacRatio: ltvCacRatioCalc,
      cacPaybackPeriod: cacPaybackPeriodCalc,
      totalTax: totalTaxCalc,
      // Newly added fields to TotalData
      finalActiveClients: data.length > 0 ? data[data.length - 1].totalActiveClients : 0,
      totalChurnedClients: totalChurnedClientsAgg,
      churnRate: params.churnRate, // from input params
      roi: roiCalc,
      implementationMargin: implementationMarginCalc,
      breakevenMonth: breakevenMonthCalc,
      nrr: lastMonthNrr, 
      expansionRevenue: totalUpsellRevenueAccum, // Upsell is considered expansion
      churnedRevenue: totalChurnedRevenueAgg,
      totalAdditionalBotsRevenue: totalAdditionalBotsRevenueAgg,
      totalNewFeaturesRevenue: totalNewFeaturesRevenueAgg,
      totalMessageExpansionRevenue: totalMessageExpansionRevenueAgg,
      totalAdditionalIntegrationsRevenue: totalAdditionalIntegrationsRevenueAgg,
    };
    
    setMonthlyData(data);
    setTotalData(totalDataCalc);
  }, [
    clients, 
    params, 
    upsellSettings
  ]);

  return {
    monthlyData,
    totalData,
    calculateFinancialModel
  };
};
