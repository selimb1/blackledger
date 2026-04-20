export function StatusBadge({ estado, errores = [] }) {
  const mostrarAdvertencia = estado === 'EXTRAIDO' && errores.length > 0;

  const configs = {
    PENDIENTE:  { color: 'var(--color-gray-500)', label: 'Pendiente', dotClass: '' },
    PROCESANDO: { color: 'var(--color-brand-500)', label: 'Procesando', dotClass: 'animate-pulse' },
    EXTRAIDO:   { 
      color: mostrarAdvertencia ? 'var(--color-warning-600)' : 'var(--color-success-700)', 
      label: mostrarAdvertencia ? `${errores.length} advert.` : 'OK',
      dotClass: '' 
    },
    ERROR:      { color: 'var(--color-danger-600)', label: 'Error', dotClass: '' },
  };

  const cfg = configs[estado] || configs.PENDIENTE;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium mt-1 transition-colors"
      style={{ color: cfg.color }}
      title={errores.join(' | ')}
    >
      <span className={cfg.dotClass} style={{ fontSize: '8px' }}>{estado === 'ERROR' ? '✕' : '●'}</span>
      {cfg.label}
    </span>
  );
}
