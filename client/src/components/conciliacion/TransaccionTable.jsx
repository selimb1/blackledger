import { TransaccionRow } from './TransaccionRow';

export function TransaccionTable({ transacciones, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-5 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-5 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Detalle</th>
              <th className="px-5 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Importe</th>
              <th className="px-5 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Saldo</th>
              <th className="px-5 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-5 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Fuente</th>
              <th className="px-5 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Imputación</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((t, idx) => (
              <TransaccionRow 
                key={`${t.fecha}-${idx}`} 
                item={t} 
                index={idx} 
                onChange={onChange} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
