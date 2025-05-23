import React from 'react';
import { EditableCell, InfoTooltip, BulkInput } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Компонент для редактирования декомпозированного ФОТ
 */
const FOTEditorDecomposed: React.FC = () => {
  const {
    fotMode,
    setFotMode,
    fotDevelopmentOptimistic,
    setFotDevelopmentOptimistic,
    fotDevelopmentPessimistic,
    setFotDevelopmentPessimistic,
    fotSalesOptimistic,
    setFotSalesOptimistic,
    fotSalesPessimistic,
    setFotSalesPessimistic,
  } = useFinancialContext();

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const updateFotArray = (
    array: number[],
    setter: (values: number[]) => void,
    index: number,
    value: number
  ) => {
    const updated = [...array];
    updated[index] = value;
    setter(updated);
  };

  const currentDevelopmentFot = fotMode === 'optimistic' ? fotDevelopmentOptimistic : fotDevelopmentPessimistic;
  const currentSalesFot = fotMode === 'optimistic' ? fotSalesOptimistic : fotSalesPessimistic;
  const setCurrentDevelopmentFot = fotMode === 'optimistic' ? setFotDevelopmentOptimistic : setFotDevelopmentPessimistic;
  const setCurrentSalesFot = fotMode === 'optimistic' ? setFotSalesOptimistic : setFotSalesPessimistic;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-indigo-600 flex items-center">
          Декомпозированный ФОТ
          <InfoTooltip
            content="Фонд оплаты труда разделён на две категории: разработка (техническая команда) и продажи (отдел продаж, маркетинг)"
            position="right"
          />
        </h2>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              fotMode === 'optimistic'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            onClick={() => setFotMode('optimistic')}
          >
            Оптимистичный
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              fotMode === 'pessimistic'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            onClick={() => setFotMode('pessimistic')}
          >
            Пессимистичный
          </button>
        </div>
      </div>

      {/* ФОТ Разработки */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          ФОТ Разработки
          <InfoTooltip
            content="Расходы на техническую команду: разработчики, DevOps, тестировщики"
            position="right"
          />
        </h3>
        <BulkInput
          values={currentDevelopmentFot}
          onChange={setCurrentDevelopmentFot}
          placeholder="Введите 12 значений через пробел"
          className="mb-4"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {months.map((month, index) => (
            <div key={index}>
              <label className="block text-xs text-gray-500 mb-1">{month}</label>
              <EditableCell
                value={currentDevelopmentFot[index]}
                onChange={(value) => updateFotArray(currentDevelopmentFot, setCurrentDevelopmentFot, index, value)}
                min={0}
                formatCurrency
              />
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Итого за год: ${currentDevelopmentFot.reduce((sum, val) => sum + val, 0).toLocaleString('ru-RU')}
        </div>
      </div>

      {/* ФОТ Продаж */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          ФОТ Продаж
          <InfoTooltip
            content="Расходы на отдел продаж: менеджеры по продажам, маркетологи, поддержка клиентов"
            position="right"
          />
        </h3>
        <BulkInput
          values={currentSalesFot}
          onChange={setCurrentSalesFot}
          placeholder="Введите 12 значений через пробел"
          className="mb-4"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {months.map((month, index) => (
            <div key={index}>
              <label className="block text-xs text-gray-500 mb-1">{month}</label>
              <EditableCell
                value={currentSalesFot[index]}
                onChange={(value) => updateFotArray(currentSalesFot, setCurrentSalesFot, index, value)}
                min={0}
                formatCurrency
              />
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Итого за год: ${currentSalesFot.reduce((sum, val) => sum + val, 0).toLocaleString('ru-RU')}
        </div>
      </div>

      {/* Общая информация */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Общий ФОТ:</span>
          <span className="text-lg font-bold text-indigo-600">
            ${(currentDevelopmentFot.reduce((sum, val) => sum + val, 0) + 
               currentSalesFot.reduce((sum, val) => sum + val, 0)).toLocaleString('ru-RU')}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Разработка: {Math.round((currentDevelopmentFot.reduce((sum, val) => sum + val, 0) / 
            (currentDevelopmentFot.reduce((sum, val) => sum + val, 0) + 
             currentSalesFot.reduce((sum, val) => sum + val, 0))) * 100)}% | 
          Продажи: {Math.round((currentSalesFot.reduce((sum, val) => sum + val, 0) / 
            (currentDevelopmentFot.reduce((sum, val) => sum + val, 0) + 
             currentSalesFot.reduce((sum, val) => sum + val, 0))) * 100)}%
        </div>
      </div>
    </div>
  );
};

export default FOTEditorDecomposed;