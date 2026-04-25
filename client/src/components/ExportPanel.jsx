import { Download, Eye, EyeOff, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { generarTxtHolistor, previewTxt, nombreArchivo } from '../utils/holistorFormatter';
import { formatARS } from '../utils/formatters';

export function ExportPanel({ comprobantes, tipoLibro }) {
  const [showPreview, setShowPreview] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const habilitados = comprobantes.filter(c => c.estado === 'EXTRAIDO' && c.habilitado !== false);
  const totalMonto = habilitados.reduce((acc, c) => acc + (c.datos?.total || 0), 0);
  const contenidoTxt = generarTxtHolistor(comprobantes);
  const preview = previewTxt(comprobantes);

  const labelTipo = tipoLibro === 'VENTAS' ? 'IVA Ventas' : 'IVA Compras';
  const colorTipo = tipoLibro === 'VENTAS' ? 'var(--color-success-700)' : 'var(--color-brand-500)';
  const colorBorde = tipoLibro === 'VENTAS' ? 'var(--color-success-700)' : 'var(--color-brand-500)';

  const nombreArchivoCurrent = nombreArchivo(tipoLibro || 'COMPRAS');

  const handleDescargar = () => {
    const blob = new Blob([contenidoTxt], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, nombreArchivoCurrent);
  };

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(contenidoTxt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (habilitados.length === 0) return null;

  // Build book-specific instructions
  const instrucciones = tipoLibro === 'VENTAS'
    ? [
        'Módulo IVA Registración → Ventas → Útiles → Importar → Datos de Otros Sistemas.',
        <>Elegí el archivo: <strong style={{ color: 'var(--color-gray-900)' }}>{nombreArchivoCurrent}</strong></>,
        <>En "Diseño de Registro" seleccioná: <strong style={{ color: 'var(--color-gray-900)' }}>COMPRIX</strong> (separador pipe | · 16 columnas).</>,
        'Confirmá la importación.',
      ]
    : [
        'Módulo IVA Registración → Compras → Útiles → Importar → Datos de Otros Sistemas.',
        <>Elegí el archivo: <strong style={{ color: 'var(--color-gray-900)' }}>{nombreArchivoCurrent}</strong></>,
        <>En "Diseño de Registro" seleccioná: <strong style={{ color: 'var(--color-gray-900)' }}>COMPRIX</strong> (separador pipe | · 16 columnas).</>,
        'Confirmá la importación.',
      ];

  return (
    <div
      className="p-6 transition-all"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        borderLeft: `4px solid ${colorBorde}`,
      }}
    >

      {/* Título y Acciones */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-display font-bold mb-1" style={{ color: 'var(--color-gray-900)' }}>
            Exportar a Holistor —{' '}
            <span style={{ color: colorTipo }}>{labelTipo}</span>
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
            className="flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold transition-colors"
            style={{
              backgroundColor: tipoLibro === 'VENTAS' ? 'var(--color-success-700)' : 'var(--color-brand-500)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
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
            borderRadius: 'var(--radius-md)',
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
          Instrucciones de importación en Holistor
          {' '}
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: tipoLibro === 'VENTAS' ? 'var(--color-success-50)' : 'var(--color-brand-50)',
            color: colorTipo,
          }}>
            {labelTipo}
          </span>
        </p>
        <ul className="text-[13px] space-y-2 flex flex-col" style={{ color: 'var(--color-gray-700)' }}>
          {instrucciones.map((paso, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span
                className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold mt-0.5"
                style={{
                  backgroundColor: tipoLibro === 'VENTAS' ? 'var(--color-success-100)' : 'var(--color-brand-100)',
                  color: colorTipo,
                }}
              >
                {i + 1}
              </span>
              <span>{paso}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
