export function StatusBadge({ estado, errores = [] }) {
  const configs = {
    PENDIENTE:  { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Pendiente' },
    PROCESANDO: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Procesando...' },
    EXTRAIDO:   { bg: 'bg-green-100', text: 'text-green-700', label: errores.length > 0 ? 'Revisar' : 'OK' },
    ERROR:      { bg: 'bg-red-100', text: 'text-red-700', label: 'Error' },
  };

  const cfg = configs[estado] || configs.PENDIENTE;
  const mostrarAdvertencia = estado === 'EXTRAIDO' && errores.length > 0;

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${mostrarAdvertencia ? 'bg-yellow-100 text-yellow-700' : `${cfg.bg} ${cfg.text}`}`}
      title={errores.join(' | ')}
    >
      {mostrarAdvertencia ? `⚠ ${errores.length} advertencia${errores.length > 1 ? 's' : ''}` : cfg.label}
    </span>
  );
}
