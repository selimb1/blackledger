import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 120000, // 2 minutos para lotes grandes
});

export async function extraerComprobantes(archivos) {
  // Convierte los File objects a base64
  const archivosProcesados = await Promise.all(
    archivos.map(async (file) => ({
      nombre: file.name,
      mimeType: file.type,
      base64: await fileToBase64(file),
    }))
  );

  const { data } = await api.post('/extraer', { archivos: archivosProcesados });
  return data;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsDataURL(file);
  });
}
