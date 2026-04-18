const express = require('express');
const router = express.Router();
const { extraerComprobante } = require('../services/geminiService');

// POST /api/extraer
// Body: { archivos: [{ nombre, base64, mimeType }] }
// Procesa en paralelo (máx 5 simultáneos para no saturar Gemini)
router.post('/extraer', async (req, res, next) => {
  try {
    const { archivos } = req.body;

    if (!archivos || !Array.isArray(archivos) || archivos.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un archivo' });
    }

    if (archivos.length > 50) {
      return res.status(400).json({ error: 'Máximo 50 comprobantes por lote' });
    }

    const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    for (const archivo of archivos) {
      if (!TIPOS_PERMITIDOS.includes(archivo.mimeType)) {
        return res.status(400).json({
          error: `Tipo no soportado: ${archivo.mimeType}. Usá JPG, PNG o PDF.`
        });
      }
    }

    // Procesar en lotes de 5 para no saturar la API de Gemini
    const resultados = [];
    const LOTE_SIZE = 5;

    for (let i = 0; i < archivos.length; i += LOTE_SIZE) {
      const lote = archivos.slice(i, i + LOTE_SIZE);

      const promesas = lote.map(async (archivo) => {
        try {
          const datos = await extraerComprobante(archivo.base64, archivo.mimeType);
          return {
            id: generarId(),
            nombre_archivo: archivo.nombre,
            estado: 'EXTRAIDO',
            datos,
            error: null,
          };
        } catch (error) {
          return {
            id: generarId(),
            nombre_archivo: archivo.nombre,
            estado: 'ERROR',
            datos: null,
            error: error.message,
          };
        }
      });

      const resultadosLote = await Promise.all(promesas);
      resultados.push(...resultadosLote);

      // Pausa entre lotes para respetar rate limits
      if (i + LOTE_SIZE < archivos.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    res.json({
      total: resultados.length,
      exitosos: resultados.filter(r => r.estado === 'EXTRAIDO').length,
      errores: resultados.filter(r => r.estado === 'ERROR').length,
      resultados,
    });

  } catch (error) {
    next(error);
  }
});

function generarId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

module.exports = router;
