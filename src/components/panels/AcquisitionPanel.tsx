import React, { useState } from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import ModernClientsEditor from './ModernClientsEditor';
import AcquisitionChannelsEditor from './AcquisitionChannelsEditor';
import ChannelDistributionSettings from './ChannelDistributionSettings';
import EditableCell from '../common/EditableCell';
import InfoTooltip from '../common/InfoTooltip';

const AcquisitionPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState('clients');
  const { churnRate, setChurnRate } = useFinancialContext();

  const sections = [
    { id: 'clients', name: 'Новые клиенты', icon: '👥' },
    { id: 'channels', name: 'Каналы привлечения', icon: '🎯' },
    { id: 'retention', name: 'Удержание', icon: '🔄' }
  ];

  return (
    <div className="flex gap-6">
      {/* Боковое меню */}
      <div className="w-64">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3 px-2">РАЗДЕЛЫ</h3>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1">
        {activeSection === 'clients' && (
          <div className="space-y-6">
            <ModernClientsEditor />
          </div>
        )}

        {activeSection === 'channels' && (
          <div className="space-y-6">
            <AcquisitionChannelsEditor />
            <ChannelDistributionSettings />
          </div>
        )}

        {activeSection === 'retention' && (
          <div className="space-y-6">
            {/* Настройки удержания */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                Параметры удержания клиентов
                <InfoTooltip text="Настройте показатели оттока и удержания клиентов" />
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium text-gray-700 mb-4">Общий отток (Churn Rate)</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <label className="text-sm font-medium text-gray-600">Ежемесячный отток:</label>
                      <div className="flex items-center gap-2">
                        <EditableCell
                          value={churnRate}
                          onChange={setChurnRate}
                          min={0}
                          max={20}
                          step={0.1}
                        />
                        <span className="text-gray-600">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Процент клиентов, отказывающихся от подписки каждый месяц
                    </p>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Влияние на метрики:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Retention Rate: {(100 - churnRate).toFixed(1)}%</li>
                      <li>• Среднее время жизни клиента: {(1 / (churnRate / 100)).toFixed(1)} мес.</li>
                      <li>• Годовое удержание: {Math.pow(1 - churnRate/100, 12).toFixed(1) * 100}%</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-700 mb-4">Детализация по тарифам</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 mb-3">
                      🚧 В разработке: Возможность задавать разный churn для каждого тарифа
                    </p>
                    <div className="space-y-2 opacity-50">
                      <div className="flex justify-between text-sm">
                        <span>API-only ($75):</span>
                        <span>3.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Базовый ($150):</span>
                        <span>2.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Стандарт ($250):</span>
                        <span>2.0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Премиум ($500):</span>
                        <span>1.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Корпоративный ($1000):</span>
                        <span>1.0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Стратегии удержания */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-base font-medium text-gray-700 mb-4">Рекомендации по снижению оттока</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Onboarding</h4>
                    <p className="text-sm text-green-700">
                      Качественное обучение в первые 14 дней снижает отток на 20-30%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Engagement</h4>
                    <p className="text-sm text-blue-700">
                      Регулярное использование продукта коррелирует с низким оттоком
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Support</h4>
                    <p className="text-sm text-purple-700">
                      Быстрая поддержка увеличивает retention на 15-25%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcquisitionPanel;