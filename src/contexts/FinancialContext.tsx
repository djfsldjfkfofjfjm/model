import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  FinancialModelParams, 
  MonthlyData, 
  TotalData, 
  ClientsData,
  UpsellSettings,
  TaxMode,
  FOTMode
} from '../types/FinancialTypes';
import { useFinancialModel } from '../hooks/useFinancialModel';
import { 
  DEFAULT_BASE_PARAMS, 
  DEFAULT_NEW_CLIENTS, 
  DEFAULT_SUBSCRIPTION_PRICES,
  DEFAULT_MESSAGE_PACKAGES,
  DEFAULT_INTEGRATION_PARAMS,
  DEFAULT_CAC_PARAMS,
  DEFAULT_UPSELL_PARAMS,
  DEFAULT_FOT_VALUES // Added import
} from '../constants/DefaultValues';

interface FinancialContextType {
  // Данные модели
  monthlyData: MonthlyData[];
  totalData: TotalData;
  
  // Базовые параметры
  taxMode: TaxMode;
  setTaxMode: (mode: TaxMode) => void;
  customTaxRate: number;
  setCustomTaxRate: (rate: number) => void;
  fotMode: FOTMode;
  setFotMode: (mode: FOTMode) => void;
  apiCostPercentage: number;
  setApiCostPercentage: (value: number) => void;
  churnRate: number;
  setChurnRate: (value: number) => void;
  maxImplementationCost: number;
  setMaxImplementationCost: (value: number) => void;

  // ФОТ (новые состояния для редактирования)
  fotOptimistic: number[];
  setFotOptimistic: (values: number[]) => void;
  fotPessimistic: number[];
  setFotPessimistic: (values: number[]) => void;
  
  // Клиенты
  newClients75: number[];
  setNewClients75: (clients: number[]) => void;
  newClients150: number[];
  setNewClients150: (clients: number[]) => void;
  newClients250: number[];
  setNewClients250: (clients: number[]) => void;
  newClients500: number[];
  setNewClients500: (clients: number[]) => void;
  newClients1000: number[];
  setNewClients1000: (clients: number[]) => void;
  
  // Цены подписок
  subscriptionPrice75: number;
  setSubscriptionPrice75: (price: number) => void;
  subscriptionPrice150: number;
  setSubscriptionPrice150: (price: number) => void;
  subscriptionPrice250: number;
  setSubscriptionPrice250: (price: number) => void;
  subscriptionPrice500: number;
  setSubscriptionPrice500: (price: number) => void;
  subscriptionPrice1000: number;
  setSubscriptionPrice1000: (price: number) => void;
  
  // Параметры пакетов сообщений
  messages75: number;
  setMessages75: (count: number) => void;
  messages150: number;
  setMessages150: (count: number) => void;
  messages250: number;
  setMessages250: (count: number) => void;
  messages500: number;
  setMessages500: (count: number) => void;
  messages1000: number;
  setMessages1000: (count: number) => void;
  messageUsageRate: number;
  setMessageUsageRate: (rate: number) => void;
  messageUsagePercentage: number;
  setMessageUsagePercentage: (rate: number) => void;
  carryOverPercentage: number;
  setCarryOverPercentage: (percentage: number) => void;
  unusedMessagesCarryOver: number;
  setUnusedMessagesCarryOver: (percentage: number) => void;
  additionalMessagePrice: number;
  setAdditionalMessagePrice: (price: number) => void;
  
  // Интеграция
  integrationPrice: number;
  setIntegrationPrice: (price: number) => void;
  cacPercentage: number;
  setCacPercentage: (percentage: number) => void;
  implementationPercentage: number;
  setImplementationPercentage: (percentage: number) => void;
  
  // CAC параметры
  partnerCommissionRate: number;
  setPartnerCommissionRate: (rate: number) => void;
  salesTeamPercentage: number;
  setSalesTeamPercentage: (percentage: number) => void;
  marketingPercentage: number;
  setMarketingPercentage: (percentage: number) => void;
  leadGenerationPerClient: number;
  setLeadGenerationPerClient: (value: number) => void;
  
  // Upsell параметры
  additionalBotsRate: number;
  setAdditionalBotsRate: (rate: number) => void;
  additionalBotsPrice: number;
  setAdditionalBotsPrice: (price: number) => void;
  newFeaturesRate: number;
  setNewFeaturesRate: (rate: number) => void;
  newFeaturesPrice: number;
  setNewFeaturesPrice: (price: number) => void;
  messageExpansionRate: number;
  setMessageExpansionRate: (rate: number) => void;
  messageExpansionPrice: number;
  setMessageExpansionPrice: (price: number) => void;
  additionalIntegrationsRate: number;
  setAdditionalIntegrationsRate: (rate: number) => void;
  additionalIntegrationsPrice: number; 
  setAdditionalIntegrationsPrice: (price: number) => void;
  
  // Распределение каналов
  channelDistribution: { direct: number; partner: number };
  setChannelDistribution: (distribution: { direct: number; partner: number }) => void;
  
  // Параметры прямого канала
  directSalesPercentage: number;
  setDirectSalesPercentage: (percentage: number) => void;
  directMarketingPercentage: number;
  setDirectMarketingPercentage: (percentage: number) => void;
  directLeadCost: number;
  setDirectLeadCost: (cost: number) => void;
  
  // Параметры партнерского канала (partnerCommissionRate уже есть)
  partnerLeadCost: number;
  setPartnerLeadCost: (cost: number) => void;
  
  // Методы
  calculateFinancialModel: () => void;
  
  // UI
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const FinancialContext = createContext<FinancialContextType | null>(null);

export const useFinancialContext = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancialContext must be used within a FinancialProvider');
  }
  return context;
};

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider: React.FC<FinancialProviderProps> = ({ children }) => {
  // UI состояние
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Базовые параметры модели
  const [taxMode, setTaxModeBase] = useState<TaxMode>(DEFAULT_BASE_PARAMS.taxMode);
  const [customTaxRate, setCustomTaxRateBase] = useState<number>(15); // Дефолтное значение 15%
  const [fotMode, setFotModeBase] = useState<FOTMode>(DEFAULT_BASE_PARAMS.fotMode);
  const [apiCostPercentage, setApiCostPercentageBase] = useState(DEFAULT_INTEGRATION_PARAMS.apiCostPercentage);
  const [churnRate, setChurnRateBase] = useState(DEFAULT_BASE_PARAMS.churnRate);
  const [maxImplementationCost, setMaxImplementationCostBase] = useState(DEFAULT_BASE_PARAMS.maxImplementationCost);
  
  // Состояния для редактируемых ФОТ
  const [fotOptimistic, setFotOptimisticBase] = useState<number[]>([...DEFAULT_FOT_VALUES.optimistic]);
  const [fotPessimistic, setFotPessimisticBase] = useState<number[]>([...DEFAULT_FOT_VALUES.pessimistic]);

  // Обертки для сеттеров, которые запускают пересчет
  const setTaxMode = (mode: TaxMode) => {
    setTaxModeBase(mode);
  };
  
  const setCustomTaxRate = (rate: number) => {
    setCustomTaxRateBase(rate);
  };
  
  const setFotMode = (mode: FOTMode) => {
    setFotModeBase(mode);
  };

  const setFotOptimistic = (values: number[]) => {
    setFotOptimisticBase(values);
    // calculateFinancialModel(); // Вызываем напрямую
  };

  const setFotPessimistic = (values: number[]) => {
    setFotPessimisticBase(values);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setApiCostPercentage = (value: number) => {
    setApiCostPercentageBase(value);
  };
  
  const setChurnRate = (value: number) => {
    setChurnRateBase(value);
  };
  
  const setMaxImplementationCost = (value: number) => {
    console.log('📝 FinancialContext: setMaxImplementationCost вызван с:', value);
    setMaxImplementationCostBase(value);
  };
  
  // Новые клиенты (приход по месяцам)
  const [newClients75, setNewClients75Base] = useState(DEFAULT_NEW_CLIENTS.clients75);
  const [newClients150, setNewClients150Base] = useState(DEFAULT_NEW_CLIENTS.clients150);
  const [newClients250, setNewClients250Base] = useState(DEFAULT_NEW_CLIENTS.clients250);
  const [newClients500, setNewClients500Base] = useState(DEFAULT_NEW_CLIENTS.clients500);
  const [newClients1000, setNewClients1000Base] = useState(DEFAULT_NEW_CLIENTS.clients1000);
  
  // Обертки для сеттеров клиентов
  const setNewClients75 = (clients: number[]) => {
    setNewClients75Base(clients);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setNewClients150 = (clients: number[]) => {
    setNewClients150Base(clients);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setNewClients250 = (clients: number[]) => {
    setNewClients250Base(clients);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setNewClients500 = (clients: number[]) => {
    setNewClients500Base(clients);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setNewClients1000 = (clients: number[]) => {
    setNewClients1000Base(clients);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  // Цены пакетов сообщений
  const [subscriptionPrice75, setSubscriptionPrice75Base] = useState(DEFAULT_SUBSCRIPTION_PRICES.price75);
  const [subscriptionPrice150, setSubscriptionPrice150Base] = useState(DEFAULT_SUBSCRIPTION_PRICES.price150);
  const [subscriptionPrice250, setSubscriptionPrice250Base] = useState(DEFAULT_SUBSCRIPTION_PRICES.price250);
  const [subscriptionPrice500, setSubscriptionPrice500Base] = useState(DEFAULT_SUBSCRIPTION_PRICES.price500);
  const [subscriptionPrice1000, setSubscriptionPrice1000Base] = useState(DEFAULT_SUBSCRIPTION_PRICES.price1000);
  
  // Обертки для сеттеров цен
  const setSubscriptionPrice75 = (price: number) => {
    setSubscriptionPrice75Base(price);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setSubscriptionPrice150 = (price: number) => {
    setSubscriptionPrice150Base(price);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setSubscriptionPrice250 = (price: number) => {
    setSubscriptionPrice250Base(price);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setSubscriptionPrice500 = (price: number) => {
    setSubscriptionPrice500Base(price);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  const setSubscriptionPrice1000 = (price: number) => {
    setSubscriptionPrice1000Base(price);
    // calculateFinancialModel(); // Вызываем напрямую
  };
  
  // Параметры модели пакетов сообщений
  // Для этих сеттеров также убираем setTimeout, если они должны триггерить пересчет
  const [messages75, setMessages75Base] = useState(DEFAULT_MESSAGE_PACKAGES.messages75);
  const [messages150, setMessages150Base] = useState(DEFAULT_MESSAGE_PACKAGES.messages150);
  const [messages250, setMessages250Base] = useState(DEFAULT_MESSAGE_PACKAGES.messages250);
  const [messages500, setMessages500Base] = useState(DEFAULT_MESSAGE_PACKAGES.messages500);
  const [messages1000, setMessages1000Base] = useState(DEFAULT_MESSAGE_PACKAGES.messages1000);
  const [messageUsageRate, setMessageUsageRateBase] = useState(DEFAULT_MESSAGE_PACKAGES.usageRate);
  const [carryOverPercentage, setCarryOverPercentageBase] = useState(DEFAULT_MESSAGE_PACKAGES.carryOverPercentage);
  const [additionalMessagePrice, setAdditionalMessagePriceBase] = useState(DEFAULT_MESSAGE_PACKAGES.additionalPrice);

  const setMessages75 = (count: number) => { setMessages75Base(count); };
  const setMessages150 = (count: number) => { setMessages150Base(count); };
  const setMessages250 = (count: number) => { setMessages250Base(count); };
  const setMessages500 = (count: number) => { setMessages500Base(count); };
  const setMessages1000 = (count: number) => { setMessages1000Base(count); };
  const setMessageUsageRate = (rate: number) => { 
    console.log('📝 FinancialContext: setMessageUsageRate вызван с:', rate);
    setMessageUsageRateBase(rate); 
  };
  const setCarryOverPercentage = (percentage: number) => { 
    console.log('📝 FinancialContext: setCarryOverPercentage вызван с:', percentage);
    setCarryOverPercentageBase(percentage); 
  };
  const setAdditionalMessagePrice = (price: number) => { 
    console.log('📝 FinancialContext: setAdditionalMessagePrice вызван с:', price);
    setAdditionalMessagePriceBase(price); 
  };

  // Стоимость интеграции и связанные расходы
  const [integrationPrice, setIntegrationPriceBase] = useState(DEFAULT_INTEGRATION_PARAMS.price);
  const [cacPercentage, setCacPercentageBase] = useState(DEFAULT_INTEGRATION_PARAMS.cacPercentage);
  const [implementationPercentage, setImplementationPercentageBase] = useState(DEFAULT_INTEGRATION_PARAMS.implementationPercentage);

  const setIntegrationPrice = (price: number) => { setIntegrationPriceBase(price); /* calculateFinancialModel(); */ };
  const setCacPercentage = (percentage: number) => { setCacPercentageBase(percentage); /* calculateFinancialModel(); */ };
  const setImplementationPercentage = (percentage: number) => { setImplementationPercentageBase(percentage); /* calculateFinancialModel(); */ };
  
  // Декомпозиция CAC
  const [partnerCommissionRate, setPartnerCommissionRateBase] = useState(DEFAULT_CAC_PARAMS.partnerCommissionRate);
  const [salesTeamPercentage, setSalesTeamPercentageBase] = useState(DEFAULT_CAC_PARAMS.salesTeamPercentage);
  const [marketingPercentage, setMarketingPercentageBase] = useState(DEFAULT_CAC_PARAMS.marketingPercentage);
  const [leadGenerationPerClient, setLeadGenerationPerClientBase] = useState(DEFAULT_CAC_PARAMS.leadGenerationPerClient);

  const setPartnerCommissionRate = (rate: number) => { setPartnerCommissionRateBase(rate); /* calculateFinancialModel(); */ };
  const setSalesTeamPercentage = (percentage: number) => { setSalesTeamPercentageBase(percentage); /* calculateFinancialModel(); */ };
  const setMarketingPercentage = (percentage: number) => { setMarketingPercentageBase(percentage); /* calculateFinancialModel(); */ };
  const setLeadGenerationPerClient = (value: number) => { setLeadGenerationPerClientBase(value); /* calculateFinancialModel(); */ };
  
  // Параметры для декомпозиции Upsell
  const [additionalBotsRate, setAdditionalBotsRateBase] = useState(DEFAULT_UPSELL_PARAMS.additionalBotsRate);
  const [additionalBotsPrice, setAdditionalBotsPriceBase] = useState(DEFAULT_UPSELL_PARAMS.additionalBotsPrice);
  const [newFeaturesRate, setNewFeaturesRateBase] = useState(DEFAULT_UPSELL_PARAMS.newFeaturesRate);
  const [newFeaturesPrice, setNewFeaturesPriceBase] = useState(DEFAULT_UPSELL_PARAMS.newFeaturesPrice);
  const [messageExpansionRate, setMessageExpansionRateBase] = useState(DEFAULT_UPSELL_PARAMS.messageExpansionRate);
  const [messageExpansionPrice, setMessageExpansionPriceBase] = useState(DEFAULT_UPSELL_PARAMS.messageExpansionPrice);
  const [additionalIntegrationsRate, setAdditionalIntegrationsRateBase] = useState(DEFAULT_UPSELL_PARAMS.additionalIntegrationsRate);
  const [additionalIntegrationsPrice, setAdditionalIntegrationsPriceBase] = useState(DEFAULT_UPSELL_PARAMS.additionalIntegrationsPrice);
  
  // Распределение каналов и параметры
  const [channelDistribution, setChannelDistributionBase] = useState({ direct: 60, partner: 40 });
  const [directSalesPercentage, setDirectSalesPercentageBase] = useState(10);
  const [directMarketingPercentage, setDirectMarketingPercentageBase] = useState(5);
  const [directLeadCost, setDirectLeadCostBase] = useState(30);
  const [partnerLeadCost, setPartnerLeadCostBase] = useState(10);

  const setAdditionalBotsRate = (rate: number) => { setAdditionalBotsRateBase(rate); /* calculateFinancialModel(); */ };
  const setAdditionalBotsPrice = (price: number) => { setAdditionalBotsPriceBase(price); /* calculateFinancialModel(); */ };
  const setNewFeaturesRate = (rate: number) => { setNewFeaturesRateBase(rate); /* calculateFinancialModel(); */ };
  const setNewFeaturesPrice = (price: number) => { setNewFeaturesPriceBase(price); /* calculateFinancialModel(); */ };
  const setMessageExpansionRate = (rate: number) => { setMessageExpansionRateBase(rate); /* calculateFinancialModel(); */ };
  const setMessageExpansionPrice = (price: number) => { setMessageExpansionPriceBase(price); /* calculateFinancialModel(); */ };
  const setAdditionalIntegrationsRate = (rate: number) => { setAdditionalIntegrationsRateBase(rate); /* calculateFinancialModel(); */ };
  const setAdditionalIntegrationsPrice = (price: number) => { setAdditionalIntegrationsPriceBase(price); /* calculateFinancialModel(); */ };
  
  // Обертки для каналов
  const setChannelDistribution = (distribution: { direct: number; partner: number }) => { setChannelDistributionBase(distribution); /* calculateFinancialModel(); */ };
  const setDirectSalesPercentage = (percentage: number) => { setDirectSalesPercentageBase(percentage); /* calculateFinancialModel(); */ };
  const setDirectMarketingPercentage = (percentage: number) => { setDirectMarketingPercentageBase(percentage); /* calculateFinancialModel(); */ };
  const setDirectLeadCost = (cost: number) => { setDirectLeadCostBase(cost); /* calculateFinancialModel(); */ };
  const setPartnerLeadCost = (cost: number) => { setPartnerLeadCostBase(cost); /* calculateFinancialModel(); */ };
  
  // Создаем модель на основе параметров
  const modelParams: FinancialModelParams = {
    taxMode,
    customTaxRate,
    fotMode,
    apiCostPercentage,
    churnRate,
    maxImplementationCost,
    integrationPrice,
    cacPercentage,
    implementationPercentage,
    partnerCommissionRate,
    salesTeamPercentage,
    marketingPercentage,
    leadGenerationPerClient,
    messageUsageRate,
    carryOverPercentage,
    additionalMessagePrice,
    fotOptimistic,
    fotPessimistic,
    channelDistribution,
    directSalesPercentage,
    directMarketingPercentage,
    directLeadCost,
    partnerLeadCost
  };
  
  const clientsData: ClientsData = {
    newClients75,
    newClients150,
    newClients250,
    newClients500,
    newClients1000,
    subscriptionPrice75,
    subscriptionPrice150,
    subscriptionPrice250,
    subscriptionPrice500,
    subscriptionPrice1000,
    messages75,
    messages150,
    messages250,
    messages500,
    messages1000
  };
  
  const upsellSettings: UpsellSettings = {
    additionalBotsPercentage: additionalBotsRate,
    additionalBotsPrice,
    newFeaturesPercentage: newFeaturesRate,
    newFeaturesPrice,
    messagePacksPercentage: messageExpansionRate,
    messagePacksPrice: messageExpansionPrice,
    integrationsPercentage: additionalIntegrationsRate,
    integrationsPrice: additionalIntegrationsPrice
  };
  
  // Используем кастомный хук для вычислений
  const { monthlyData, totalData, calculateFinancialModel } = useFinancialModel(
    modelParams,
    clientsData,
    upsellSettings
  );
  
  // Запускаем расчет при изменении любого из параметров модели
  useEffect(() => {
    console.log('🔄 useEffect в FinancialContext сработал!');
    calculateFinancialModel();
  }, [calculateFinancialModel]);
  
  const contextValue: FinancialContextType = {
    // Данные модели
    monthlyData,
    totalData,
    
    // Базовые параметры
    taxMode,
    setTaxMode,
    customTaxRate,
    setCustomTaxRate,
    fotMode,
    setFotMode,
    apiCostPercentage,
    setApiCostPercentage,
    churnRate,
    setChurnRate,
    maxImplementationCost,
    setMaxImplementationCost,

    // ФОТ
    fotOptimistic,
    setFotOptimistic,
    fotPessimistic,
    setFotPessimistic,
    
    // Клиенты
    newClients75,
    setNewClients75,
    newClients150,
    setNewClients150,
    newClients250,
    setNewClients250,
    newClients500,
    setNewClients500,
    newClients1000,
    setNewClients1000,
    
    // Цены подписок
    subscriptionPrice75,
    setSubscriptionPrice75,
    subscriptionPrice150,
    setSubscriptionPrice150,
    subscriptionPrice250,
    setSubscriptionPrice250,
    subscriptionPrice500,
    setSubscriptionPrice500,
    subscriptionPrice1000,
    setSubscriptionPrice1000,
    
    // Параметры пакетов сообщений
    messages75,
    setMessages75,
    messages150,
    setMessages150,
    messages250,
    setMessages250,
    messages500,
    setMessages500,
    messages1000,
    setMessages1000,
    messageUsageRate,
    setMessageUsageRate,
    messageUsagePercentage: messageUsageRate, // Уже в процентах!
    setMessageUsagePercentage: (percentage: number) => setMessageUsageRate(percentage), // Просто передаем как есть
    carryOverPercentage,
    setCarryOverPercentage,
    unusedMessagesCarryOver: carryOverPercentage, // Уже в процентах!
    setUnusedMessagesCarryOver: (percentage: number) => setCarryOverPercentage(percentage), // Просто передаем как есть
    additionalMessagePrice,
    setAdditionalMessagePrice,
    
    // Интеграция
    integrationPrice,
    setIntegrationPrice,
    cacPercentage,
    setCacPercentage,
    implementationPercentage,
    setImplementationPercentage,
    
    // CAC параметры
    partnerCommissionRate,
    setPartnerCommissionRate,
    salesTeamPercentage,
    setSalesTeamPercentage,
    marketingPercentage,
    setMarketingPercentage,
    leadGenerationPerClient,
    setLeadGenerationPerClient,
    
    // Upsell параметры
    additionalBotsRate,
    setAdditionalBotsRate,
    additionalBotsPrice,
    setAdditionalBotsPrice,
    newFeaturesRate,
    setNewFeaturesRate,
    newFeaturesPrice,
    setNewFeaturesPrice,
    messageExpansionRate,
    setMessageExpansionRate,
    messageExpansionPrice,
    setMessageExpansionPrice,
    additionalIntegrationsRate,
    setAdditionalIntegrationsRate,
    additionalIntegrationsPrice,
    setAdditionalIntegrationsPrice,
    
    // Распределение каналов
    channelDistribution,
    setChannelDistribution,
    directSalesPercentage,
    setDirectSalesPercentage,
    directMarketingPercentage,
    setDirectMarketingPercentage,
    directLeadCost,
    setDirectLeadCost,
    partnerLeadCost,
    setPartnerLeadCost,
    
    // Методы
    calculateFinancialModel,
    
    // UI
    activeTab,
    setActiveTab
  };
  
  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};
