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
    // ИСПРАВЛЕНО: Валидация входных параметров
    if (params.churnRate < 0 || params.churnRate > 100) {
      console.warn('Churn rate должен быть от 0 до 100, получен:', params.churnRate);
    }
    if (params.churnRate >= 90) {
      console.warn('ВНИМАНИЕ: Очень высокий churn rate может привести к потере всех клиентов!');
    }
    if (params.apiCostPercentage < 0 || params.apiCostPercentage > 100) {
      console.warn('API cost percentage должен быть от 0 до 100, получен:', params.apiCostPercentage);
    }
    if (params.messageUsageRate < 0) {
      console.warn('Message usage rate не может быть отрицательным, получен:', params.messageUsageRate);
    }
    
    // Диагностическое логирование
    console.log('🔍 Диагностика параметров сообщений:', {
      'messageUsageRate': params.messageUsageRate + '%',
      'carryOverPercentage': params.carryOverPercentage + '%',
      'additionalMessagePrice': '$' + params.additionalMessagePrice,
      'Проблема с messageUsageRate': params.messageUsageRate < 50 ? '⚠️ Слишком низкое!' : '✅ OK',
      'Функция вызвана': new Date().toLocaleTimeString()
    });
    
    // Константа для максимального накопления сообщений
    const MESSAGE_CARRYOVER_MONTHS_LIMIT = params.messageCarryoverLimit || 3;
    
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
      
      // ПРАВИЛЬНАЯ ЛОГИКА: Клиенты покупают ПАКЕТЫ ДИАЛОГОВ, а не подписку!
      // Если накопленных сообщений достаточно - НЕ покупают новый пакет
      const monthlyUsage75 = activeClients75 * clients.messages75 * (params.messageUsageRate / 100);
      const monthlyUsage150 = activeClients150 * clients.messages150 * (params.messageUsageRate / 100);
      const monthlyUsage250 = activeClients250 * clients.messages250 * (params.messageUsageRate / 100);
      const monthlyUsage500 = activeClients500 * clients.messages500 * (params.messageUsageRate / 100);
      const monthlyUsage1000 = activeClients1000 * clients.messages1000 * (params.messageUsageRate / 100);
      
      // Покупают только если накопленных НЕ хватает на месячное использование
      const needNewPackage75 = unusedMessages75 < monthlyUsage75;
      const needNewPackage150 = unusedMessages150 < monthlyUsage150;
      const needNewPackage250 = unusedMessages250 < monthlyUsage250;
      const needNewPackage500 = unusedMessages500 < monthlyUsage500;
      const needNewPackage1000 = unusedMessages1000 < monthlyUsage1000;
      
      // Если нужен новый пакет - все активные клиенты покупают
      // Если НЕ нужен - никто не покупает
      const buyingClients75 = needNewPackage75 ? activeClients75 : 0;
      const buyingClients150 = needNewPackage150 ? activeClients150 : 0;
      const buyingClients250 = needNewPackage250 ? activeClients250 : 0;
      const buyingClients500 = needNewPackage500 ? activeClients500 : 0;
      const buyingClients1000 = needNewPackage1000 ? activeClients1000 : 0;
      
      const subscriptionRevenueMonth75 = buyingClients75 * clients.subscriptionPrice75;
      const subscriptionRevenueMonth150 = buyingClients150 * clients.subscriptionPrice150;
      const subscriptionRevenueMonth250 = buyingClients250 * clients.subscriptionPrice250;
      const subscriptionRevenueMonth500 = buyingClients500 * clients.subscriptionPrice500;
      const subscriptionRevenueMonth1000 = buyingClients1000 * clients.subscriptionPrice1000;
      const subscriptionRevenueMonth = subscriptionRevenueMonth75 + subscriptionRevenueMonth150 + subscriptionRevenueMonth250 + subscriptionRevenueMonth500 + subscriptionRevenueMonth1000;
      
      // Диагностика покупок при низком использовании
      if (month === 0 && params.messageUsageRate < 50) {
        console.log('🛒 Диагностика покупок пакетов (месяц 1):', {
          'Тариф $75': {
            'Активные клиенты': activeClients75,
            'Накоплено сообщений': unusedMessages75,
            'Купят пакет': buyingClients75,
            'Выручка': subscriptionRevenueMonth75
          },
          'Общая выручка от подписок': subscriptionRevenueMonth
        });
      }
      
      // Доступные сообщения = накопленные + новые (только если купили пакет)
      const availableMessagesMonth75 = unusedMessages75 + (buyingClients75 * clients.messages75);
      const usedMessagesMonth75 = activeClients75 * clients.messages75 * (params.messageUsageRate / 100);
      const additionalMessagesMonth75 = Math.max(0, usedMessagesMonth75 - availableMessagesMonth75);
      // ИСПРАВЛЕНО: Ограничение накопления сообщений
      const maxCarryover75 = activeClients75 * clients.messages75 * MESSAGE_CARRYOVER_MONTHS_LIMIT;
      const newUnused75 = Math.max(0, availableMessagesMonth75 - usedMessagesMonth75) * (params.carryOverPercentage / 100);
      unusedMessages75 = Math.min(newUnused75, maxCarryover75);

      const availableMessagesMonth150 = unusedMessages150 + (buyingClients150 * clients.messages150);
      const usedMessagesMonth150 = activeClients150 * clients.messages150 * (params.messageUsageRate / 100);
      const additionalMessagesMonth150 = Math.max(0, usedMessagesMonth150 - availableMessagesMonth150);
      const maxCarryover150 = activeClients150 * clients.messages150 * MESSAGE_CARRYOVER_MONTHS_LIMIT;
      const newUnused150 = Math.max(0, availableMessagesMonth150 - usedMessagesMonth150) * (params.carryOverPercentage / 100);
      unusedMessages150 = Math.min(newUnused150, maxCarryover150);
      
      // ... (repeat for 250, 500, 1000)
      const availableMessagesMonth250 = unusedMessages250 + (buyingClients250 * clients.messages250);
      const usedMessagesMonth250 = activeClients250 * clients.messages250 * (params.messageUsageRate / 100);
      const additionalMessagesMonth250 = Math.max(0, usedMessagesMonth250 - availableMessagesMonth250);
      const maxCarryover250 = activeClients250 * clients.messages250 * MESSAGE_CARRYOVER_MONTHS_LIMIT;
      const newUnused250 = Math.max(0, availableMessagesMonth250 - usedMessagesMonth250) * (params.carryOverPercentage / 100);
      unusedMessages250 = Math.min(newUnused250, maxCarryover250);

      const availableMessagesMonth500 = unusedMessages500 + (buyingClients500 * clients.messages500);
      const usedMessagesMonth500 = activeClients500 * clients.messages500 * (params.messageUsageRate / 100);
      const additionalMessagesMonth500 = Math.max(0, usedMessagesMonth500 - availableMessagesMonth500);
      const maxCarryover500 = activeClients500 * clients.messages500 * MESSAGE_CARRYOVER_MONTHS_LIMIT;
      const newUnused500 = Math.max(0, availableMessagesMonth500 - usedMessagesMonth500) * (params.carryOverPercentage / 100);
      unusedMessages500 = Math.min(newUnused500, maxCarryover500);

      const availableMessagesMonth1000 = unusedMessages1000 + (buyingClients1000 * clients.messages1000);
      const usedMessagesMonth1000 = activeClients1000 * clients.messages1000 * (params.messageUsageRate / 100);
      const additionalMessagesMonth1000 = Math.max(0, usedMessagesMonth1000 - availableMessagesMonth1000);
      const maxCarryover1000 = activeClients1000 * clients.messages1000 * MESSAGE_CARRYOVER_MONTHS_LIMIT;
      const newUnused1000 = Math.max(0, availableMessagesMonth1000 - usedMessagesMonth1000) * (params.carryOverPercentage / 100);
      unusedMessages1000 = Math.min(newUnused1000, maxCarryover1000);

      const totalAdditionalMessagesMonth = additionalMessagesMonth75 + additionalMessagesMonth150 + additionalMessagesMonth250 + additionalMessagesMonth500 + additionalMessagesMonth1000;
      const additionalMessagesRevenueMonth = totalAdditionalMessagesMonth * params.additionalMessagePrice;
      
      // Диагностика расчёта сообщений для первого месяца
      if (month === 0 && totalActiveClientsMonth > 0) {
        const totalUsed = Math.round(usedMessagesMonth75 + usedMessagesMonth150 + usedMessagesMonth250 + usedMessagesMonth500 + usedMessagesMonth1000);
        const totalAvailable = Math.round(availableMessagesMonth75 + availableMessagesMonth150 + availableMessagesMonth250 + availableMessagesMonth500 + availableMessagesMonth1000);
        const totalPackageSize = activeClients75 * clients.messages75 + activeClients150 * clients.messages150 + activeClients250 * clients.messages250 + activeClients500 * clients.messages500 + activeClients1000 * clients.messages1000;
        
        console.log('📊 Расчёт сообщений (месяц 1):', {
          'Активные клиенты': totalActiveClientsMonth,
          'Использование %': params.messageUsageRate,
          'Размер пакетов всего': totalPackageSize,
          'Использовано сообщений': totalUsed,
          'Доступно сообщений': totalAvailable,
          'Дополнительные сообщения': totalAdditionalMessagesMonth,
          'Выручка от доп. сообщений': additionalMessagesRevenueMonth.toFixed(2),
          '⚠️ Превышение?': totalUsed > totalAvailable ? 'ДА!' : 'Нет'
        });
      }
      
      
      // Детальная выручка от дополнительных сообщений по тарифам
      const additionalMessages75Revenue = additionalMessagesMonth75 * params.additionalMessagePrice;
      const additionalMessages150Revenue = additionalMessagesMonth150 * params.additionalMessagePrice;
      const additionalMessages250Revenue = additionalMessagesMonth250 * params.additionalMessagePrice;
      const additionalMessages500Revenue = additionalMessagesMonth500 * params.additionalMessagePrice;
      const additionalMessages1000Revenue = additionalMessagesMonth1000 * params.additionalMessagePrice;
      
      // Используем правильные названия полей из типов
      const additionalBotsRate = upsellSettings.additionalBotsPercentage || 0;
      const newFeaturesRate = upsellSettings.newFeaturesPercentage || 0;  
      const messageExpansionRate = upsellSettings.messagePacksPercentage || 0;
      const additionalIntegrationsRate = upsellSettings.integrationsPercentage || 0;
      
      const additionalBotsClientsMonth = Math.round(totalActiveClientsMonth * (additionalBotsRate / 100));
      const additionalBotsRevenueMonth = additionalBotsClientsMonth * (upsellSettings.additionalBotsPrice || 0);
      const newFeaturesClientsMonth = Math.round(totalActiveClientsMonth * (newFeaturesRate / 100));
      const newFeaturesRevenueMonth = newFeaturesClientsMonth * (upsellSettings.newFeaturesPrice || 0);
      const messageExpansionClientsMonth = Math.round(totalActiveClientsMonth * (messageExpansionRate / 100));
      const messageExpansionRevenueMonth = messageExpansionClientsMonth * (upsellSettings.messagePacksPrice || 0);
      const additionalIntegrationsClientsMonth = Math.round(totalActiveClientsMonth * (additionalIntegrationsRate / 100));
      const additionalIntegrationsRevenueMonth = additionalIntegrationsClientsMonth * (upsellSettings.integrationsPrice || 0);
      const upsellRevenueMonth = additionalBotsRevenueMonth + newFeaturesRevenueMonth + messageExpansionRevenueMonth + additionalIntegrationsRevenueMonth;
      
      totalAdditionalBotsRevenueAgg += additionalBotsRevenueMonth;
      totalNewFeaturesRevenueAgg += newFeaturesRevenueMonth;
      totalMessageExpansionRevenueAgg += messageExpansionRevenueMonth;
      totalAdditionalIntegrationsRevenueAgg += additionalIntegrationsRevenueMonth;

      const totalRevenueMonth = integrationRevenueMonth + subscriptionRevenueMonth + additionalMessagesRevenueMonth + upsellRevenueMonth;
      
      const apiCostsMonth = (subscriptionRevenueMonth + additionalMessagesRevenueMonth) * (params.apiCostPercentage / 100);
      
      // Дополнительная диагностика влияния на прибыль
      if (month === 0 && params.messageUsageRate > 100) {
        console.log('💸 Анализ при высоком использовании:', {
          'Выручка от подписок': subscriptionRevenueMonth,
          'Выручка от доп. сообщений': additionalMessagesRevenueMonth,
          'API costs от подписок': subscriptionRevenueMonth * (params.apiCostPercentage / 100),
          'API costs от доп. сообщений': additionalMessagesRevenueMonth * (params.apiCostPercentage / 100),
          'Общие API costs': apiCostsMonth
        });
      }

      // CAC с учетом распределения каналов  
      // Поддержка как числового значения, так и объекта
      const directChannelRatio = typeof params.channelDistribution === 'number' 
        ? params.channelDistribution / 100 
        : (params.channelDistribution?.direct || 60) / 100;
      const partnerChannelRatio = typeof params.channelDistribution === 'number'
        ? (100 - params.channelDistribution) / 100
        : (params.channelDistribution?.partner || 40) / 100;
      
      // Партнёрский канал
      const partnerClientsMonth = Math.round(totalNewClientsMonth * partnerChannelRatio);
      // Комиссия партнерам от выручки клиентов, которых они привели
      const partnerClientsRevenue = (
        Math.round(newClientsForMonth75 * partnerChannelRatio) * clients.subscriptionPrice75 +
        Math.round(newClientsForMonth150 * partnerChannelRatio) * clients.subscriptionPrice150 +
        Math.round(newClientsForMonth250 * partnerChannelRatio) * clients.subscriptionPrice250 +
        Math.round(newClientsForMonth500 * partnerChannelRatio) * clients.subscriptionPrice500 +
        Math.round(newClientsForMonth1000 * partnerChannelRatio) * clients.subscriptionPrice1000
      );
      const partnerCommissionsMonth = (integrationRevenueMonth * partnerChannelRatio + partnerClientsRevenue) * (params.partnerCommissionRate / 100);
      const partnerLeadCostsMonth = partnerClientsMonth * params.partnerLeadCost;
      
      // Прямой канал
      const directClientsMonth = Math.round(totalNewClientsMonth * directChannelRatio);
      const salesTeamCostsMonth = totalRevenueMonth * (params.directSalesPercentage / 100) * directChannelRatio;
      const marketingCostsMonth = totalRevenueMonth * (params.directMarketingPercentage / 100) * directChannelRatio;
      const directLeadCostsMonth = directClientsMonth * params.directLeadCost;
      
      const leadGenerationCostsMonth = directLeadCostsMonth + partnerLeadCostsMonth;
      const calculatedImplCostsMonth = params.integrationPrice * (params.implementationPercentage / 100);
      const implementationCostsPerClientMonth = Math.min(calculatedImplCostsMonth, params.maxImplementationCost);
      const implementationCostsMonth = totalNewClientsMonth * implementationCostsPerClientMonth;
      
      // Диагностика расходов на внедрение
      if (month === 0 && totalNewClientsMonth > 0) {
        console.log('💰 Диагностика расходов на внедрение (месяц 1):', {
          'Стоимость интеграции': params.integrationPrice,
          'Процент на внедрение': params.implementationPercentage + '%',
          'Расчётная стоимость': calculatedImplCostsMonth,
          'Макс. стоимость внедрения': params.maxImplementationCost,
          'Итоговая стоимость на клиента': implementationCostsPerClientMonth,
          'Новых клиентов': totalNewClientsMonth,
          'Общие расходы на внедрение': implementationCostsMonth
        });
      }
      // ИСПРАВЛЕНО: Константы вместо хардкода ФОТ
      const FOT_DEVELOPMENT_RATIO = params.fotDevelopmentRatio || 0.6;
      const FOT_SALES_RATIO = params.fotSalesRatio || 0.4;
      const fotDevelopmentRatio = FOT_DEVELOPMENT_RATIO;
      const fotSalesRatio = FOT_SALES_RATIO;
      
      const totalFotMonth = params.fotMode === 'optimistic' 
        ? params.fotOptimistic[month] 
        : params.fotPessimistic[month];
      
      const fotDevelopmentMonth = totalFotMonth * fotDevelopmentRatio;
      const fotSalesMonth = totalFotMonth * fotSalesRatio;
      const fotCostsMonth = totalFotMonth;
      // ИСПРАВЛЕНО: CAC теперь включает implementation costs
      const cacCostsMonth = partnerCommissionsMonth + salesTeamCostsMonth + marketingCostsMonth + leadGenerationCostsMonth + implementationCostsMonth;
      const totalExpensesMonth = apiCostsMonth + cacCostsMonth + fotCostsMonth;
      
      const grossProfitMonth = totalRevenueMonth - totalExpensesMonth;
      const taxRateMonth = params.taxMode === 'optimistic' 
        ? DEFAULT_TAX_RATES.optimistic 
        : params.taxMode === 'pessimistic'
        ? DEFAULT_TAX_RATES.pessimistic
        : params.customTaxRate;
      // ИСПРАВЛЕНО: Налог от прибыли, а не от выручки!
      const taxBase = Math.max(0, grossProfitMonth); // Налог только с положительной прибыли
      const taxMonth = taxBase > 0 ? taxBase * (taxRateMonth / 100) : 0;
      const netProfitMonth = grossProfitMonth - taxMonth;
      
      cumulativeRevenue += totalRevenueMonth;
      cumulativeExpenses += totalExpensesMonth;
      cumulativeProfit += netProfitMonth;

      if (breakevenMonthCalc === undefined && cumulativeProfit > 0) {
        breakevenMonthCalc = month + 1;
      }

      let nrrMonth = 0;
      if (month > 0 && previousMonthMRR > 0) {
        // ИСПРАВЛЕНО: Правильная формула NRR
        const currentMRR = subscriptionRevenueMonth;
        const expansionRevenue = upsellRevenueMonth + additionalMessagesRevenueMonth;
        // Правильная формула: (Текущий MRR + Expansion) / Начальный MRR
        nrrMonth = ((currentMRR + expansionRevenue) / previousMonthMRR) * 100;
      }
      previousMonthMRR = subscriptionRevenueMonth;
      
      const monthData = {
        month: month + 1,
        newClients75: newClientsForMonth75, newClients150: newClientsForMonth150, newClients250: newClientsForMonth250, newClients500: newClientsForMonth500, newClients1000: newClientsForMonth1000,
        // ИСПРАВЛЕНО: Правильное распределение по каналам с точным округлением
        newClients75Direct: Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth75 * directChannelRatio) : 0,
        newClients75Partner: newClientsForMonth75 - (Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth75 * directChannelRatio) : 0),
        newClients150Direct: Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth150 * directChannelRatio) : 0,
        newClients150Partner: newClientsForMonth150 - (Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth150 * directChannelRatio) : 0),
        newClients250Direct: Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth250 * directChannelRatio) : 0,
        newClients250Partner: newClientsForMonth250 - (Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth250 * directChannelRatio) : 0),
        newClients500Direct: Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth500 * directChannelRatio) : 0,
        newClients500Partner: newClientsForMonth500 - (Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth500 * directChannelRatio) : 0),
        newClients1000Direct: Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth1000 * directChannelRatio) : 0,
        newClients1000Partner: newClientsForMonth1000 - (Number.isFinite(directChannelRatio) ? Math.round(newClientsForMonth1000 * directChannelRatio) : 0),
        activeClients75, activeClients150, activeClients250, activeClients500, activeClients1000,
        totalActiveClients: totalActiveClientsMonth, totalNewClients: totalNewClientsMonth,
        churnClients75: churnNum75, churnClients150: churnNum150, churnClients250: churnNum250, churnClients500: churnNum500, churnClients1000: churnNum1000,
        churnedClients: monthlyChurnedClients, // Added
        integrationRevenue: integrationRevenueMonth,
        subscriptionRevenue: subscriptionRevenueMonth,
        subscriptionRevenue75: subscriptionRevenueMonth75, subscriptionRevenue150: subscriptionRevenueMonth150, subscriptionRevenue250: subscriptionRevenueMonth250, subscriptionRevenue500: subscriptionRevenueMonth500, subscriptionRevenue1000: subscriptionRevenueMonth1000,
        additionalMessagesRevenue: additionalMessagesRevenueMonth,
        // Детальная выручка от дополнительных сообщений по тарифам
        additionalMessages75Revenue, additionalMessages150Revenue, additionalMessages250Revenue, additionalMessages500Revenue, additionalMessages1000Revenue,
        upsellRevenue: upsellRevenueMonth,
        totalRevenue: totalRevenueMonth,
        nrr: nrrMonth,
        additionalBotsClients: additionalBotsClientsMonth, additionalBotsRevenue: additionalBotsRevenueMonth,
        newFeaturesClients: newFeaturesClientsMonth, newFeaturesRevenue: newFeaturesRevenueMonth,
        messageExpansionClients: messageExpansionClientsMonth, messageExpansionRevenue: messageExpansionRevenueMonth,
        additionalIntegrationsClients: additionalIntegrationsClientsMonth, additionalIntegrationsRevenue: additionalIntegrationsRevenueMonth,
        // Детальные Upsell компоненты
        upsellAdditionalBots: additionalBotsRevenueMonth,
        upsellNewFeatures: newFeaturesRevenueMonth,
        upsellMessagePacks: messageExpansionRevenueMonth, // Правильное название поля
        upsellIntegrations: additionalIntegrationsRevenueMonth, // Правильное название поля
        totalUpsellRevenue: upsellRevenueMonth, // Общий доход от Upsell
        apiCosts: apiCostsMonth, cacCosts: cacCostsMonth,
        partnerCommissions: partnerCommissionsMonth, salesTeamCosts: salesTeamCostsMonth, marketingCosts: marketingCostsMonth, leadGenerationCosts: leadGenerationCostsMonth,
        // Декомпозированные расходы по каналам
        directSalesCosts: salesTeamCostsMonth,
        directMarketingCosts: marketingCostsMonth,
        directLeadGenerationCosts: directLeadCostsMonth,
        partnerCommissionCosts: partnerCommissionsMonth,
        partnerLeadGenerationCosts: partnerLeadCostsMonth,
        implementationCosts: implementationCostsMonth, fotCosts: fotCostsMonth,
        // Декомпозированный ФОТ
        fotDevelopmentCosts: fotDevelopmentMonth,
        fotSalesCosts: fotSalesMonth,
        fotDevelopment: fotDevelopmentMonth, // Alias для совместимости
        fotSales: fotSalesMonth, // Alias для совместимости
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
    const finalTotalExpenses = totalApiCostsCalc + totalCacCostsCalc + totalFotCostsCalc;
    
    const avgMonthlyRevenueCalc = finalTotalRevenue / 12;
    const avgMonthlyProfitCalc = totalNetProfitCalc / 12;
    
    const validArpuValues = data.filter(month => Number.isFinite(month.arpu) && month.arpu > 0);
    const avgArpuCalc = validArpuValues.length > 0 ? 
      validArpuValues.reduce((sum, month) => sum + month.arpu, 0) / validArpuValues.length : 0;
    // ИСПРАВЛЕНО: LTV без хардкода
    const LTV_DEFAULT_MONTHS = 36; // Константа вместо хардкода
    const LTV_MAX_MONTHS = 72; // Максимальное ограничение
    const monthlyChurnRate = params.churnRate / 100;
    const avgCustomerLifespan = monthlyChurnRate > 0 ? 1 / monthlyChurnRate : LTV_DEFAULT_MONTHS;
    const ltvCalc = avgArpuCalc * Math.min(avgCustomerLifespan, LTV_MAX_MONTHS);
    
    const totalNewClientsAgg = data.reduce((sum, month) => sum + (month.totalNewClients || 0), 0);
    const cacPerClientCalc = totalNewClientsAgg > 0 ? totalCacCostsCalc / totalNewClientsAgg : 0;
    const ltvCacRatioCalc = cacPerClientCalc > 0 && Number.isFinite(ltvCalc) ? ltvCalc / cacPerClientCalc : 0;
    const cacPaybackPeriodCalc = avgArpuCalc > 0 && Number.isFinite(cacPerClientCalc) ? cacPerClientCalc / avgArpuCalc : 0;
    const profitMarginCalc = finalTotalRevenue > 0 && Number.isFinite(totalNetProfitCalc) ? (totalNetProfitCalc / finalTotalRevenue) * 100 : 0;
    const roiCalc = finalTotalExpenses > 0 && Number.isFinite(totalNetProfitCalc) ? (totalNetProfitCalc / finalTotalExpenses) * 100 : 0;
    const implementationMarginCalc = totalIntegrationRevenue > 0 && Number.isFinite(totalImplementationCostsCalc) ? ((totalIntegrationRevenue - totalImplementationCostsCalc) / totalIntegrationRevenue) * 100 : 0;
    
    // NRR for the last month as an example for totalData.nrr, or average.
    // For simplicity, using last month's NRR if available.
    const lastMonthNrr = data.length > 0 ? data[data.length - 1].nrr : 0;

    // Подсчёт активных клиентов на конец периода
    const finalActiveClients = data.length > 0 ? data[data.length - 1].totalActiveClients : 0;
    
    // Подсчёт по тарифам
    const totalNewClients75 = clients.newClients75.reduce((sum, val) => sum + val, 0);
    const totalNewClients150 = clients.newClients150.reduce((sum, val) => sum + val, 0);
    const totalNewClients250 = clients.newClients250.reduce((sum, val) => sum + val, 0);
    const totalNewClients500 = clients.newClients500.reduce((sum, val) => sum + val, 0);
    const totalNewClients1000 = clients.newClients1000.reduce((sum, val) => sum + val, 0);

    // Подсчёт дополнительных сообщений
    const totalAdditionalMessages = data.reduce((sum, month) => sum + (month.totalAdditionalMessages || 0), 0);
    
    // Подсчёт среднего NRR
    const nrrMonths = data.filter(m => m.nrr > 0);
    const avgNrr = nrrMonths.length > 0 ? nrrMonths.reduce((sum, month) => sum + month.nrr, 0) / nrrMonths.length : 0;

    const totalDataCalc: TotalData = {
      // Основные метрики
      totalActiveClients: finalActiveClients,
      totalNewClients: totalNewClientsAgg,
      totalNewClients75,
      totalNewClients150,
      totalNewClients250,
      totalNewClients500,
      totalNewClients1000,
      totalRevenue: finalTotalRevenue,
      totalExpenses: finalTotalExpenses,
      totalNetProfit: totalNetProfitCalc,
      totalGrossProfit: totalGrossProfitCalc,
      avgMonthlyRevenue: avgMonthlyRevenueCalc,
      avgMonthlyProfit: avgMonthlyProfitCalc,
      profitMargin: profitMarginCalc,
      totalIntegration: totalIntegrationRevenue,
      totalSubscription: totalSubscriptionRevenue,
      totalAdditionalMessages,
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
      avgNrr,
      // Newly added fields to TotalData
      finalActiveClients: finalActiveClients,
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
