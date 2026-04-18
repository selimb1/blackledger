import { Trash2, ChevronDown } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { validarComprobante, validarCUIT } from '../utils/validators';

const TIPOS = [
  'FACTURA_A','FACTURA_B','FACTURA_C',
  'NOTA_DEBITO_A','NOTA_DEBITO_B',
  'NOTA_CREDITO_A','NOTA_CREDITO_B',
  'TICKET','RECIBO'
];

const COND_FISCAL = ['RI','M','CF','EX','NR'];

export function ComprobanteRow({ item, onChange, onEliminar }) {
  if (!item.datos) {
    // Fila de error
    return (
      <tr className="bg-red-50 border-b border-red-100">
        <td className="px-3 py-2">
          <span className="text-xs text-red-500 font-medium truncate block max-w-xs" title={item.nombre_archivo}>
            {item.nombre_archivo}
          </span>
        </td>
        <td colSpan={9} className="px-3 py-2 text-xs text-red-600">{item.error}</td>
        <td className="px-3 py-2 text-center">
          <button onClick={onEliminar} className="text-red-400 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </td>
      </tr>
    );
  }

  const errores = validarComprobante(item.datos);
  const cuitValido = !item.datos.cuit_emisor || item.datos.cuit_emisor === '00000000000' || validarCUIT(item.datos.cuit_emisor);

  const update = (campo, valor) => onChange({ ...item, datos: { ...item.datos, [campo]: valor } });

  const inputClass = "w-full text-xs bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none py-0.5 px-0";
  const montoClass = "w-full text-xs text-right bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none py-0.5 px-0 font-mono";

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 ${!item.habilitado ? 'opacity-40' : ''}`}>

      {/* Checkbox habilitado */}
      <td className="px-2 py-1.5 text-center">
        <input
          type="checkbox"
          checked={item.habilitado !== false}
          onChange={e => onChange({ ...item, habilitado: e.target.checked })}
          className="accent-green-500"
        />
      </td>

      {/* Archivo */}
      <td className="px-3 py-1.5 max-w-[120px]">
        <span className="text-xs text-gray-400 truncate block" title={item.nombre_archivo}>
          {item.nombre_archivo}
        </span>
        <StatusBadge estado={item.estado} errores={errores} />
      </td>

      {/* Tipo */}
      <td className="px-2 py-1.5">
        <select
          value={item.datos.tipo_comprobante || ''}
          onChange={e => update('tipo_comprobante', e.target.value)}
          className="text-xs bg-transparent border-b border-gray-200 focus:border-green-500 focus:outline-none w-full"
        >
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>

      {/* PV */}
      <td className="px-2 py-1.5 w-16">
        <input
          type="text"
          value={item.datos.punto_de_venta || ''}
          onChange={e => update('punto_de_venta', e.target.value)}
          className={inputClass}
          placeholder="0001"
          maxLength={4}
        />
      </td>

      {/* Nro comprobante */}
      <td className="px-2 py-1.5 w-24">
        <input
          type="text"
          value={item.datos.numero_comprobante || ''}
          onChange={e => update('numero_comprobante', e.target.value)}
          className={inputClass}
          placeholder="00000001"
          maxLength={8}
        />
      </td>

      {/* Fecha */}
      <td className="px-2 py-1.5 w-24">
        <input
          type="text"
          value={item.datos.fecha || ''}
          onChange={e => update('fecha', e.target.value)}
          className={`${inputClass} ${!validarFecha(item.datos.fecha) ? 'text-red-500' : ''}`}
          placeholder="DD/MM/YYYY"
          maxLength={10}
        />
      </td>

      {/* Cond. Fiscal */}
      <td className="px-2 py-1.5 w-16">
        <select
          value={item.datos.condicion_fiscal_emisor || 'CF'}
          onChange={e => update('condicion_fiscal_emisor', e.target.value)}
          className="text-xs bg-transparent border-b border-gray-200 focus:border-green-500 focus:outline-none w-full"
        >
          {COND_FISCAL.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>

      {/* CUIT */}
      <td className="px-2 py-1.5 w-28">
        <input
          type="text"
          value={item.datos.cuit_emisor || ''}
          onChange={e => update('cuit_emisor', e.target.value.replace(/\D/g, '').substring(0, 11))}
          className={`${inputClass} ${!cuitValido ? 'text-red-500' : ''}`}
          placeholder="20271234567"
          maxLength={11}
          title={!cuitValido ? 'CUIT inválido' : ''}
        />
      </td>

      {/* Razón Social */}
      <td className="px-2 py-1.5 min-w-[140px]">
        <input
          type="text"
          value={item.datos.razon_social_emisor || ''}
          onChange={e => update('razon_social_emisor', e.target.value.toUpperCase())}
          className={inputClass}
          placeholder="RAZÓN SOCIAL SA"
          maxLength={40}
        />
      </td>

      {/* Total */}
      <td className="px-2 py-1.5 w-24">
        <input
          type="number"
          value={item.datos.total || 0}
          onChange={e => update('total', parseFloat(e.target.value) || 0)}
          className={montoClass}
          step="0.01"
          min="0"
        />
      </td>

      {/* Eliminar */}
      <td className="px-2 py-1.5 text-center">
        <button onClick={onEliminar} className="text-gray-300 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

function validarFecha(fecha) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(fecha || '');
}
