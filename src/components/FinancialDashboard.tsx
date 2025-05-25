import React, { ReactElement, useState, useEffect } from 'react';
import { useFinancialContext } from '../contexts/FinancialContext';

// Новые компоненты для вкладок
import ModelSettingsPanel from './panels/ModelSettingsPanel';
import ProductSettingsPanel from './panels/ProductSettingsPanel';
import AcquisitionPanel from './panels/AcquisitionPanel';
import OperationsPanel from './panels/OperationsPanel';
import GrowthPanel from './panels/GrowthPanel';
import ResultsPanel from './panels/ResultsPanel';

// Утилиты
import { useFormatting } from '../hooks';
import { formatCurrency } from '../utils/formatters';

const FinancialDashboard = (): ReactElement => {
  const { 
    totalData,
    monthlyData,
  } = useFinancialContext();
  
  const { currency } = useFormatting();
  
  // Новый стейт для навигации
  const [activeTab, setActiveTab] = useState('model');
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Отслеживание изменений
  useEffect(() => {
    setHasUnsavedChanges(true);
    const timer = setTimeout(() => setHasUnsavedChanges(false), 3000);
    return () => clearTimeout(timer);
  }, [totalData]);
  
  // Новая структура табов
  const tabs = [
    { id: 'model', name: 'Модель', icon: '⚙️', description: 'Базовые настройки' },
    { id: 'product', name: 'Продукт', icon: '📦', description: 'Тарифы и монетизация' },
    { id: 'acquisition', name: 'Привлечение', icon: '🎯', description: 'Клиенты и каналы' },
    { id: 'operations', name: 'Операции', icon: '💼', description: 'Расходы и команда' },
    { id: 'growth', name: 'Рост', icon: '🚀', description: 'Дополнительные доходы' },
    { id: 'results', name: 'Результаты', icon: '📊', description: 'Аналитика и отчёты' }
  ];
  
  // Индикатор заполненности секций
  const getSectionProgress = (tabId: string) => {
    // Заглушка - в реальности будет проверять заполненность полей
    const progress = {
      model: 100,
      product: 85,
      acquisition: 70,
      operations: 60,
      growth: 40,
      results: 100
    };
    return progress[tabId] || 0;
  };
  
  // Мини-превью для живого отображения изменений
  const renderLivePreview = () => {
    if (!showLivePreview) return null;
    
    return (
      <div className="fixed right-6 top-24 w-80 bg-white rounded-xl shadow-2xl p-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Живой превью</h3>
          <button
            onClick={() => setShowLivePreview(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-xs text-gray-600">Выручка (год)</span>
            <span className={`text-sm font-semibold ${hasUnsavedChanges ? 'text-indigo-600' : 'text-gray-900'}`}>
              {formatCurrency(totalData.totalRevenue || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-xs text-gray-600">Чистая прибыль</span>
            <span className={`text-sm font-semibold ${
              (totalData.totalNetProfit || 0) > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalData.totalNetProfit || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-xs text-gray-600">Клиентов (конец)</span>
            <span className="text-sm font-semibold text-gray-900">
              {monthlyData[11] ? Math.round(
                (monthlyData[11].activeClients75 || 0) +
                (monthlyData[11].activeClients150 || 0) +
                (monthlyData[11].activeClients250 || 0) +
                (monthlyData[11].activeClients500 || 0) +
                (monthlyData[11].activeClients1000 || 0)
              ).toLocaleString('ru-RU') : '0'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-gray-600">ROI</span>
            <span className="text-sm font-semibold text-gray-900">{totalData.roi ? totalData.roi.toFixed(1) : '0'}%</span>
          </div>
        </div>
        
        {hasUnsavedChanges && (
          <div className="mt-3 text-xs text-indigo-600 flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Обновление...
          </div>
        )}
      </div>
    );
  };
  
  // Новая навигация
  const renderTabs = () => (
    <div className="bg-white border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const progress = getSectionProgress(tab.id);
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3 transition-all duration-200 ${
                  isActive 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs opacity-60">{tab.description}</div>
                  </div>
                </div>
                
                {/* Прогресс-индикатор */}
                {progress < 100 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-yellow-700">{progress}%</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Кнопка показа превью */}
        {!showLivePreview && (
          <button
            onClick={() => setShowLivePreview(true)}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Превью
          </button>
        )}
      </div>
    </div>
  );
  
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Финансовая модель SaaS</h1>
              <p className="text-sm text-gray-600 mt-1">Планирование на 12 месяцев • Чат-боты для бизнеса</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Индикатор автосохранения */}
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Все изменения сохранены
              </div>
              
              {/* Кнопка экспорта */}
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Экспорт
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Навигация */}
      {renderTabs()}
      
      {/* Контент */}
      <div className="container mx-auto px-6 py-6">
        <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
          {activeTab === 'model' && <ModelSettingsPanel />}
          {activeTab === 'product' && <ProductSettingsPanel />}
          {activeTab === 'acquisition' && <AcquisitionPanel />}
          {activeTab === 'operations' && <OperationsPanel />}
          {activeTab === 'growth' && <GrowthPanel />}
          {activeTab === 'results' && <ResultsPanel />}
        </div>
      </div>
      
      {/* Живое превью */}
      {renderLivePreview()}
      
      {/* Визард для новых пользователей (будет добавлен позже) */}
    </div>
  );
};

export default FinancialDashboard;