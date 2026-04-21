const router = require('express').Router();
const { extraerTransacciones } = require('../services/conciliacionService');

router.post('/extraer', async (req, res) => {
  try {
    const { base64, nombre, mimeType } = req.body;

    if (!base64 || !nombre) {
      return res.status(400).json({ error: 'Se requiere base64 y nombre del archivo' });
    }
    if (mimeType !== 'application/pdf') {
      return res.status(400).json({ error: 'Solo se aceptan archivos PDF' });
    }

    const tamanoMB = (base64.length * 0.75) / (1024 * 1024);
    if (tamanoMB > 20) {
      return res.status(400).json({ error: 'El PDF no puede superar los 20MB' });
    }

    const resultado = await extraerTransacciones(base64, nombre);
    res.json(resultado);
  } catch (error) {
    // Log completo del error real para debug en Render
    console.error(`[conciliacion/extraer] ERROR: ${error.name}: ${error.message}`);
    if (error.stack) console.error(error.stack);

    // Devolver el mensaje real del error (no el genérico)
    return res.status(422).json({
      error: error.message || 'No se pudo procesar el extracto bancario.',
    });
  }
});

module.exports = router;
