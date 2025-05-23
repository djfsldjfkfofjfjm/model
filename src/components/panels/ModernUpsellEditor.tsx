import React, { useState } from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import { InfoTooltip, EditableCell } from '../common';

interface UpsellProduct {
  key: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  bestCase: { rate: number; price: number };
  typical: { rate: number; price: number };
  conservative: { rate: number; price: number };
}

/**
 * Современный редактор Upsell с визуальными паттернами и пресетами
 */
const ModernUpsellEditor: React.FC = () => {
  const {
    additionalBotsRate, setAdditionalBotsRate,
    additionalBotsPrice, setAdditionalBotsPrice,
    newFeaturesRate, setNewFeaturesRate,
    newFeaturesPrice, setNewFeaturesPrice,
    messageExpansionRate, setMessageExpansionRate,
    messageExpansionPrice, setMessageExpansionPrice,
    additionalIntegrationsRate, setAdditionalIntegrationsRate,
    additionalIntegrationsPrice, setAdditionalIntegrationsPrice,
  } = useFinancialContext();

  const [selectedProduct, setSelectedProduct] = useState<string>('bots');
  const [visualMode, setVisualMode] = useState(true);

  const products: UpsellProduct[] = [
    {
      key: 'bots',
      name: 'Дополнительные боты',
      icon: '🤖',
      color: '#6366F1',
      description: 'Клиенты добавляют новых ботов для других отделов',
      bestCase: { rate: 5, price: 200 },
      typical: { rate: 2, price: 100 },
      conservative: { rate: 0.5, price: 50 }
    },
    {
      key: 'features',
      name: 'Новые функции',
      icon: '✨',
      color: '#10B981',
      description: 'Премиум функции: AI, аналитика, интеграции',
      bestCase: { rate: 4, price: 150 },
      typical: { rate: 1.5, price: 75 },
      conservative: { rate: 0.5, price: 30 }
    },
    {
      key: 'messages',
      name: 'Расширение сообщений',
      icon: '💬',
      color: '#F59E0B',
      description: 'Увеличение лимита сообщений',
      bestCase: { rate: 8, price: 100 },
      typical: { rate: 3, price: 50 },
      conservative: { rate: 1, price: 20 }
    },
    {
      key: 'integrations',
      name: 'Дополнительные интеграции',
      icon: '🔗',
      color: '#EC4899',
      description: 'CRM, ERP, кастомные интеграции',
      bestCase: { rate: 2, price: 300 },
      typical: { rate: 0.8, price: 150 },
      conservative: { rate: 0.3, price: 75 }
    }
  ];

  const getCurrentValues = (productKey: string) => {
    switch (productKey) {
      case 'bots':
        return { rate: additionalBotsRate, price: additionalBotsPrice, setRate: setAdditionalBotsRate, setPrice: setAdditionalBotsPrice };
      case 'features':
        return { rate: newFeaturesRate, price: newFeaturesPrice, setRate: setNewFeaturesRate, setPrice: setNewFeaturesPrice };
      case 'messages':
        return { rate: messageExpansionRate, price: messageExpansionPrice, setRate: setMessageExpansionRate, setPrice: setMessageExpansionPrice };
      case 'integrations':
        return { rate: additionalIntegrationsRate, price: additionalIntegrationsPrice, setRate: setAdditionalIntegrationsRate, setPrice: setAdditionalIntegrationsPrice };
      default:
        return { rate: 0, price: 0, setRate: () => {}, setPrice: () => {} };
    }
  };

  const applyPreset = (product: UpsellProduct, preset: 'bestCase' | 'typical' | 'conservative') => {
    const values = getCurrentValues(product.key);
    values.setRate(product[preset].rate);
    values.setPrice(product[preset].price);
  };

  const applyScenario = (scenario: 'aggressive' | 'balanced' | 'conservative') => {
    products.forEach(product => {
      const values = getCurrentValues(product.key);
      switch (scenario) {
        case 'aggressive':
          values.setRate(product.bestCase.rate);
          values.setPrice(product.bestCase.price);
          break;
        case 'balanced':
          values.setRate(product.typical.rate);
          values.setPrice(product.typical.price);
          break;
        case 'conservative':
          values.setRate(product.conservative.rate);
          values.setPrice(product.conservative.price);
          break;
      }
    });
  };

  const selectedProductData = products.find(p => p.key === selectedProduct)!;
  const currentValues = getCurrentValues(selectedProduct);

  // Расчёт потенциального дохода
  const calculatePotentialRevenue = (rate: number, price: number, baseClients: number = 100) => {
    const monthlyUpsells = (baseClients * rate) / 100;
    const monthlyRevenue = monthlyUpsells * price;
    const yearlyRevenue = monthlyRevenue * 12;
    return { monthlyUpsells, monthlyRevenue, yearlyRevenue };
  };

  const totalPotentialRevenue = products.reduce((sum, product) => {
    const values = getCurrentValues(product.key);
    const potential = calculatePotentialRevenue(values.rate, values.price);
    return sum + potential.yearlyRevenue;
  }, 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-indigo-600 flex items-center">
          Современный редактор Upsell
          <InfoTooltip
            content="Настройте стратегию дополнительных продаж с помощью визуальных инструментов"
            position="right"
          />
        </h2>
        <button
          onClick={() => setVisualMode(!visualMode)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          {visualMode ? '📊 Табличный вид' : '🎨 Визуальный вид'}
        </button>
      </div>

      {/* Быстрые сценарии */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">🎯 Быстрые сценарии</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => applyScenario('aggressive')}
            className="p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 text-left"
          >
            <div className="font-medium mb-1">🚀 Агрессивный</div>
            <div className="text-xs space-y-1">
              <div>Боты: {products[0].bestCase.rate}% • ${products[0].bestCase.price}</div>
              <div>Функции: {products[1].bestCase.rate}% • ${products[1].bestCase.price}</div>
              <div>Сообщения: {products[2].bestCase.rate}% • ${products[2].bestCase.price}</div>
              <div>Интеграции: {products[3].bestCase.rate}% • ${products[3].bestCase.price}</div>
            </div>
          </button>
          <button
            onClick={() => applyScenario('balanced')}
            className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 text-left"
          >
            <div className="font-medium mb-1">⚖️ Сбалансированный</div>
            <div className="text-xs space-y-1">
              <div>Боты: {products[0].typical.rate}% • ${products[0].typical.price}</div>
              <div>Функции: {products[1].typical.rate}% • ${products[1].typical.price}</div>
              <div>Сообщения: {products[2].typical.rate}% • ${products[2].typical.price}</div>
              <div>Интеграции: {products[3].typical.rate}% • ${products[3].typical.price}</div>
            </div>
          </button>
          <button
            onClick={() => applyScenario('conservative')}
            className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 text-left"
          >
            <div className="font-medium mb-1">🛡️ Консервативный</div>
            <div className="text-xs space-y-1">
              <div>Боты: {products[0].conservative.rate}% • ${products[0].conservative.price}</div>
              <div>Функции: {products[1].conservative.rate}% • ${products[1].conservative.price}</div>
              <div>Сообщения: {products[2].conservative.rate}% • ${products[2].conservative.price}</div>
              <div>Интеграции: {products[3].conservative.rate}% • ${products[3].conservative.price}</div>
            </div>
          </button>
        </div>
      </div>

      {visualMode ? (
        <>
          {/* Визуальный режим */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Выбор продукта */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Выберите продукт</h3>
              <div className="space-y-3">
                {products.map((product) => {
                  const values = getCurrentValues(product.key);
                  const potential = calculatePotentialRevenue(values.rate, values.price);
                  
                  return (
                    <button
                      key={product.key}
                      onClick={() => setSelectedProduct(product.key)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedProduct === product.key
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{product.icon}</span>
                          <div>
                            <div className="font-medium text-gray-800">{product.name}</div>
                            <div className="text-xs text-gray-600 mt-1">{product.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium" style={{ color: product.color }}>
                            {values.rate}% • ${values.price}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ~${Math.round(potential.yearlyRevenue).toLocaleString()}/год
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Настройки выбранного продукта */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Настройки: {selectedProductData.icon} {selectedProductData.name}
              </h3>
              
              {/* Пресеты */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700">Готовые пресеты</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyPreset(selectedProductData, 'conservative')}
                    className="p-3 bg-green-50 rounded-lg hover:bg-green-100 text-center"
                  >
                    <div className="text-xs text-gray-600">Консервативный</div>
                    <div className="font-medium text-green-700">
                      {selectedProductData.conservative.rate}% • ${selectedProductData.conservative.price}
                    </div>
                  </button>
                  <button
                    onClick={() => applyPreset(selectedProductData, 'typical')}
                    className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 text-center"
                  >
                    <div className="text-xs text-gray-600">Типичный</div>
                    <div className="font-medium text-blue-700">
                      {selectedProductData.typical.rate}% • ${selectedProductData.typical.price}
                    </div>
                  </button>
                  <button
                    onClick={() => applyPreset(selectedProductData, 'bestCase')}
                    className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 text-center"
                  >
                    <div className="text-xs text-gray-600">Лучший случай</div>
                    <div className="font-medium text-purple-700">
                      {selectedProductData.bestCase.rate}% • ${selectedProductData.bestCase.price}
                    </div>
                  </button>
                </div>
              </div>

              {/* Слайдеры */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Процент клиентов в месяц
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={currentValues.rate}
                      onChange={(e) => currentValues.setRate(parseFloat(e.target.value))}
                      className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${selectedProductData.color} 0%, ${selectedProductData.color} ${(currentValues.rate / 10) * 100}%, #E5E7EB ${(currentValues.rate / 10) * 100}%, #E5E7EB 100%)`
                      }}
                    />
                    <div className="w-16 text-center">
                      <EditableCell
                        value={currentValues.rate}
                        onChange={currentValues.setRate}
                        min={0}
                        max={10}
                        step={0.1}
                      />
                    </div>
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Средний чек
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={500}
                      step={5}
                      value={currentValues.price}
                      onChange={(e) => currentValues.setPrice(parseInt(e.target.value))}
                      className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${selectedProductData.color} 0%, ${selectedProductData.color} ${(currentValues.price / 500) * 100}%, #E5E7EB ${(currentValues.price / 500) * 100}%, #E5E7EB 100%)`
                      }}
                    />
                    <div className="w-20 text-center">
                      <EditableCell
                        value={currentValues.price}
                        onChange={currentValues.setPrice}
                        min={0}
                        max={1000}
                        formatCurrency
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Калькулятор потенциала */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Потенциал дохода</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>При 100 активных клиентах:</span>
                    <span className="font-medium">{calculatePotentialRevenue(currentValues.rate, currentValues.price).monthlyUpsells.toFixed(1)} продаж/мес</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Месячный доход:</span>
                    <span className="font-medium">${Math.round(calculatePotentialRevenue(currentValues.rate, currentValues.price).monthlyRevenue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium">
                    <span>Годовой доход:</span>
                    <span style={{ color: selectedProductData.color }}>
                      ${Math.round(calculatePotentialRevenue(currentValues.rate, currentValues.price).yearlyRevenue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Табличный режим */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Продукт</th>
                <th className="text-center py-3">% клиентов/мес</th>
                <th className="text-center py-3">Средний чек</th>
                <th className="text-right py-3">Потенциал/год</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const values = getCurrentValues(product.key);
                const potential = calculatePotentialRevenue(values.rate, values.price);
                
                return (
                  <tr key={product.key} className="border-b">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{product.icon}</span>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <EditableCell
                        value={values.rate}
                        onChange={values.setRate}
                        min={0}
                        max={10}
                        step={0.1}
                      />
                    </td>
                    <td className="text-center">
                      <EditableCell
                        value={values.price}
                        onChange={values.setPrice}
                        min={0}
                        max={1000}
                        formatCurrency
                      />
                    </td>
                    <td className="text-right font-medium" style={{ color: product.color }}>
                      ${Math.round(potential.yearlyRevenue).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-4 text-right font-medium">Общий потенциал Upsell:</td>
                <td className="py-4 text-right text-xl font-bold text-indigo-600">
                  ${Math.round(totalPotentialRevenue).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Инсайты и рекомендации */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Лучшие практики</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Начинайте с расширения сообщений - самый простой upsell</li>
            <li>• Новые функции лучше продавать после 3-6 месяцев использования</li>
            <li>• Интеграции востребованы у крупных клиентов</li>
          </ul>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">📈 Ваш потенциал</h4>
          <div className="text-xs text-green-700">
            <p>При текущих настройках и 100 активных клиентах:</p>
            <p className="mt-1 text-lg font-bold text-green-800">
              +${Math.round(totalPotentialRevenue / 12).toLocaleString()}/мес дополнительного дохода
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernUpsellEditor;