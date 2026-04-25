import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

const TIPOS_ACEPTADOS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

const TIPOS_LIBRO = [
  {
    id: 'COMPRAS',
    label: 'IVA Compras',
    descripcion: 'Facturas que recibí de proveedores',
    icono: '📥',
    color: 'var(--color-brand-500)',
    colorFondo: 'var(--color-brand-50)',
    colorBorde: 'var(--color-brand-200)',
  },
  {
    id: 'VENTAS',
    label: 'IVA Ventas',
    descripcion: 'Facturas que emití a mis clientes',
    icono: '📤',
    color: 'var(--color-success-700)',
    colorFondo: 'var(--color-success-50)',
    colorBorde: 'var(--color-success-100)',
  },
];

export function DropZoneMultiple({ onArchivos, procesando, tipoLibro, onTipoLibro }) {
  const onDrop = useCallback((aceptados) => {
    if (aceptados.length > 0) onArchivos(aceptados);
  }, [onArchivos]);

  const dropzoneDisabled = procesando || !tipoLibro;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: TIPOS_ACEPTADOS,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: dropzoneDisabled,
    noClick: false,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Selector de tipo de libro */}
      <div>
        <p style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--color-gray-700)',
          marginBottom: '10px',
        }}>
          ¿Qué tipo de comprobantes vas a subir?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {TIPOS_LIBRO.map(tipo => (
            <button
              key={tipo.id}
              onClick={() => onTipoLibro(tipo.id)}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${tipoLibro === tipo.id ? tipo.colorBorde : 'var(--color-gray-300)'}`,
                background: tipoLibro === tipo.id ? tipo.colorFondo : 'var(--color-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
                outline: 'none',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{tipo.icono}</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: tipoLibro === tipo.id ? tipo.color : 'var(--color-gray-800)',
              }}>
                {tipo.label}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                {tipo.descripcion}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DropZone — deshabilitado si no hay tipo seleccionado */}
      <div style={{ position: 'relative', opacity: tipoLibro ? 1 : 0.4, pointerEvents: tipoLibro ? 'auto' : 'none' }}>
        <div
          {...getRootProps()}
          className={`
            relative p-10 text-center cursor-pointer select-none transition-all duration-150
            ${dropzoneDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            backgroundColor: isDragActive ? 'var(--color-brand-50)' : 'var(--color-surface)',
            border: isDragActive ? '2px dashed var(--color-brand-500)' : '2px dashed var(--color-gray-300)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <input {...getInputProps()} />
          <div
            className="mx-auto mb-4 flex items-center justify-center transition-transform duration-150"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-50)',
              transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <Upload size={24} style={{ color: 'var(--color-brand-500)' }} />
          </div>

          <p
            className="text-[16px] font-medium mb-1"
            style={{ color: 'var(--color-gray-900)' }}
          >
            {isDragActive ? 'Soltá los archivos acá...' : 'Arrastrá tus comprobantes'}
          </p>

          <p className="text-[13px] mb-4" style={{ color: 'var(--color-gray-500)' }}>
            Facturas · Tickets · Notas de débito y crédito
          </p>

          <div className="flex justify-center gap-2">
            {['JPG', 'PNG', 'PDF'].map(fmt => (
              <span
                key={fmt}
                className="px-2 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: 'var(--color-gray-100)', color: 'var(--color-gray-600)', borderRadius: 'var(--radius-sm)' }}
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* Overlay message when no type selected */}
        {!tipoLibro && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-gray-400)',
              fontWeight: '500',
              cursor: 'not-allowed',
            }}>
              Primero elegí el tipo de comprobantes ↑
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
