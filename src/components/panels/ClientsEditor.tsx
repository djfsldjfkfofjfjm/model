import React from 'react';
import { EditableCell, InfoTooltip, BulkInput } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Интерфейс свойств компонента ClientsEditor
 */
export interface ClientsEditorProps {
  /** Заголовок редактора */
  title?: string;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Компонент для редактирования данных о новых клиентах по месяцам
 */
const ClientsEditor: React.FC<ClientsEditorProps> = ({ 
  title = "Новые клиенты по месяцам",
  className = ""
}) => {
  const {
    newClients75,
    setNewClients75,
    newClients150,
    setNewClients150,
    newClients250,
    setNewClients250,
    newClients500,
    setNewClients500,
    newClients1000,
    setNewClients1000
  } = useFinancialContext();
  // Вспомогательная функция для обновления массива клиентов
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

  return (
    <div className={`bg-white p-6 rounded-2xl border border-gray-100 ${className}`}>
      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
        {title}
        <InfoTooltip 
          text="Редактирование количества новых клиентов по каждому тарифу в разрезе месяцев" 
          className="ml-2"
        />
      </h3>

      {/* Кнопки для массового ввода значений по каждому тарифу */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
        <BulkInput
          count={12}
          onApply={(values) => {
            const updated = [...newClients75];
            values.forEach((v, i) => {
              if (i < updated.length) updated[i] = v;
            });
            setNewClients75(updated);
          }}
          title="$75"
        />
        <BulkInput
          count={12}
          onApply={(values) => {
            const updated = [...newClients150];
            values.forEach((v, i) => {
              if (i < updated.length) updated[i] = v;
            });
            setNewClients150(updated);
          }}
          title="$150"
        />
        <BulkInput
          count={12}
          onApply={(values) => {
            const updated = [...newClients250];
            values.forEach((v, i) => {
              if (i < updated.length) updated[i] = v;
            });
            setNewClients250(updated);
          }}
          title="$250"
        />
        <BulkInput
          count={12}
          onApply={(values) => {
            const updated = [...newClients500];
            values.forEach((v, i) => {
              if (i < updated.length) updated[i] = v;
            });
            setNewClients500(updated);
          }}
          title="$500"
        />
        <BulkInput
          count={12}
          onApply={(values) => {
            const updated = [...newClients1000];
            values.forEach((v, i) => {
              if (i < updated.length) updated[i] = v;
            });
            setNewClients1000(updated);
          }}
          title="$1000"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Месяц
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                $75 <span className="font-normal">(API-only)</span>
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                $150 <span className="font-normal">(Базовый)</span>
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                $250 <span className="font-normal">(Стандарт)</span>
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                $500 <span className="font-normal">(Премиум)</span>
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                $1000 <span className="font-normal">(Корпорат.)</span>
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
                    value={newClients75[month]} 
                    onChange={(value) => updateClientArray(newClients75, setNewClients75, month, value)}
                    min={0}
                    max={100}
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <EditableCell 
                    value={newClients150[month]} 
                    onChange={(value) => updateClientArray(newClients150, setNewClients150, month, value)}
                    min={0}
                    max={100}
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <EditableCell 
                    value={newClients250[month]} 
                    onChange={(value) => updateClientArray(newClients250, setNewClients250, month, value)}
                    min={0}
                    max={100}
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <EditableCell 
                    value={newClients500[month]} 
                    onChange={(value) => updateClientArray(newClients500, setNewClients500, month, value)}
                    min={0}
                    max={100}
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <EditableCell 
                    value={newClients1000[month]} 
                    onChange={(value) => updateClientArray(newClients1000, setNewClients1000, month, value)}
                    min={0}
                    max={100}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsEditor;