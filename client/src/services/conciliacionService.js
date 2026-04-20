import { api } from './api';

export const conciliacionService = {
  async extraer(file) {
    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.onerror = () => rej(new Error('Error leyendo el archivo'));
      r.readAsDataURL(file);
    });
    const { data } = await api.post('/conciliacion/extraer', {
      base64, nombre: file.name, mimeType: file.type,
    });
    return data;
  },
};
