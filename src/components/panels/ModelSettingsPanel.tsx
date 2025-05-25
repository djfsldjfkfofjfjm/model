import React from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import QuickModelPresets from '../common/QuickModelPresets';
import EditableCell from '../common/EditableCell';
import InfoTooltip from '../common/InfoTooltip';
import { TaxMode, FOTMode } from '../../types/FinancialTypes';

const ModelSettingsPanel: React.FC = () => {
  const {
    taxMode,
    setTaxMode,
    customTaxRate,
    setCustomTaxRate,
    fotMode,
    setFotMode,
  } = useFinancialContext();

  return (
    <div className="space-y-6">
      {/* Быстрые пресеты - перемещены с дашборда */}
      <QuickModelPresets />

      {/* Базовые настройки модели */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          Базовые параметры модели
          <InfoTooltip text="Основные настройки, влияющие на все расчёты в модели" />
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Налоговый режим */}
          <div>
            <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
              Налоговый режим
              <InfoTooltip text="Выберите режим налогообложения для расчёта чистой прибыли" />
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="taxMode"
                  value="optimistic"
                  checked={taxMode === 'optimistic'}
                  onChange={() => setTaxMode('optimistic' as TaxMode)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium">Оптимистичный (ПВТ)</div>
                  <div className="text-sm text-gray-500">9% от прибыли</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="taxMode"
                  value="pessimistic"
                  checked={taxMode === 'pessimistic'}
                  onChange={() => setTaxMode('pessimistic' as TaxMode)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium">Пессимистичный</div>
                  <div className="text-sm text-gray-500">35% от выручки минус расходы</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="taxMode"
                  value="custom"
                  checked={taxMode === 'custom'}
                  onChange={() => setTaxMode('custom' as TaxMode)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">Своя ставка</div>
                    <div className="text-sm text-gray-500">% от прибыли</div>
                  </div>
                  {taxMode === 'custom' && (
                    <EditableCell
                      value={customTaxRate}
                      onChange={setCustomTaxRate}
                      min={0}
                      max={100}
                      className="w-20"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Режим ФОТ */}
          <div>
            <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
              Режим расчёта ФОТ
              <InfoTooltip text="Выберите сценарий для расчёта фонда оплаты труда" />
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="fotMode"
                  value="optimistic"
                  checked={fotMode === 'optimistic'}
                  onChange={() => setFotMode('optimistic' as FOTMode)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium">Оптимистичный</div>
                  <div className="text-sm text-gray-500">Минимальные расходы на персонал</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="fotMode"
                  value="pessimistic"
                  checked={fotMode === 'pessimistic'}
                  onChange={() => setFotMode('pessimistic' as FOTMode)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium">Пессимистичный</div>
                  <div className="text-sm text-gray-500">Консервативные расходы на персонал</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Дополнительные настройки */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-base font-medium text-gray-700 mb-4 flex items-center gap-2">
            Региональные настройки
            <InfoTooltip text="Настройки валюты и формата отображения" />
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Валюта</label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">USD ($)</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Формат чисел</label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">1 000 000</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Период моделирования</label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">12 месяцев</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSettingsPanel;