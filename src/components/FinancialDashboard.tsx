import React, { ReactElement } from 'react';
import { useFinancialContext } from '../contexts/FinancialContext';
import SettingsPanel from './panels/SettingsPanel';
import ClientsEditor from './panels/ClientsEditor';
import FOTEditor from './panels/FOTEditor';
import KeyMetricsPanel from './panels/KeyMetricsPanel';
import UpsellSettingsPanel from './panels/UpsellSettingsPanel';
import RevenueChart from './charts/RevenueChart';
import ClientsChart from './charts/ClientsChart';
import KPIRadarChart from './charts/KPIRadarChart';
import { useFormatting } from '../hooks';

const FinancialDashboard = (): ReactElement => {
  const { 
    activeTab,
    setActiveTab,
    totalData,
    monthlyData,
  } = useFinancialContext();
  
  const { currency } = useFormatting();
  
  // Табы навигации
  const renderTabs = () => (
    <div className="flex space-x-1 bg-white p-1 rounded-t-lg shadow overflow-x-auto">
      <button 
        className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`}
        onClick={() => setActiveTab('dashboard')}
      >
        Дашборд
      </button>
      <button 
        className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`}
        onClick={() => setActiveTab('settings')}
      >
        Настройки
      </button>
      <button 
        className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 ${activeTab === 'clients' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`}
        onClick={() => setActiveTab('clients')}
      >
        Клиенты
      </button>
      <button 
        className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 ${activeTab === 'fot' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`}
        onClick={() => setActiveTab('fot')}
      >
        ФОТ
      </button>
      <button 
        className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 ${activeTab === 'upsell' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`}
        onClick={() => setActiveTab('upsell')}
      >
        Upsell
      </button>
    </div>
  );
  
  const renderSummaryHeader = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white shadow rounded-lg p-6 flex flex-col hover:shadow-lg transition-shadow duration-200">
        <span className="text-gray-500 mb-1 text-sm uppercase tracking-wide">Выручка (12 мес)</span>
        <span className="text-gray-800 text-2xl font-bold">{currency(totalData.totalRevenue || 0)}</span>
        <div className="mt-2 flex items-center">
          <span className="text-green-500 text-sm font-semibold flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Сред. мес: {currency(totalData.avgMonthlyRevenue || 0)}
          </span>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-6 flex flex-col hover:shadow-lg transition-shadow duration-200">
        <span className="text-gray-500 mb-1 text-sm uppercase tracking-wide">Прибыль (12 мес)</span>
        <span className={`text-2xl font-bold ${(totalData.totalNetProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {currency(totalData.totalNetProfit || 0)}
        </span>
        <div className="mt-2 flex items-center">
          <span className={`text-sm font-semibold flex items-center ${(totalData.totalNetProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Сред. мес: {currency(totalData.avgMonthlyProfit || 0)}
          </span>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-6 flex flex-col hover:shadow-lg transition-shadow duration-200">
        <span className="text-gray-500 mb-1 text-sm uppercase tracking-wide">LTV/CAC</span>
        <span className="text-gray-800 text-2xl font-bold">{totalData.ltvCacRatio ? totalData.ltvCacRatio.toFixed(1) : '0'}</span>
        <div className="mt-2 flex items-center">
          <span className="text-blue-500 text-sm font-semibold flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            CAC: {currency(totalData.cacPerClient || 0)}
          </span>
        </div>
      </div>
    </div>
  );
  
  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      <div className="lg:col-span-4">
        {renderSummaryHeader()}
      </div>
      
      <div className="lg:col-span-2 bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Выручка и прибыль</h2>
        <RevenueChart data={monthlyData} />
      </div>
      
      <div className="lg:col-span-2 bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Клиенты</h2>
        <ClientsChart data={monthlyData} />
      </div>
      
      <div className="lg:col-span-2 bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ключевые метрики</h2>
        <KeyMetricsPanel />
      </div>
      
      <div className="lg:col-span-2 bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Radar KPI</h2>
        <KPIRadarChart />
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Финансовая модель</h1>
          <p className="text-gray-600">Ключевые показатели бизнеса на 12 месяцев вперед</p>
        </header>
        
        {renderTabs()}
        
        <div className="bg-white shadow rounded-b-lg p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'settings' && <SettingsPanel />}
          {activeTab === 'clients' && <ClientsEditor />}
          {activeTab === 'fot' && <FOTEditor />}
          {activeTab === 'upsell' && <UpsellSettingsPanel />}
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;