require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Validación temprana de la API key
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY || !OPENAI_KEY.startsWith('sk-')) {
  console.error('\n❌ ERROR: OPENAI_API_KEY inválida o no configurada.');
  console.error('   Pegá tu key en server/.env como: OPENAI_API_KEY=sk-proj-...\n');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));

// Rate limit: max 30 extracciones por minuto para controlar costo de Gemini
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/api', limiter);

app.use('/api', require('./routes/extraer'));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BlackLedger server en puerto ${PORT}`));
