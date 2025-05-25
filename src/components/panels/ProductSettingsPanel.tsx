import React from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import EditableCell from '../common/EditableCell';
import InfoTooltip from '../common/InfoTooltip';
import MessageUsageFixPanel from './MessageUsageFixPanel';
import DiagnosticPanel from './DiagnosticPanel';
import MessageSystemDiagnostic from './MessageSystemDiagnostic';

const ProductSettingsPanel: React.FC = () => {
  const {
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
    messageUsagePercentage,
    setMessageUsagePercentage,
    unusedMessagesCarryOver,
    setUnusedMessagesCarryOver,
    additionalMessagePrice,
    setAdditionalMessagePrice,
    integrationPrice,
    setIntegrationPrice,
    maxImplementationCost,
    setMaxImplementationCost,
  } = useFinancialContext();

  const tariffs = [
    {
      name: 'API-only',
      price: subscriptionPrice75,
      setPrice: setSubscriptionPrice75,
      messages: messages75,
      setMessages: setMessages75,
      color: 'purple',
      description: 'Базовый доступ к API'
    },
    {
      name: 'Базовый',
      price: subscriptionPrice150,
      setPrice: setSubscriptionPrice150,
      messages: messages150,
      setMessages: setMessages150,
      color: 'blue',
      description: 'Для небольших проектов'
    },
    {
      name: 'Стандарт',
      price: subscriptionPrice250,
      setPrice: setSubscriptionPrice250,
      messages: messages250,
      setMessages: setMessages250,
      color: 'green',
      description: 'Оптимальный выбор'
    },
    {
      name: 'Премиум',
      price: subscriptionPrice500,
      setPrice: setSubscriptionPrice500,
      messages: messages500,
      setMessages: setMessages500,
      color: 'orange',
      description: 'Расширенные возможности'
    },
    {
      name: 'Корпоративный',
      price: subscriptionPrice1000,
      setPrice: setSubscriptionPrice1000,
      messages: messages1000,
      setMessages: setMessages1000,
      color: 'red',
      description: 'Максимальные возможности'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Тарифные планы */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          Тарифные планы
          <InfoTooltip text="Настройте цены подписок и пакеты сообщений для каждого тарифа" />
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Тариф</th>
                <th className="text-center py-3 px-4">Цена/мес</th>
                <th className="text-center py-3 px-4">Сообщений</th>
                <th className="text-center py-3 px-4">$/сообщение</th>
              </tr>
            </thead>
            <tbody>
              {tariffs.map((tariff, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className={`font-medium text-${tariff.color}-600`}>{tariff.name}</div>
                      <div className="text-sm text-gray-500">{tariff.description}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <EditableCell
                      value={tariff.price}
                      onChange={tariff.setPrice}
                      min={0}
                      max={10000}
                      prefix="$"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <EditableCell
                      value={tariff.messages}
                      onChange={tariff.setMessages}
                      min={0}
                      max={10000}
                    />
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    ${(tariff.price / tariff.messages).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Настройки сообщений */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          Система сообщений
          <InfoTooltip text="Настройте параметры использования и переноса сообщений" />
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Использование сообщений
              <InfoTooltip text="Средний процент использования включенных сообщений" />
            </label>
            <div className="flex items-center gap-3">
              <EditableCell
                value={messageUsagePercentage}
                onChange={(value) => {
                  console.log('🔄 Изменение % использования сообщений:', value);
                  setMessageUsagePercentage(value);
                }}
                min={0}
                max={100}
                suffix="%"
              />
              <span className="text-gray-600"></span>
            </div>
            <p className="text-xs text-gray-500 mt-1">от доступного пакета</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Перенос неиспользованных
              <InfoTooltip text="Процент неиспользованных сообщений, переносимых на следующий месяц" />
            </label>
            <div className="flex items-center gap-3">
              <EditableCell
                value={unusedMessagesCarryOver}
                onChange={(value) => {
                  console.log('🔄 Изменение % переноса сообщений:', value);
                  setUnusedMessagesCarryOver(value);
                }}
                min={0}
                max={100}
                suffix="%"
              />
              <span className="text-gray-600"></span>
            </div>
            <p className="text-xs text-gray-500 mt-1">на следующий месяц</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена доп. сообщения
              <InfoTooltip text="Стоимость одного сообщения сверх пакета" />
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">$</span>
              <EditableCell
                value={additionalMessagePrice}
                onChange={(value) => {
                  console.log('🔄 Изменение цены доп. сообщений:', value);
                  setAdditionalMessagePrice(value);
                }}
                min={0}
                max={10}
                step={0.01}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">за сообщение сверх лимита</p>
          </div>
        </div>
      </div>

      {/* Настройки интеграции */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          Интеграция и внедрение
          <InfoTooltip text="Настройки единоразовых платежей за подключение" />
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Стоимость интеграции
              <InfoTooltip text="Единоразовая плата за настройку бота для клиента" />
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">$</span>
              <EditableCell
                value={integrationPrice}
                onChange={setIntegrationPrice}
                min={0}
                max={10000}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">единоразово при подключении</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Макс. стоимость внедрения
              <InfoTooltip text="Максимальная сумма расходов на внедрение одного клиента" />
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">$</span>
              <EditableCell
                value={maxImplementationCost}
                onChange={setMaxImplementationCost}
                min={0}
                max={1000}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">20% от стоимости интеграции</p>
          </div>
        </div>
      </div>
      
      {/* Диагностика системы сообщений */}
      <MessageSystemDiagnostic />
    </div>
  );
};

export default ProductSettingsPanel;