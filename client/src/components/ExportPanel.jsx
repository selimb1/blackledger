import { Download, Eye, EyeOff, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { generarTxtHolistor, previewTxt, nombreArchivo } from '../utils/holistorFormatter';
import { formatARS } from '../utils/formatters';

export function ExportPanel({ comprobantes }) {
  const [showPreview, setShowPreview] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const habilitados = comprobantes.filter(c => c.estado === 'EXTRAIDO' && c.habilitado !== false);
  const totalMonto = habilitados.reduce((acc, c) => acc + (c.datos?.total || 0), 0);
  const contenidoTxt = generarTxtHolistor(comprobantes);
  const preview = previewTxt(comprobantes);

  const handleDescargar = () => {
    const blob = new Blob([contenidoTxt], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, nombreArchivo());
  };

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(contenidoTxt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (habilitados.length === 0) return null;

  return (
    <div 
      className="p-6 transition-all" 
      style={{ 
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        borderLeft: '4px solid var(--color-brand-500)'
      }}
    >

      {/* Título y Acciones */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-display font-bold mb-1" style={{ color: 'var(--color-gray-900)' }}>
            Exportar a Holistor
          </h2>
          <p className="text-[14px] font-mono-custom font-medium" style={{ color: 'var(--color-gray-700)' }}>
            {habilitados.length} comprobantes · {formatARS(totalMonto)}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-[13px] font-medium transition-colors hover:!text-[var(--color-brand-500)]"
              style={{ color: 'var(--color-gray-600)' }}
            >
              {showPreview ? 'Ocultar preview' : 'Preview'}
            </button>
            
            <span style={{ color: 'var(--color-gray-300)' }}>|</span>
            
            <button
              onClick={handleCopiar}
              className="text-[13px] font-medium transition-colors hover:!text-[var(--color-brand-500)]"
              style={{ color: copiado ? 'var(--color-success-700)' : 'var(--color-gray-600)' }}
            >
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <button
            onClick={handleDescargar}
            className="flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold transition-colors hover:!bg-[var(--color-brand-700)]"
            style={{ 
              backgroundColor: 'var(--color-brand-500)', 
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Download size={16} />
            Descargar .txt
          </button>
        </div>
      </div>

      {/* Preview del TXT simulando Terminal */}
      {showPreview && (
        <div 
          className="mb-8 p-[16px]"
          style={{ 
            backgroundColor: 'var(--color-gray-900)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <pre className="text-[12px] font-mono-custom whitespace-pre" style={{ color: 'var(--color-success-500)', lineHeight: '1.6' }}>
            {preview || '(Sin comprobantes habilitados)'}
          </pre>
        </div>
      )}

      {/* Instrucciones de importación */}
      <div className="pt-5 mt-2 border-t" style={{ borderColor: 'var(--color-gray-300)' }}>
        <p className="text-[13px] font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-gray-900)' }}>
          Instrucciones de importación
        </p>
        <ul className="text-[13px] space-y-2 flex flex-col" style={{ color: 'var(--color-gray-700)' }}>
          <li className="flex gap-2.5 items-start">
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold mt-0.5" style={{ backgroundColor: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}>1</span>
            <span>Módulo IVA Registración → Útiles → Importar → Datos de Otros Sistemas.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold mt-0.5" style={{ backgroundColor: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}>2</span>
            <span>Seleccioná <strong style={{ color: 'var(--color-gray-900)' }}>Compras</strong> o <strong style={{ color: 'var(--color-gray-900)' }}>Ventas</strong> según el tipo de comprobantes.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold mt-0.5" style={{ backgroundColor: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}>3</span>
            <span>Elegí el archivo descargado y usá <strong style={{ color: 'var(--color-gray-900)' }}>pipe (|)</strong> de long. variable con 16 columnas en Diseño de Registro.</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
