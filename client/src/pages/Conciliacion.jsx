import { useState } from 'react';
import { Header } from '../components/Header';
import { BankDropZone } from '../components/conciliacion/BankDropZone';
import { TransaccionTable } from '../components/conciliacion/TransaccionTable';
import { ExcelExportPanel } from '../components/conciliacion/ExcelExportPanel';
import { conciliacionService } from '../services/conciliacionService';

export function Conciliacion() {
  const [transacciones, setTransacciones] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');

  const handleArchivo = async (file) => {
    setProcesando(true);
    setError(null);
    setNombreArchivo(file.name);
    try {
      const data = await conciliacionService.extraer(file);
      setTransacciones(data.transacciones);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ocurrió un error al procesar el archivo.');
    } finally {
      setProcesando(false);
    }
  };

  const handleChange = (index, updatedItem) => {
    setTransacciones(prev => prev.map((t, i) => i === index ? updatedItem : t));
  };

  const handleLimpiar = () => {
    if (window.confirm('¿Seguro que querés limpiar los movimientos?')) {
      setTransacciones([]);
      setNombreArchivo('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-gray-50">
      {procesando && (
        <div className="absolute top-0 left-0 right-0 h-[3px] z-50 overflow-hidden" style={{ backgroundColor: 'var(--color-brand-100)' }}>
          <div className="h-full animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundColor: 'var(--color-brand-500)', width: '40%' }} />
        </div>
      )}
      
      <Header />

      <main className="flex-1 p-[24px] max-w-[1100px] w-full mx-auto space-y-6">
        
        {procesando && (
          <div className="bg-brand-50 border border-brand-200 text-brand-700 px-4 py-3 rounded text-sm text-center font-medium animate-pulse">
            ⟳ Analizando el extracto con IA... esto puede tomar hasta 30 segundos para extractos largos
          </div>
        )}

        {error && (
          <div className="bg-danger-100 border-l-4 border-danger-600 text-danger-700 px-4 py-3 rounded text-sm font-medium">
            Error: {error}
          </div>
        )}

        {transacciones.length === 0 && !procesando && !error && (
          <BankDropZone onArchivo={handleArchivo} procesando={procesando} />
        )}

        {transacciones.length > 0 && (
          <>
            <TransaccionTable 
              transacciones={transacciones} 
              onChange={handleChange} 
            />
            <ExcelExportPanel 
              transacciones={transacciones} 
              nombreArchivo={nombreArchivo} 
              onLimpiar={handleLimpiar} 
            />
          </>
        )}
      </main>
    </div>
  );
}
