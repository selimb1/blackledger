import { generarExcelTransacciones } from '../../utils/excelGenerator';
import { Download } from 'lucide-react';

export function ExcelExportPanel({ transacciones, nombreArchivo, onLimpiar }) {
  if (transacciones.length === 0) return null;

  const totalDebitos = transacciones
    .filter(t => t.tipo_movimiento === 'Debito' && t.importe != null)
    .reduce((acc, t) => acc + t.importe, 0);

  const totalCreditos = transacciones
    .filter(t => t.tipo_movimiento === 'Credito' && t.importe != null)
    .reduce((acc, t) => acc + t.importe, 0);

  const saldoFinal = transacciones[transacciones.length - 1]?.saldo || 0;

  const handleDescargar = () => {
    generarExcelTransacciones(transacciones, nombreArchivo);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-col gap-1 text-[13px] text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{transacciones.length}</span> movimientos
          <span>·</span>
          <span className="text-danger-600 font-semibold">Débitos: {totalDebitos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
          <span>·</span>
          <span className="text-success-600 font-semibold">Créditos: {totalCreditos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
          <span>·</span>
          <span className="font-semibold text-gray-900">Saldo final: {saldoFinal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          Las imputaciones son sugeridas por IA. Verificá antes de contabilizar.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onLimpiar}
          className="px-4 py-2 text-sm font-medium text-danger-600 hover:text-danger-700 hover:bg-danger-50 rounded-lg transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={handleDescargar}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all"
        >
          <Download size={16} />
          Descargar Excel
        </button>
      </div>
    </div>
  );
}
