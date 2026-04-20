import { Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { validarComprobante, validarCUIT } from '../utils/validators';

const TIPOS = [
  'FACTURA_A','FACTURA_B','FACTURA_C',
  'NOTA_DEBITO_A','NOTA_DEBITO_B',
  'NOTA_CREDITO_A','NOTA_CREDITO_B',
  'TICKET','RECIBO'
];

const COND_FISCAL = ['RI','M','CF','EX','NR'];

const badgeStyles = {
  FACTURA_A: { bg: 'var(--color-brand-100)', color: 'var(--color-brand-700)' },
  FACTURA_B: { bg: '#e0e7ff', color: '#3730a3' },
  FACTURA_C: { bg: '#fce7f3', color: '#9d174d' },
  TICKET: { bg: 'var(--color-gray-100)', color: 'var(--color-gray-700)' },
  RECIBO: { bg: 'var(--color-gray-100)', color: 'var(--color-gray-700)' },
};

function getBadgeStyle(tipo) {
  if (!tipo) return { bg: 'transparent', color: 'inherit' };
  if (tipo.includes('DEBITO')) return { bg: 'var(--color-warning-100)', color: 'var(--color-warning-600)' };
  if (tipo.includes('CREDITO')) return { bg: 'var(--color-success-100)', color: 'var(--color-success-700)' };
  return badgeStyles[tipo] || badgeStyles.TICKET;
}

export function ComprobanteRow({ item, index = 0, onChange, onEliminar }) {
  const rowDelay = index * 40;
  const asStriped = index % 2 === 0 ? 'var(--color-surface)' : 'var(--color-gray-50)';

  if (!item.datos) {
    // Fila de error
    return (
      <tr 
        className="fade-in-up group hover:!bg-[var(--color-brand-50)] transition-colors h-[48px]"
        style={{ animationDelay: `${rowDelay}ms`, backgroundColor: asStriped, borderBottom: '1px solid var(--color-gray-100)' }}
      >
        <td className="px-3 py-2">
          <span className="text-[13px] font-medium truncate block max-w-[140px]" style={{ color: 'var(--color-danger-600)' }} title={item.nombre_archivo}>
            {item.nombre_archivo}
          </span>
        </td>
        <td colSpan={9} className="px-3 py-2 text-[13px]" style={{ color: 'var(--color-danger-600)' }}>{item.error}</td>
        <td className="px-3 py-2 text-center">
          <button onClick={onEliminar} className="opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--color-danger-600)' }}>
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </td>
      </tr>
    );
  }

  const errores = validarComprobante(item.datos);
  const cuitValido = !item.datos.cuit_emisor || item.datos.cuit_emisor === '00000000000' || validarCUIT(item.datos.cuit_emisor);

  const update = (campo, valor) => onChange({ ...item, datos: { ...item.datos, [campo]: valor } });

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid transparent',
    color: 'inherit',
    outline: 'none',
    width: '100%',
    padding: '4px 0',
  };
  
  const baseInputClass = "text-[13px] font-medium placeholder-[var(--color-gray-500)] focus:border-[var(--color-brand-500)] focus:border-b-2 hover:border-[var(--color-gray-300)] transition-colors";
  const monoInputClass = "text-[13px] font-mono-custom font-medium placeholder-[var(--color-gray-500)] focus:border-[var(--color-brand-500)] focus:border-b-2 hover:border-[var(--color-gray-300)] transition-colors";

  const currBadge = getBadgeStyle(item.datos.tipo_comprobante);

  return (
    <tr 
      className={`fade-in-up group hover:!bg-[var(--color-brand-50)] transition-colors h-[48px] ${!item.habilitado ? 'opacity-50' : ''}`}
      style={{ animationDelay: `${rowDelay}ms`, backgroundColor: asStriped, borderBottom: '1px solid var(--color-gray-100)' }}
    >
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={item.habilitado !== false}
          onChange={e => onChange({ ...item, habilitado: e.target.checked })}
          className="checkbox-custom"
        />
      </td>

      <td className="px-3 py-2 max-w-[140px]">
        <span className="text-[13px] font-medium truncate block" style={{ color: 'var(--color-gray-700)' }} title={item.nombre_archivo}>
          {item.nombre_archivo}
        </span>
        <StatusBadge estado={item.estado} errores={errores} />
      </td>

      <td className="px-3 py-2">
        <div 
          className="relative rounded-md px-1"
          style={{ backgroundColor: currBadge.bg, color: currBadge.color }}
        >
          <select
            value={item.datos.tipo_comprobante || ''}
            onChange={e => update('tipo_comprobante', e.target.value)}
            className={`${baseInputClass} w-full`}
            style={{ ...inputStyle, padding: '2px 4px', appearance: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
          >
            {TIPOS.map(t => <option key={t} value={t} style={{ color: 'var(--color-gray-900)' }}>{t}</option>)}
          </select>
        </div>
      </td>

      <td className="px-3 py-2 w-16">
        <input
          type="text"
          value={item.datos.punto_de_venta || ''}
          onChange={e => update('punto_de_venta', e.target.value)}
          className={monoInputClass}
          style={{ ...inputStyle, color: 'var(--color-gray-900)' }}
          placeholder="0001"
          maxLength={4}
        />
      </td>

      <td className="px-3 py-2 w-28">
        <input
          type="text"
          value={item.datos.numero_comprobante || ''}
          onChange={e => update('numero_comprobante', e.target.value)}
          className={`${monoInputClass} text-right`}
          style={{ ...inputStyle, color: 'var(--color-gray-900)' }}
          placeholder="00000001"
          maxLength={8}
        />
      </td>

      <td className="px-3 py-2 w-28">
        <input
          type="text"
          value={item.datos.fecha || ''}
          onChange={e => update('fecha', e.target.value)}
          className={`${monoInputClass} ${!validarFecha(item.datos.fecha) ? '!text-[var(--color-danger-600)]' : '!text-[var(--color-gray-700)]'}`}
          style={{ ...inputStyle }}
          placeholder="DD/MM/YYYY"
          maxLength={10}
        />
      </td>

      <td className="px-3 py-2 w-16">
        <select
          value={item.datos.condicion_fiscal_emisor || 'CF'}
          onChange={e => update('condicion_fiscal_emisor', e.target.value)}
          className={baseInputClass}
          style={{ ...inputStyle, color: 'var(--color-gray-900)', appearance: 'none' }}
        >
          {COND_FISCAL.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>

      <td className="px-3 py-2 w-32 relative">
        {!cuitValido && <span className="absolute left-1 mt-1 text-[12px] text-[var(--color-danger-600)]">⚠</span>}
        <input
          type="text"
          value={item.datos.cuit_emisor || ''}
          onChange={e => update('cuit_emisor', e.target.value.replace(/\D/g, '').substring(0, 11))}
          className={`${monoInputClass} ${!cuitValido ? '!text-[var(--color-danger-600)] pl-4' : '!text-[var(--color-gray-900)]'}`}
          style={inputStyle}
          placeholder="20271234567"
          maxLength={11}
          title={!cuitValido ? 'CUIT inválido' : ''}
        />
      </td>

      <td className="px-3 py-2 min-w-[160px]">
        <input
          type="text"
          value={item.datos.razon_social_emisor || ''}
          onChange={e => update('razon_social_emisor', e.target.value.toUpperCase())}
          className={baseInputClass}
          style={{ ...inputStyle, color: 'var(--color-gray-900)' }}
          placeholder="RAZÓN SOCIAL SA"
          maxLength={40}
        />
      </td>

      <td className="px-3 py-2 w-[110px]">
        <div className="flex items-center justify-end">
          <span className="text-[14px] font-mono-custom text-[var(--color-gray-500)] mr-1">$</span>
          <input
            type="number"
            value={item.datos.total || ''}
            onChange={e => update('total', parseFloat(e.target.value) || 0)}
            className={`${monoInputClass} text-right`}
            style={{ ...inputStyle, color: 'var(--color-gray-900)', fontSize: '14px' }}
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>
      </td>

      <td className="px-3 py-2 text-center">
        <button 
          onClick={onEliminar} 
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity" 
          style={{ color: 'var(--color-danger-600)' }}
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
      </td>
    </tr>
  );
}

function validarFecha(fecha) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(fecha || '');
}
