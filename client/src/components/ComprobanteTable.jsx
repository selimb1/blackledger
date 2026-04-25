import { ComprobanteRow } from './ComprobanteRow';

export function ComprobanteTable({ items, onChange, onEliminar, tipoLibro }) {
  if (!items.length) return null;

  const headers = [
    { label: '', align: 'text-center' },
    { label: 'Archivo', align: 'text-left' },
    { label: 'Tipo', align: 'text-left' },
    { label: 'PV', align: 'text-left' },
    { label: 'Nro. Comp.', align: 'text-right' },
    { label: 'Fecha', align: 'text-left' },
    { label: 'CF', align: 'text-left' },
    { label: 'CUIT', align: 'text-left' },
    { label: 'Razón Social', align: 'text-left' },
    { label: 'Total', align: 'text-right' },
    { label: '', align: 'text-center' }
  ];

  const esVentas = tipoLibro === 'VENTAS';
  const colorTexto = esVentas ? 'var(--color-success-700)' : 'var(--color-brand-500)';
  const colorFondo = esVentas ? 'var(--color-success-50)' : 'var(--color-brand-50)';

  return (
    <div
      className="overflow-x-auto"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Barra de contexto — tipo de libro */}
      {tipoLibro && (
        <div style={{
          padding: '8px 16px',
          background: colorFondo,
          borderBottom: '1px solid var(--color-gray-200)',
          fontSize: '12px',
          fontWeight: '600',
          color: colorTexto,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        }}>
          {esVentas ? '📤' : '📥'}
          {esVentas ? 'Libro IVA Ventas' : 'Libro IVA Compras'}
          <span style={{ fontWeight: '400', color: 'var(--color-gray-400)', marginLeft: '4px' }}>
            — estos comprobantes se importarán en este libro de Holistor
          </span>
        </div>
      )}

      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
            {headers.map((h, i) => (
              <th
                key={i}
                className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] border-b ${h.align}`}
                style={{ color: 'var(--color-gray-500)', borderColor: 'var(--color-gray-300)' }}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <ComprobanteRow
              key={item.id}
              item={item}
              index={idx}
              onChange={(updated) => onChange(idx, updated)}
              onEliminar={() => onEliminar(idx)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
