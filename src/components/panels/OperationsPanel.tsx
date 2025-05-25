import React, { useState } from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import ModernFOTEditor from './ModernFOTEditor';
import FOTEditorDecomposed from './FOTEditorDecomposed';
import FOTDistributionSettings from './FOTDistributionSettings';
import EditableCell from '../common/EditableCell';
import InfoTooltip from '../common/InfoTooltip';

const OperationsPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState('fot');
  const [fotView, setFotView] = useState('modern'); // modern или decomposed
  
  const {
    apiCostPercentage,
    setApiCostPercentage,
    cacPercentage,
    setCacPercentage,
  } = useFinancialContext();

  const sections = [
    { id: 'fot', name: 'Фонд оплаты труда', icon: '💰' },
    { id: 'tech', name: 'Технические расходы', icon: '⚙️' },
    { id: 'marketing', name: 'Маркетинг и продажи', icon: '📈' }
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
        {activeSection === 'fot' && (
          <div className="space-y-6">
            {/* Переключатель вида ФОТ */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Управление ФОТ</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setFotView('modern')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      fotView === 'modern'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Современный вид
                  </button>
                  <button
                    onClick={() => setFotView('decomposed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      fotView === 'decomposed'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    По отделам
                  </button>
                </div>
              </div>
            </div>

            {fotView === 'modern' ? <ModernFOTEditor /> : <ModernFOTEditor />}
          </div>
        )}

        {activeSection === 'tech' && (
          <div className="space-y-6">
            {/* Технические расходы */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                Технические и операционные расходы
                <InfoTooltip text="Настройте расходы на API, инфраструктуру и другие технические нужды" />
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium text-gray-700 mb-4">API и внешние сервисы</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-600">Расходы на API:</label>
                        <div className="flex items-center gap-2">
                          <EditableCell
                            value={apiCostPercentage}
                            onChange={setApiCostPercentage}
                            min={0}
                            max={100}
                          />
                          <span className="text-gray-600">%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        от выручки подписок и доп. сообщений
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Типичные API расходы:</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• OpenAI/Claude API: 25-35%</li>
                        <li>• Собственная модель: 10-15%</li>
                        <li>• Гибридное решение: 15-25%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-700 mb-4">Инфраструктура</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 mb-3">
                      🚧 В разработке: Детальная настройка инфраструктурных расходов
                    </p>
                    <div className="space-y-2 opacity-50">
                      <div className="flex justify-between text-sm">
                        <span>Серверы и хостинг:</span>
                        <span>$2,000/мес</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>База данных:</span>
                        <span>$500/мес</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>CDN и хранилище:</span>
                        <span>$300/мес</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Мониторинг и логи:</span>
                        <span>$200/мес</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Рекомендации по оптимизации */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-base font-medium text-gray-700 mb-4">Оптимизация технических расходов</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Кэширование</h4>
                    <p className="text-sm text-green-700">
                      Снижает API расходы на 20-40% за счёт повторного использования ответов
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Rate Limiting</h4>
                    <p className="text-sm text-blue-700">
                      Предотвращает злоупотребления и контролирует расходы
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Оптимизация промптов</h4>
                    <p className="text-sm text-purple-700">
                      Короткие эффективные промпты экономят до 30% токенов
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'marketing' && (
          <div className="space-y-6">
            {/* Маркетинг и продажи */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                Расходы на маркетинг и продажи
                <InfoTooltip text="Компоненты CAC уже настроены в разделе 'Каналы привлечения'" />
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">CAC настраивается по каналам</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Все компоненты стоимости привлечения клиентов (CAC) настраиваются в разделе 
                      "Привлечение → Каналы привлечения" для каждого канала отдельно:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Прямые продажи: расходы на отдел продаж, маркетинг, стоимость лида</li>
                      <li>• Партнёрская программа: комиссии, стоимость обработки лида</li>
                    </ul>
                    <button 
                      onClick={() => setActiveSection('tech')}
                      className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Посмотреть технические расходы →
                    </button>
                  </div>
                </div>
              </div>

              {/* Сводка текущих настроек CAC */}
              <div className="mt-6">
                <h3 className="text-base font-medium text-gray-700 mb-4">Текущая структура CAC</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Общий CAC процент:</span>
                      <span className="font-medium">{cacPercentage}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Детальная разбивка доступна в разделе "Каналы привлечения"
                    </div>
                  </div>
                </div>
              </div>

              {/* Метрики эффективности */}
              <div className="mt-6">
                <h3 className="text-base font-medium text-gray-700 mb-4">Эффективность маркетинга</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-indigo-800 mb-1">CAC Payback</h4>
                    <p className="text-2xl font-bold text-indigo-900">~3-4 мес</p>
                    <p className="text-xs text-indigo-700 mt-1">Целевой: &lt; 12 мес</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-1">LTV/CAC</h4>
                    <p className="text-2xl font-bold text-green-900">~3.5x</p>
                    <p className="text-xs text-green-700 mt-1">Целевой: &gt; 3x</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-orange-800 mb-1">CAC по каналам</h4>
                    <p className="text-xs text-orange-700">
                      Прямые: выше<br />
                      Партнёры: ниже
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

export default OperationsPanel;