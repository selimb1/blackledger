import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus } from 'lucide-react';

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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
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
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all select-none
        ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
        ${procesando ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-3 text-gray-400" size={36} />
      <p className="text-base font-medium text-gray-700">
        {isDragActive ? 'Soltá los archivos acá' : 'Arrastrá tus comprobantes'}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Facturas, tickets, notas de débito y crédito — JPG, PNG, PDF hasta 10MB
      </p>
      <p className="text-xs text-gray-300 mt-3">Podés subir múltiples archivos a la vez</p>
    </div>
  );
}
