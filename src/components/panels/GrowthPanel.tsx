import React, { useState } from 'react';
import ModernUpsellEditor from './ModernUpsellEditor';
import InfoTooltip from '../common/InfoTooltip';

const GrowthPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState('upsell');

  const sections = [
    { id: 'upsell', name: 'Дополнительные продажи', icon: '🚀' },
    { id: 'expansion', name: 'Стратегии роста', icon: '📊' }
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
        {activeSection === 'upsell' && (
          <div className="space-y-6">
            <ModernUpsellEditor />
          </div>
        )}

        {activeSection === 'expansion' && (
          <div className="space-y-6">
            {/* Стратегии роста */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                Стратегии увеличения выручки
                <InfoTooltip text="Планируйте стратегии роста среднего чека и расширения использования" />
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Увеличение чека */}
                <div>
                  <h3 className="text-base font-medium text-gray-700 mb-4">Увеличение среднего чека</h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                      <h4 className="font-medium text-purple-800 mb-2">Upgrade тарифов</h4>
                      <p className="text-sm text-purple-700 mb-2">
                        Стимулирование перехода на более дорогие тарифы
                      </p>
                      <div className="text-xs text-purple-600">
                        • Ограничения в базовых тарифах<br />
                        • Эксклюзивные функции в премиум<br />
                        • Скидки при годовой оплате
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Usage-based pricing</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        Монетизация через дополнительное использование
                      </p>
                      <div className="text-xs text-blue-600">
                        • Доп. сообщения сверх пакета<br />
                        • Приоритетная обработка<br />
                        • Расширенная аналитика
                      </div>
                    </div>
                  </div>
                </div>

                {/* Расширение использования */}
                <div>
                  <h3 className="text-base font-medium text-gray-700 mb-4">Расширение использования</h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">Multi-product</h4>
                      <p className="text-sm text-green-700 mb-2">
                        Создание экосистемы продуктов
                      </p>
                      <div className="text-xs text-green-600">
                        • Дополнительные боты<br />
                        • Интеграции с CRM<br />
                        • Аналитические модули
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 mb-2">Seat expansion</h4>
                      <p className="text-sm text-orange-700 mb-2">
                        Увеличение количества пользователей
                      </p>
                      <div className="text-xs text-orange-600">
                        • Командные тарифы<br />
                        • Департаментные лицензии<br />
                        • Корпоративные решения
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Метрики роста */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-base font-medium text-gray-700 mb-4">Ключевые метрики роста</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600">120%</div>
                    <div className="text-sm text-gray-600 mt-1">Net Revenue Retention</div>
                    <div className="text-xs text-gray-500 mt-1">Целевой: &gt;110%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">15%</div>
                    <div className="text-sm text-gray-600 mt-1">Expansion Revenue</div>
                    <div className="text-xs text-gray-500 mt-1">от общей выручки</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">25%</div>
                    <div className="text-sm text-gray-600 mt-1">Upsell Rate</div>
                    <div className="text-xs text-gray-500 mt-1">клиентов в год</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">$50</div>
                    <div className="text-sm text-gray-600 mt-1">ARPU Growth</div>
                    <div className="text-xs text-gray-500 mt-1">ежемесячно</div>
                  </div>
                </div>
              </div>

              {/* Дорожная карта */}
              <div className="mt-6">
                <h3 className="text-base font-medium text-gray-700 mb-4">Дорожная карта роста</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-3">
                    🚧 В разработке: Планировщик стратегий роста по кварталам
                  </p>
                  <div className="space-y-2 opacity-50">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Q1:</span>
                      <span>Запуск usage-based тарификации</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Q2:</span>
                      <span>Внедрение командных тарифов</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Q3:</span>
                      <span>Расширение продуктовой линейки</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Q4:</span>
                      <span>Корпоративные решения</span>
                    </div>
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

export default GrowthPanel;