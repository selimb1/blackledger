require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Validación temprana de la API key de OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn('\n⚠️ ADVERTENCIA: OPENAI_API_KEY no configurada. Los módulos de IA fallarán.\n');
}

const app = express();

// CORS abierto: acepta cualquier origen (app de uso interno)
app.use(cors());

app.use(express.json({ limit: '50mb' }));

// Rate limit: max 30 extracciones por minuto para controlar costo de APIs de IA
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/api', limiter);

// Health check — confirmá que el backend está vivo
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openai: !!OPENAI_API_KEY,
  });
});

app.use('/api', require('./routes/extraer'));
app.use('/api/conciliacion', require('./routes/conciliacion'));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Comprix server corriendo en puerto ${PORT}`));
