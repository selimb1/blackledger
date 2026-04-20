import { useState } from 'react';
import { Header } from '../components/Header';
import { DropZoneMultiple } from '../components/DropZoneMultiple';
import { ComprobanteTable } from '../components/ComprobanteTable';
import { ExportPanel } from '../components/ExportPanel';
import { extraerComprobantes } from '../services/api';

export function Comprobantes() {
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
    <div className="min-h-screen flex flex-col relative">
      {/* Indicador de proceso top absoluto, animacion shimmer */}
      {procesando && (
        <div className="absolute top-0 left-0 right-0 h-[3px] z-50 overflow-hidden" style={{ backgroundColor: 'var(--color-brand-100)' }}>
          <div className="h-full animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundColor: 'var(--color-brand-500)', width: '40%' }} />
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}} />

      <Header />

      <main className="flex-1 p-[24px] max-w-[1100px] w-full mx-auto space-y-6">

        {/* Drop zone */}
        <DropZoneMultiple onArchivos={handleArchivos} procesando={procesando} />

        {/* Error general */}
        {error && (
          <div 
            className="text-sm px-4 py-3" 
            style={{ 
              backgroundColor: 'var(--color-danger-100)', 
              color: 'var(--color-danger-600)',
              borderLeft: '4px solid var(--color-danger-600)'
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Stats + acciones sobre los resultados (card style) */}
          {items.length > 0 && (
            <div 
              className="flex items-center justify-between px-5 py-3" 
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="flex items-center gap-4 text-[14px]">
                <span style={{ color: 'var(--color-gray-900)' }} className="font-semibold">
                  {items.length} comprobantes procesados
                </span>
                
                {cantExtraidos > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: 'var(--color-success-100)', color: 'var(--color-success-700)' }}>
                    {cantExtraidos} OK
                  </span>
                )}
                
                {cantErrores > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: 'var(--color-warning-100)', color: 'var(--color-warning-600)' }}>
                    {cantErrores} con atención
                  </span>
                )}
              </div>
              
              <button
                onClick={handleLimpiarTodo}
                className="text-[13px] font-medium transition-colors hover:underline"
                style={{ color: 'var(--color-danger-600)' }}
              >
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
        </div>

      </main>
    </div>
  );
}
