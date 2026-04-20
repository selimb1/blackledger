const router = require('express').Router();
const { extraerTransacciones } = require('../services/conciliacionService');

router.post('/extraer', async (req, res, next) => {
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
    if (error instanceof SyntaxError) {
      return res.status(422).json({
        error: 'No se pudo interpretar el extracto. Verificá que sea un PDF bancario válido.',
      });
    }
    next(error);
  }
});

module.exports = router;
