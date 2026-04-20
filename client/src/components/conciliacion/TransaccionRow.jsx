export function TransaccionRow({ item, index, onChange }) {
  const isDebito = item.tipo_movimiento === 'Debito';
  const importeColor = isDebito ? 'var(--color-danger-600)' : 'var(--color-success-700)';

  const handleImputacionChange = (e) => {
    onChange(index, { ...item, imputacion: e.target.value });
  };

  const imputaciones = [
    "Deudores por Ventas", "Proveedores", "Intereses cobrados", "Gastos bancarios",
    "Impuestos y tasas", "Remuneraciones", "Gastos de servicios", "Gastos de alquiler",
    "Caja", "Disponibilidades", "Otras cuentas"
  ];
  
  // Ensure the suggested imputacion is in the list, otherwise add it
  if (item.imputacion && !imputaciones.includes(item.imputacion)) {
    imputaciones.push(item.imputacion);
  }

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0 align-middle">
      <td className="px-5 py-3 whitespace-nowrap text-[13px] text-gray-500 font-medium">
        {item.fecha}
      </td>
      <td className="px-5 py-3 text-[13px] text-gray-900 font-medium max-w-[200px] truncate" title={item.descripcion}>
        {item.descripcion}
      </td>
      <td className="px-5 py-3 text-[12px] text-gray-500 max-w-[200px] truncate" title={item.detalle}>
        {item.detalle}
      </td>
      <td className="px-5 py-3 whitespace-nowrap text-[13px] font-mono text-right" style={{ color: importeColor }}>
        {item.importe != null ? item.importe.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
      </td>
      <td className="px-5 py-3 whitespace-nowrap text-[13px] font-mono text-gray-900 text-right">
        {item.saldo != null ? item.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
      </td>
      <td className="px-5 py-3 whitespace-nowrap">
        <span 
          className="px-2 py-0.5 rounded-full text-[11px] font-bold"
          style={{
            backgroundColor: isDebito ? 'var(--color-danger-100)' : 'var(--color-success-100)',
            color: isDebito ? 'var(--color-danger-700)' : 'var(--color-success-700)'
          }}
        >
          {item.tipo_movimiento}
        </span>
      </td>
      <td className="px-5 py-3 whitespace-nowrap text-[11px] text-gray-400 max-w-[120px] truncate" title={item.fuente}>
        {item.fuente}
      </td>
      <td className="px-5 py-3">
        <select 
          value={item.imputacion || 'Otras cuentas'} 
          onChange={handleImputacionChange}
          className="w-full text-[12px] bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-500 font-medium"
        >
          {imputaciones.map(imp => (
            <option key={imp} value={imp}>{imp}</option>
          ))}
        </select>
      </td>
    </tr>
  );
}
