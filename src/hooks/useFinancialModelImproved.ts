import { useState, useCallback } from 'react';
import { MonthlyData, TotalData, FinancialModelParams, ClientsData, UpsellSettings } from '../types/FinancialTypes';
import { DEFAULT_TAX_RATES } from '../constants/DefaultValues';

// Константы вместо хардкода
const CONFIG = {
  FOT_DEVELOPMENT_RATIO: 0.6,
  FOT_SALES_RATIO: 0.4,
  LTV_DEFAULT_MONTHS: 36,
  LTV_MAX_MONTHS: 72,
  MAX_MESSAGE_CARRYOVER_MONTHS: 3,
  TAX_BASE: 'profit' as 'revenue' | 'profit', // По умолчанию от прибыли
};

export const useFinancialModelImproved = (
  params: FinancialModelParams,
  clients: ClientsData,
  upsellSettings: UpsellSettings
) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalData, setTotalData] = useState<TotalData>({} as TotalData);

  // Валидация входных параметров
  const validateParams = () => {
    if (params.churnRate < 0 || params.churnRate > 100) {
      console.warn('Churn rate должен быть от 0 до 100');
    }
    if (params.apiCostPercentage < 0 || params.apiCostPercentage > 100) {
      console.warn('API cost percentage должен быть от 0 до 100');
    }
    if (params.messageUsageRate < 0) {
      console.warn('Message usage rate не может быть отрицательным');
    }
  };

  // Функция корректного распределения клиентов по каналам
  const distributeClients = (total: number, directRatio: number): { direct: number; partner: number } => {
    const direct = Math.floor(total * directRatio);
    const partner = total - direct; // Гарантирует сумму = total
    return { direct, partner };
  };

  // Функция расчета сообщений с улучшенной логикой
  const calculateMessagesWithImprovedCarryover = (
    activeClients: number,
    messagesPerClient: number,
    previousUnused: number,
    carryoverHistory: number[],
    churnedClients: number,
    params: FinancialModelParams
  ) => {
    // Доступные сообщения
    const baseMessages = activeClients * messagesPerClient;
    const availableMessages = baseMessages + previousUnused;
    
    // Используемые сообщения
    const usageRate = params.messageUsageRate / 100;
    const usedMessages = Math.round(availableMessages * usageRate);
    
    // Неиспользованные в текущем месяце
    let currentUnused = Math.max(0, availableMessages - usedMessages);
    
    // Учитываем потерю сообщений от ушедших клиентов
    const lostMessagesFromChurn = churnedClients * messagesPerClient * (1 - usageRate);
    currentUnused = Math.max(0, currentUnused - lostMessagesFromChurn);
    
    // Применяем процент переноса с ограничением
    let carryover = currentUnused * (params.carryOverPercentage / 100);
    
    // Ограничиваем накопление
    carryoverHistory.push(carryover);
    if (carryoverHistory.length > CONFIG.MAX_MESSAGE_CARRYOVER_MONTHS) {
      carryoverHistory.shift();
    }
    
    // Максимальное накопление = пакет * количество месяцев накопления
    const maxCarryover = activeClients * messagesPerClient * CONFIG.MAX_MESSAGE_CARRYOVER_MONTHS;
    const totalCarryover = carryoverHistory.reduce((sum, val) => sum + val, 0);
    carryover = Math.min(carryover, maxCarryover - previousUnused);
    
    // Дополнительные сообщения
    const additionalMessages = Math.max(0, usedMessages - availableMessages);
    const additionalRevenue = additionalMessages * params.additionalMessagePrice;
    
    return {
      availableMessages,
      usedMessages,
      unusedMessages: currentUnused,
      carryover: Math.max(0, carryover),
      additionalMessages,
      additionalRevenue
    };
  };

  const calculateFinancialModel = useCallback(function recalcModel() {
    validateParams();
    
    const monthlyDataArray: MonthlyData[] = [];
    
    // Состояние по тарифам
    let activeClients = {
      75: 0, 150: 0, 250: 0, 500: 0, 1000: 0
    };
    
    // Накопители
    let cumulativeRevenue = 0;
    let cumulativeExpenses = 0; 
    let cumulativeProfit = 0;
    
    // Сообщения и история переноса
    let unusedMessages = {
      75: 0, 150: 0, 250: 0, 500: 0, 1000: 0
    };
    
    const carryoverHistory = {
      75: [], 150: [], 250: [], 500: [], 1000: []
    };
    
    let previousMonthMRR = 0;
    let breakevenMonthCalc: number | undefined;
    
    const directChannelRatio = params.channelDistribution / 100;
    const partnerChannelRatio = 1 - directChannelRatio;
    
    // Настраиваемые коэффициенты ФОТ
    const fotDevelopmentRatio = params.fotDevelopmentOptimistic ? 
      params.fotDevelopmentOptimistic[0] / (params.fotDevelopmentOptimistic[0] + (params.fotSalesOptimistic?.[0] || 0)) :
      CONFIG.FOT_DEVELOPMENT_RATIO;
    const fotSalesRatio = 1 - fotDevelopmentRatio;

    for (let month = 0; month < 12; month++) {
      // Новые клиенты по тарифам
      const newClients = {
        75: clients.newClients75[month] || 0,
        150: clients.newClients150[month] || 0,
        250: clients.newClients250[month] || 0,
        500: clients.newClients500[month] || 0,
        1000: clients.newClients1000[month] || 0
      };
      
      const totalNewClients = Object.values(newClients).reduce((sum, val) => sum + val, 0);
      
      // Корректное распределение по каналам
      const distribution = {
        75: distributeClients(newClients[75], directChannelRatio),
        150: distributeClients(newClients[150], directChannelRatio),
        250: distributeClients(newClients[250], directChannelRatio),
        500: distributeClients(newClients[500], directChannelRatio),
        1000: distributeClients(newClients[1000], directChannelRatio)
      };
      
      // Отток клиентов (используем floor для консервативности)
      const churn = {
        75: month > 0 ? Math.floor(activeClients[75] * (params.churnRate / 100)) : 0,
        150: month > 0 ? Math.floor(activeClients[150] * (params.churnRate / 100)) : 0,
        250: month > 0 ? Math.floor(activeClients[250] * (params.churnRate / 100)) : 0,
        500: month > 0 ? Math.floor(activeClients[500] * (params.churnRate / 100)) : 0,
        1000: month > 0 ? Math.floor(activeClients[1000] * (params.churnRate / 100)) : 0
      };
      
      const totalChurn = Object.values(churn).reduce((sum, val) => sum + val, 0);
      
      // Обновляем активных клиентов
      activeClients[75] += newClients[75] - churn[75];
      activeClients[150] += newClients[150] - churn[150];
      activeClients[250] += newClients[250] - churn[250];
      activeClients[500] += newClients[500] - churn[500];
      activeClients[1000] += newClients[1000] - churn[1000];
      
      const totalActiveClients = Object.values(activeClients).reduce((sum, val) => sum + val, 0);
      
      // Доходы от интеграции
      const integrationRevenue = totalNewClients * clients.integrationPrice;
      
      // Доходы от подписок
      const subscriptionRevenue = {
        75: activeClients[75] * clients.subscriptionPrice75,
        150: activeClients[150] * clients.subscriptionPrice150,
        250: activeClients[250] * clients.subscriptionPrice250,
        500: activeClients[500] * clients.subscriptionPrice500,
        1000: activeClients[1000] * clients.subscriptionPrice1000
      };
      
      const totalSubscriptionRevenue = Object.values(subscriptionRevenue).reduce((sum, val) => sum + val, 0);
      
      // Расчет сообщений с улучшенной логикой
      const messages = {
        75: calculateMessagesWithImprovedCarryover(
          activeClients[75], clients.messages75, unusedMessages[75],
          carryoverHistory[75], churn[75], params
        ),
        150: calculateMessagesWithImprovedCarryover(
          activeClients[150], clients.messages150, unusedMessages[150],
          carryoverHistory[150], churn[150], params
        ),
        250: calculateMessagesWithImprovedCarryover(
          activeClients[250], clients.messages250, unusedMessages[250],
          carryoverHistory[250], churn[250], params
        ),
        500: calculateMessagesWithImprovedCarryover(
          activeClients[500], clients.messages500, unusedMessages[500],
          carryoverHistory[500], churn[500], params
        ),
        1000: calculateMessagesWithImprovedCarryover(
          activeClients[1000], clients.messages1000, unusedMessages[1000],
          carryoverHistory[1000], churn[1000], params
        )
      };
      
      // Обновляем неиспользованные сообщения
      unusedMessages[75] = messages[75].carryover;
      unusedMessages[150] = messages[150].carryover;
      unusedMessages[250] = messages[250].carryover;
      unusedMessages[500] = messages[500].carryover;
      unusedMessages[1000] = messages[1000].carryover;
      
      const totalAdditionalMessagesRevenue = Object.values(messages).reduce(
        (sum, m) => sum + m.additionalRevenue, 0
      );
      
      // Upsell расчеты по категориям
      const upsell = {
        bots: totalActiveClients * (upsellSettings.additionalBotsPercentage / 100) * upsellSettings.additionalBotsPrice,
        features: totalActiveClients * (upsellSettings.newFeaturesPercentage / 100) * upsellSettings.newFeaturesPrice,
        messagePacks: totalActiveClients * (upsellSettings.messagePacksPercentage / 100) * upsellSettings.messagePacksPrice,
        integrations: totalActiveClients * (upsellSettings.integrationsPercentage / 100) * upsellSettings.integrationsPrice
      };
      
      const totalUpsellRevenue = Object.values(upsell).reduce((sum, val) => sum + val, 0);
      
      const totalRevenue = integrationRevenue + totalSubscriptionRevenue + 
                          totalAdditionalMessagesRevenue + totalUpsellRevenue;
      
      // Расходы
      const apiCosts = (totalSubscriptionRevenue + totalAdditionalMessagesRevenue) * (params.apiCostPercentage / 100);
      
      // Стоимость внедрения на одного клиента
      const perClient = Math.min(
        (clients.integrationPrice * params.implementationPercentage) / 100,
        params.maxImplementationCost
      );
      // Общие расходы на внедрение
      const implementationCosts = totalNewClients * perClient;
      
      // CAC по каналам
      const directNewClients = Object.values(distribution).reduce((sum, d) => sum + d.direct, 0);
      const partnerNewClients = Object.values(distribution).reduce((sum, d) => sum + d.partner, 0);
      
      // Выручка от клиентов по каналам (для расчета комиссий)
      const partnerClientsRevenue = 
        distribution[75].partner * clients.subscriptionPrice75 +
        distribution[150].partner * clients.subscriptionPrice150 +
        distribution[250].partner * clients.subscriptionPrice250 +
        distribution[500].partner * clients.subscriptionPrice500 +
        distribution[1000].partner * clients.subscriptionPrice1000;
      
      const directClientsRevenue = totalSubscriptionRevenue - partnerClientsRevenue;
      
      // Компоненты CAC
      const partnerCommissions = partnerClientsRevenue * (params.partnerCommissionRate / 100);
      const salesTeamCosts = directClientsRevenue * (params.directSalesPercentage / 100);
      const marketingCosts = directClientsRevenue * (params.directMarketingPercentage / 100);
      const leadGenerationCosts = directNewClients * params.directLeadCost + 
                                  partnerNewClients * params.partnerLeadCost;
      
      // CAC теперь включает implementation costs
      const cacCosts = partnerCommissions + salesTeamCosts + marketingCosts + 
                      leadGenerationCosts + implementationCosts;
      
      // ФОТ
      const fotTotal = params.fotMode === 'optimistic' ? 
        params.fotOptimistic[month] : params.fotPessimistic[month];
      const fotDevelopment = fotTotal * fotDevelopmentRatio;
      const fotSales = fotTotal * fotSalesRatio;
      
      const totalExpenses = apiCosts + cacCosts + fotTotal;
      const grossProfit = totalRevenue - totalExpenses;
      
      // Налоги - теперь можно настроить базу
      const taxRate = params.taxMode === 'optimistic' ? DEFAULT_TAX_RATES.optimistic :
                     params.taxMode === 'pessimistic' ? DEFAULT_TAX_RATES.pessimistic :
                     params.customTaxRate;
      
      // ИСПРАВЛЕНО: Налог от прибыли по умолчанию
      const taxBase = CONFIG.TAX_BASE === 'profit' ? Math.max(0, grossProfit) : totalRevenue;
      const tax = taxBase > 0 ? taxBase * (taxRate / 100) : 0;
      const netProfit = grossProfit - tax;
      
      cumulativeRevenue += totalRevenue;
      cumulativeExpenses += totalExpenses;
      cumulativeProfit += netProfit;
      
      if (breakevenMonthCalc === undefined && cumulativeProfit > 0) {
        breakevenMonthCalc = month + 1;
      }
      
      // ИСПРАВЛЕНО: Правильный расчет NRR
      let nrr = 0;
      if (month > 0 && previousMonthMRR > 0) {
        const currentMRR = totalSubscriptionRevenue;
        const expansionRevenue = totalUpsellRevenue + totalAdditionalMessagesRevenue;
        // Правильная формула: (Текущий MRR + Expansion) / Начальный MRR
        nrr = ((currentMRR + expansionRevenue) / previousMonthMRR) * 100;
      }
      previousMonthMRR = totalSubscriptionRevenue;
      
      // Формирование данных месяца
      const monthData: MonthlyData = {
        month: month + 1,
        // Новые клиенты
        newClients75: newClients[75],
        newClients150: newClients[150],
        newClients250: newClients[250],
        newClients500: newClients[500],
        newClients1000: newClients[1000],
        newClients75Direct: distribution[75].direct,
        newClients75Partner: distribution[75].partner,
        newClients150Direct: distribution[150].direct,
        newClients150Partner: distribution[150].partner,
        newClients250Direct: distribution[250].direct,
        newClients250Partner: distribution[250].partner,
        newClients500Direct: distribution[500].direct,
        newClients500Partner: distribution[500].partner,
        newClients1000Direct: distribution[1000].direct,
        newClients1000Partner: distribution[1000].partner,
        // Активные клиенты
        activeClients75: activeClients[75],
        activeClients150: activeClients[150],
        activeClients250: activeClients[250],
        activeClients500: activeClients[500],
        activeClients1000: activeClients[1000],
        totalActiveClients,
        totalNewClients,
        // Отток
        churnClients75: churn[75],
        churnClients150: churn[150],
        churnClients250: churn[250],
        churnClients500: churn[500],
        churnClients1000: churn[1000],
        churnedClients: totalChurn,
        // Доходы
        integrationRevenue,
        subscriptionRevenue: totalSubscriptionRevenue,
        subscriptionRevenue75: subscriptionRevenue[75],
        subscriptionRevenue150: subscriptionRevenue[150],
        subscriptionRevenue250: subscriptionRevenue[250],
        subscriptionRevenue500: subscriptionRevenue[500],
        subscriptionRevenue1000: subscriptionRevenue[1000],
        additionalMessagesRevenue: totalAdditionalMessagesRevenue,
        additionalMessages75Revenue: messages[75].additionalRevenue,
        additionalMessages150Revenue: messages[150].additionalRevenue,
        additionalMessages250Revenue: messages[250].additionalRevenue,
        additionalMessages500Revenue: messages[500].additionalRevenue,
        additionalMessages1000Revenue: messages[1000].additionalRevenue,
        upsellRevenue: totalUpsellRevenue,
        upsellAdditionalBots: upsell.bots,
        upsellNewFeatures: upsell.features,
        upsellMessagePacks: upsell.messagePacks,
        upsellIntegrations: upsell.integrations,
        totalRevenue,
        // Расходы
        apiCosts,
        cacCosts,
        partnerCommissions,
        salesTeamCosts,
        marketingCosts,
        leadGenerationCosts,
        implementationCosts,
        fotCosts: fotTotal,
        fotDevelopment,
        fotSales,
        totalExpenses,
        // Прибыль
        grossProfit,
        tax,
        netProfit,
        // Накопительные
        cumulativeRevenue,
        cumulativeExpenses,
        cumulativeProfit,
        // Метрики
        nrr,
        arpu: totalActiveClients > 0 ? totalRevenue / totalActiveClients : 0,
        // Детализация по расходам (для совместимости)
        directSalesCosts: salesTeamCosts,
        directMarketingCosts: marketingCosts,
        directLeadGenerationCosts: directNewClients * params.directLeadCost,
        partnerCommissionCosts: partnerCommissions,
        partnerLeadGenerationCosts: partnerNewClients * params.partnerLeadCost,
        fotDevelopmentCosts: fotDevelopment,
        fotSalesCosts: fotSales,
        // Данные по сообщениям
        usedMessages75: messages[75].usedMessages,
        usedMessages150: messages[150].usedMessages,
        usedMessages250: messages[250].usedMessages,
        usedMessages500: messages[500].usedMessages,
        usedMessages1000: messages[1000].usedMessages,
        availableMessages75: messages[75].availableMessages,
        availableMessages150: messages[150].availableMessages,
        availableMessages250: messages[250].availableMessages,
        availableMessages500: messages[500].availableMessages,
        availableMessages1000: messages[1000].availableMessages,
        additionalMessages75: messages[75].additionalMessages,
        additionalMessages150: messages[150].additionalMessages,
        additionalMessages250: messages[250].additionalMessages,
        additionalMessages500: messages[500].additionalMessages,
        additionalMessages1000: messages[1000].additionalMessages,
        unusedMessages75: messages[75].unusedMessages,
        unusedMessages150: messages[150].unusedMessages,
        unusedMessages250: messages[250].unusedMessages,
        unusedMessages500: messages[500].unusedMessages,
        unusedMessages1000: messages[1000].unusedMessages,
        // Дополнительные метрики (заглушки для совместимости)
        totalAdditionalMessages: 0,
        additionalBotsClients: 0,
        additionalBotsRevenue: upsell.bots,
        newFeaturesClients: 0,
        newFeaturesRevenue: upsell.features,
        messageExpansionClients: 0,
        messageExpansionRevenue: upsell.messagePacks,
        additionalIntegrationsClients: 0,
        additionalIntegrationsRevenue: upsell.integrations
      };
      
      monthlyDataArray.push(monthData);
    }
    
    // Расчет итоговых метрик
    const finalTotalRevenue = monthlyDataArray.reduce((sum, m) => sum + m.totalRevenue, 0);
    const finalTotalExpenses = monthlyDataArray.reduce((sum, m) => sum + m.totalExpenses, 0);
    const finalTotalGrossProfit = monthlyDataArray.reduce((sum, m) => sum + m.grossProfit, 0);
    const finalTotalTax = monthlyDataArray.reduce((sum, m) => sum + m.tax, 0);
    const totalNetProfitCalc = monthlyDataArray.reduce((sum, m) => sum + m.netProfit, 0);
    
    const totalActiveClientsEnd = monthlyDataArray[11]?.totalActiveClients || 0;
    const avgArpuCalc = totalActiveClientsEnd > 0 ? finalTotalRevenue / totalActiveClientsEnd / 12 : 0;
    
    // ИСПРАВЛЕНО: Более точный расчет LTV с ограничением
    const monthlyChurnRate = params.churnRate / 100;
    const avgCustomerLifespan = monthlyChurnRate > 0 ? 1 / monthlyChurnRate : CONFIG.LTV_DEFAULT_MONTHS;
    const ltvCalc = avgArpuCalc * Math.min(avgCustomerLifespan, CONFIG.LTV_MAX_MONTHS);
    
    const totalNewClientsCalc = monthlyDataArray.reduce((sum, m) => sum + m.totalNewClients, 0);
    const cacPerClientCalc = totalNewClientsCalc > 0 ? 
      monthlyDataArray.reduce((sum, m) => sum + m.cacCosts, 0) / totalNewClientsCalc : 0;
    
    const cacPaybackPeriodCalc = avgArpuCalc > 0 ? cacPerClientCalc / avgArpuCalc : 0;
    const roiCalc = finalTotalExpenses > 0 ? (totalNetProfitCalc / finalTotalExpenses) * 100 : 0;
    
    // Средний NRR (исключая первый месяц)
    const avgNrr = monthlyDataArray.slice(1).reduce((sum, m) => sum + m.nrr, 0) / 11 || 0;
    
    const totalDataCalc: TotalData = {
      // Основные метрики
      totalActiveClients: totalActiveClientsEnd,
      totalNewClients: totalNewClientsCalc,
      // Детализация по тарифам
      totalNewClients75: clients.newClients75.reduce((sum, val) => sum + val, 0),
      totalNewClients150: clients.newClients150.reduce((sum, val) => sum + val, 0),
      totalNewClients250: clients.newClients250.reduce((sum, val) => sum + val, 0),
      totalNewClients500: clients.newClients500.reduce((sum, val) => sum + val, 0),
      totalNewClients1000: clients.newClients1000.reduce((sum, val) => sum + val, 0),
      // Финансовые итоги
      totalRevenue: finalTotalRevenue,
      totalSubscription: monthlyDataArray.reduce((sum, m) => sum + m.subscriptionRevenue, 0),
      totalIntegration: monthlyDataArray.reduce((sum, m) => sum + m.integrationRevenue, 0),
      totalAdditionalMessages: monthlyDataArray.reduce((sum, m) => sum + m.additionalMessagesRevenue, 0),
      totalAdditionalMessagesRevenue: monthlyDataArray.reduce((sum, m) => sum + m.additionalMessagesRevenue, 0),
      totalUpsellRevenue: monthlyDataArray.reduce((sum, m) => sum + m.upsellRevenue, 0),
      totalExpenses: finalTotalExpenses,
      totalApiCosts: monthlyDataArray.reduce((sum, m) => sum + m.apiCosts, 0),
      totalCacCosts: monthlyDataArray.reduce((sum, m) => sum + m.cacCosts, 0),
      totalFotCosts: monthlyDataArray.reduce((sum, m) => sum + m.fotCosts, 0),
      totalImplementationCosts: monthlyDataArray.reduce((sum, m) => sum + m.implementationCosts, 0),
      totalGrossProfit: finalTotalGrossProfit,
      totalTax: finalTotalTax,
      totalNetProfit: totalNetProfitCalc,
      // Средние показатели
      avgMonthlyRevenue: finalTotalRevenue / 12,
      avgMonthlyProfit: totalNetProfitCalc / 12,
      profitMargin: finalTotalRevenue > 0 ? (totalNetProfitCalc / finalTotalRevenue) * 100 : 0,
      // Метрики клиентов
      avgArpu: avgArpuCalc,
      ltv: ltvCalc,
      cacPerClient: cacPerClientCalc,
      ltvCacRatio: cacPerClientCalc > 0 ? ltvCalc / cacPerClientCalc : 0,
      cacPaybackPeriod: cacPaybackPeriodCalc,
      finalActiveClients: totalActiveClientsEnd,
      totalChurnedClients: monthlyDataArray.reduce((sum, m) => sum + m.churnedClients, 0),
      churnRate: params.churnRate,
      roi: roiCalc,
      implementationMargin: finalTotalRevenue > 0 ? 
        (monthlyDataArray.reduce((sum, m) => sum + m.implementationCosts, 0) / finalTotalRevenue) * 100 : 0,
      breakevenMonth: breakevenMonthCalc,
      nrr: monthlyDataArray[11]?.nrr || 0,
      avgNrr,
      expansionRevenue: monthlyDataArray.reduce((sum, m) => sum + m.upsellRevenue + m.additionalMessagesRevenue, 0),
      churnedRevenue: 0, // TODO: Рассчитать потерянную выручку от оттока
      // Компоненты CAC
      totalPartnerCommissions: monthlyDataArray.reduce((sum, m) => sum + m.partnerCommissions, 0),
      totalSalesTeamCosts: monthlyDataArray.reduce((sum, m) => sum + m.salesTeamCosts, 0),
      totalMarketingCosts: monthlyDataArray.reduce((sum, m) => sum + m.marketingCosts, 0),
      totalLeadGenerationCosts: monthlyDataArray.reduce((sum, m) => sum + m.leadGenerationCosts, 0),
      // Детализация Upsell
      totalAdditionalBotsRevenue: monthlyDataArray.reduce((sum, m) => sum + m.upsellAdditionalBots, 0),
      totalNewFeaturesRevenue: monthlyDataArray.reduce((sum, m) => sum + m.upsellNewFeatures, 0),
      totalMessageExpansionRevenue: monthlyDataArray.reduce((sum, m) => sum + m.upsellMessagePacks, 0),
      totalAdditionalIntegrationsRevenue: monthlyDataArray.reduce((sum, m) => sum + m.upsellIntegrations, 0)
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