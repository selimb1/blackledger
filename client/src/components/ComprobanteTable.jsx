import { ComprobanteRow } from './ComprobanteRow';

export function ComprobanteTable({ items, onChange, onEliminar }) {
  if (!items.length) return null;

  const headers = [
    '', '         Archivo', 'Tipo', 'PV', 'Nro. Comp.', 'Fecha',
    'CF', 'CUIT', 'Razón Social', 'Total', ''
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((h, i) => (
              <th key={i} className="px-2 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <ComprobanteRow
              key={item.id}
              item={item}
              onChange={(updated) => onChange(idx, updated)}
              onEliminar={() => onEliminar(idx)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
