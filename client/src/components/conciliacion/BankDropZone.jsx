import { useDropzone } from 'react-dropzone';
import { Building2 } from 'lucide-react';

export function BankDropZone({ onArchivo, procesando }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: accepted => {
      if (accepted.length > 0) onArchivo(accepted[0]);
    },
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: procesando
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer bg-white
        ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'}
        ${procesando ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex justify-center mb-4 text-brand-600">
        <Building2 size={48} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Arrastrá el extracto bancario en PDF
      </h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto leading-relaxed">
        Banco Nación · Galicia · Santander · BBVA · Macro · ICBC · Brubank · Mercado Pago y más
      </p>
      <button 
        type="button"
        disabled={procesando}
        className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: 'var(--color-brand-600)' }}
      >
        Seleccionar archivo
      </button>
    </div>
  );
}
