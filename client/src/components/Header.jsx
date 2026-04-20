export function Header() {
  return (
    <header 
      className="flex items-center justify-between px-6"
      style={{ 
        height: '56px',
        backgroundColor: 'var(--color-brand-900)', 
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="flex items-baseline gap-3">
        <div className="flex items-center gap-1.5">
          <span style={{ color: 'var(--color-success-500)', fontSize: '10px' }}>●</span>
          <h1 
            className="text-[22px] font-display font-extrabold tracking-tight text-white mb-0 mt-0 leading-none"
          >
            Comprix
          </h1>
        </div>
        <p 
          className="text-[12px] font-medium"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Comprobantes → Holistor
        </p>
      </div>

      <div 
        className="px-2 py-0.5 rounded text-[11px] font-bold"
        style={{ 
          backgroundColor: 'var(--color-brand-700)', 
          color: 'var(--color-brand-100)'
        }}
      >
        v1.0
      </div>
    </header>
  );
}
