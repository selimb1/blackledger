require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Validación temprana de la API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('\n⚠️ ADVERTENCIA: GEMINI_API_KEY no configurada.');
  console.error('   El Módulo 1 (Comprobantes) fallará, pero podrás probar Conciliación Bancaria.\n');
  // Eliminamos el process.exit(1) para que al menos levante el server.
}

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Rate limit: max 30 extracciones por minuto para controlar costo de Gemini
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/api', limiter);

app.use('/api', require('./routes/extraer'));
app.use('/api/conciliacion', require('./routes/conciliacion'));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Comprix server en puerto ${PORT}`));
