import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

const TIPOS_ACEPTADOS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

export function DropZoneMultiple({ onArchivos, procesando }) {
  const onDrop = useCallback((aceptados) => {
    if (aceptados.length > 0) onArchivos(aceptados);
  }, [onArchivos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: TIPOS_ACEPTADOS,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: procesando,
    noClick: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative p-10 text-center cursor-pointer select-none transition-all duration-150
        ${procesando ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        backgroundColor: isDragActive ? 'var(--color-brand-50)' : 'var(--color-surface)',
        border: isDragActive ? '2px dashed var(--color-brand-500)' : '2px dashed var(--color-gray-300)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
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
          transform: isDragActive ? 'scale(1.1)' : 'scale(1)'
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
  );
}
