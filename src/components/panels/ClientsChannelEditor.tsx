import React, { useState } from 'react';
import { EditableCell, InfoTooltip } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Компонент для редактирования распределения клиентов по каналам
 */
const ClientsChannelEditor: React.FC = () => {
  const {
    // Прямые продажи
    newClients75Direct, setNewClients75Direct,
    newClients150Direct, setNewClients150Direct,
    newClients250Direct, setNewClients250Direct,
    newClients500Direct, setNewClients500Direct,
    newClients1000Direct, setNewClients1000Direct,
    // Партнёры
    newClients75Partner, setNewClients75Partner,
    newClients150Partner, setNewClients150Partner,
    newClients250Partner, setNewClients250Partner,
    newClients500Partner, setNewClients500Partner,
    newClients1000Partner, setNewClients1000Partner,
  } = useFinancialContext();

  const [selectedTariff, setSelectedTariff] = useState<number>(150);

  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  
  const tariffs = [
    { value: 75, label: '$75' },
    { value: 150, label: '$150' },
    { value: 250, label: '$250' },
    { value: 500, label: '$500' },
    { value: 1000, label: '$1000' },
  ];

  const getChannelData = (tariff: number) => {
    switch (tariff) {
      case 75: return { direct: newClients75Direct, partner: newClients75Partner };
      case 150: return { direct: newClients150Direct, partner: newClients150Partner };
      case 250: return { direct: newClients250Direct, partner: newClients250Partner };
      case 500: return { direct: newClients500Direct, partner: newClients500Partner };
      case 1000: return { direct: newClients1000Direct, partner: newClients1000Partner };
      default: return { direct: [], partner: [] };
    }
  };

  const getSetters = (tariff: number) => {
    switch (tariff) {
      case 75: return { setDirect: setNewClients75Direct, setPartner: setNewClients75Partner };
      case 150: return { setDirect: setNewClients150Direct, setPartner: setNewClients150Partner };
      case 250: return { setDirect: setNewClients250Direct, setPartner: setNewClients250Partner };
      case 500: return { setDirect: setNewClients500Direct, setPartner: setNewClients500Partner };
      case 1000: return { setDirect: setNewClients1000Direct, setPartner: setNewClients1000Partner };
      default: return { setDirect: () => {}, setPartner: () => {} };
    }
  };

  const updateClientArray = (
    array: number[],
    setter: (clients: number[]) => void,
    index: number,
    value: number
  ) => {
    const updated = [...array];
    updated[index] = value;
    setter(updated);
  };

  const currentData = getChannelData(selectedTariff);
  const currentSetters = getSetters(selectedTariff);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-indigo-600 flex items-center">
          Распределение клиентов по каналам
          <InfoTooltip
            content="Укажите, сколько клиентов приходит через прямые продажи и через партнёров для каждого тарифа"
            position="right"
          />
        </h2>
      </div>

      {/* Выбор тарифа */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Выберите тариф</label>
        <div className="flex space-x-2">
          {tariffs.map((tariff) => (
            <button
              key={tariff.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTariff === tariff.value
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setSelectedTariff(tariff.value)}
            >
              {tariff.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Прямые продажи */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 mb-3 flex items-center">
            Прямые продажи
            <InfoTooltip
              content="Клиенты, привлечённые через собственный отдел продаж"
              position="right"
            />
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {months.map((month, index) => (
              <div key={index}>
                <label className="block text-xs text-gray-600 mb-1">{month}</label>
                <EditableCell
                  value={currentData.direct[index]}
                  onChange={(value) => updateClientArray(
                    currentData.direct,
                    currentSetters.setDirect,
                    index,
                    value
                  )}
                  min={0}
                  step={1}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-blue-700">
            Итого: {currentData.direct.reduce((sum, val) => sum + val, 0)} клиентов
          </div>
        </div>

        {/* Партнёрский канал */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-green-800 mb-3 flex items-center">
            Партнёрская программа
            <InfoTooltip
              content="Клиенты, привлечённые через партнёров"
              position="right"
            />
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {months.map((month, index) => (
              <div key={index}>
                <label className="block text-xs text-gray-600 mb-1">{month}</label>
                <EditableCell
                  value={currentData.partner[index]}
                  onChange={(value) => updateClientArray(
                    currentData.partner,
                    currentSetters.setPartner,
                    index,
                    value
                  )}
                  min={0}
                  step={1}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-green-700">
            Итого: {currentData.partner.reduce((sum, val) => sum + val, 0)} клиентов
          </div>
        </div>
      </div>

      {/* Сводка по тарифу */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Сводка по тарифу ${selectedTariff}
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Всего клиентов:</span>
            <p className="text-lg font-bold text-gray-800">
              {currentData.direct.reduce((sum, val) => sum + val, 0) + 
               currentData.partner.reduce((sum, val) => sum + val, 0)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Прямые продажи:</span>
            <p className="text-lg font-bold text-blue-600">
              {Math.round((currentData.direct.reduce((sum, val) => sum + val, 0) / 
                (currentData.direct.reduce((sum, val) => sum + val, 0) + 
                 currentData.partner.reduce((sum, val) => sum + val, 0)) || 0) * 100)}%
            </p>
          </div>
          <div>
            <span className="text-gray-600">Партнёры:</span>
            <p className="text-lg font-bold text-green-600">
              {Math.round((currentData.partner.reduce((sum, val) => sum + val, 0) / 
                (currentData.direct.reduce((sum, val) => sum + val, 0) + 
                 currentData.partner.reduce((sum, val) => sum + val, 0)) || 0) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsChannelEditor;