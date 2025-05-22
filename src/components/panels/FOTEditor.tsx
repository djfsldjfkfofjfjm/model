import React from 'react';
import { EditableCell, InfoTooltip, MassEditPanel } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Интерфейс свойств компонента FOTEditor
 */
export interface FOTEditorProps {
  /** Заголовок редактора */
  title?: string;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Компонент для редактирования данных о ФОТ по месяцам
 */
const FOTEditor: React.FC<FOTEditorProps> = ({ 
  title = "ФОТ по месяцам",
  className = ""
}) => {
  const {
    fotOptimistic,
    setFotOptimistic,
    fotPessimistic,
    setFotPessimistic,
  } = useFinancialContext();

  // Вспомогательная функция для обновления массива ФОТ
  const updateFOTArray = (
    array: number[],
    setter: (values: number[]) => void,
    index: number,
    value: number
  ) => {
    const updated = [...array];
    updated[index] = value;
    setter(updated);
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border border-gray-100 ${className}`}>
      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
        {title}
        <InfoTooltip 
          text="Редактирование зарплат и затрат на персонал по месяцам. В оптимистичном и пессимистичном вариантах." 
          className="ml-2"
        />
      </h3>

      <div className="space-y-6">
        <MassEditPanel
          count={12}
          onApply={setFotOptimistic}
          currentValues={fotOptimistic}
          title="ФОТ - Оптимистичный сценарий"
          tooltip="Редактирование расходов на ФОТ (зарплаты) по месяцам в оптимистичном варианте развития"
          min={0}
          max={10000}
          step={100}
        />
        
        <MassEditPanel
          count={12}
          onApply={setFotPessimistic}
          currentValues={fotPessimistic}
          title="ФОТ - Пессимистичный сценарий"
          tooltip="Редактирование расходов на ФОТ (зарплаты) по месяцам в пессимистичном варианте развития"
          min={0}
          max={10000}
          step={100}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h4 className="text-sm font-medium text-indigo-700 mb-3">Оптимистичный вариант - Детализация</h4>
          <div className="overflow-y-auto max-h-72">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Месяц
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма, $
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                  <tr key={month} className={month % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Месяц {month + 1}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <EditableCell 
                        value={fotOptimistic[month]} 
                        onChange={(value) => updateFOTArray(fotOptimistic, setFotOptimistic, month, value)}
                        min={0}
                        max={10000}
                        step={100}
                        data-testid={`fot-optimistic-month-${month}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-rose-700 mb-3">Пессимистичный вариант - Детализация</h4>
          <div className="overflow-y-auto max-h-72">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Месяц
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма, $
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                  <tr key={month} className={month % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Месяц {month + 1}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <EditableCell 
                        value={fotPessimistic[month]} 
                        onChange={(value) => updateFOTArray(fotPessimistic, setFotPessimistic, month, value)}
                        min={0}
                        max={10000}
                        step={100}
                        data-testid={`fot-pessimistic-month-${month}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FOTEditor;
