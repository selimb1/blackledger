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
    <div className="bg-gray-900 rounded-xl p-5 text-white">

      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium">Listo para exportar</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {habilitados.length} comprobante{habilitados.length !== 1 ? 's' : ''} — Total: {formatARS(totalMonto)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPreview ? 'Ocultar' : 'Preview'}
          </button>
          <button
            onClick={handleCopiar}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
          >
            {copiado ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button
            onClick={handleDescargar}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-400 text-gray-900 rounded-lg transition-colors"
          >
            <Download size={13} />
            Descargar .txt
          </button>
        </div>
      </div>

      {/* Preview del TXT */}
      {showPreview && (
        <div className="mt-3 bg-gray-800 rounded-lg p-3 overflow-x-auto">
          <p className="text-xs text-gray-500 mb-2 font-mono">
            — preview (primeras {Math.min(habilitados.length, 5)} líneas) —
          </p>
          <pre className="text-xs text-green-400 font-mono whitespace-pre leading-relaxed">
            {preview || '(sin comprobantes habilitados)'}
          </pre>
          {habilitados.length > 5 && (
            <p className="text-xs text-gray-500 mt-2 font-mono">
              ... y {habilitados.length - 5} líneas más
            </p>
          )}
        </div>
      )}

      {/* Instrucciones de importación */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 font-medium mb-2">Cómo importar en Holistor:</p>
        <ol className="text-xs text-gray-500 space-y-0.5 list-decimal list-inside">
          <li>Módulo IVA Registración → Útiles → Importar → Datos de Otros Sistemas</li>
          <li>Seleccioná <strong className="text-gray-400">Compras</strong> o <strong className="text-gray-400">Ventas</strong> según corresponda</li>
          <li>Elegí el archivo .txt descargado</li>
          <li>En "Diseño de Registro" usá el separador <strong className="text-gray-400">pipe (|)</strong> con 16 columnas</li>
          <li>Mapeá cada columna al campo correspondiente de Holistor</li>
        </ol>
      </div>
    </div>
  );
}
