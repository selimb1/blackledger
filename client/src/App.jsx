import { useState } from 'react';
import { Header } from './components/Header';
import { DropZoneMultiple } from './components/DropZoneMultiple';
import { ComprobanteTable } from './components/ComprobanteTable';
import { ExportPanel } from './components/ExportPanel';
import { extraerComprobantes } from './services/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
  const [error, setError] = useState('');

  const handleArchivos = async (archivos) => {
    setError('');
    setProcesando(true);
    setProgreso({ actual: 0, total: archivos.length });

    // Agregar items en estado PROCESANDO para feedback inmediato
    const nuevos = archivos.map((f, i) => ({
      id: `temp-${Date.now()}-${i}`,
      nombre_archivo: f.name,
      estado: 'PROCESANDO',
      datos: null,
      habilitado: true,
      error: null,
    }));
    setItems(prev => [...prev, ...nuevos]);

    try {
      const resultado = await extraerComprobantes(archivos);

      // Reemplazar los items PROCESANDO con los resultados reales
      setItems(prev => {
        const sinProcesando = prev.filter(i => i.estado !== 'PROCESANDO');
        return [
          ...sinProcesando,
          ...resultado.resultados.map(r => ({ ...r, habilitado: true })),
        ];
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor');
      setItems(prev => prev.filter(i => i.estado !== 'PROCESANDO'));
    } finally {
      setProcesando(false);
      setProgreso({ actual: 0, total: 0 });
    }
  };

  const handleChange = (idx, updated) => {
    setItems(prev => prev.map((item, i) => i === idx ? updated : item));
  };

  const handleEliminar = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLimpiarTodo = () => {
    if (window.confirm('¿Eliminás todos los comprobantes de la sesión?')) {
      setItems([]);
    }
  };

  const cantExtraidos = items.filter(i => i.estado === 'EXTRAIDO').length;
  const cantErrores = items.filter(i => i.estado === 'ERROR').length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* Drop zone */}
        <DropZoneMultiple onArchivos={handleArchivos} procesando={procesando} />

        {/* Indicador de progreso */}
        {procesando && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <Loader2 size={16} className="text-blue-500 animate-spin" />
            <span className="text-sm text-gray-600">
              Gemini está procesando los comprobantes...
            </span>
          </div>
        )}

        {/* Error general */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Stats + acciones sobre los resultados */}
        {items.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                <strong className="text-gray-900">{items.length}</strong> comprobantes
              </span>
              {cantExtraidos > 0 && (
                <span className="text-green-600 font-medium">{cantExtraidos} OK</span>
              )}
              {cantErrores > 0 && (
                <span className="text-red-600 font-medium">{cantErrores} con error</span>
              )}
            </div>
            <button
              onClick={handleLimpiarTodo}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <RefreshCw size={12} />
              Limpiar todo
            </button>
          </div>
        )}

        {/* Tabla de comprobantes */}
        {items.length > 0 && (
          <ComprobanteTable
            items={items}
            onChange={handleChange}
            onEliminar={handleEliminar}
          />
        )}

        {/* Panel de exportación */}
        <ExportPanel comprobantes={items} />

      </main>
    </div>
  );
}
