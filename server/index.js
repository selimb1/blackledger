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

// CORS dinámico: acepta localhost en dev y cualquier URL de Vercel/Render en producción
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin origen (ej: curl, Postman) y los orígenes de la lista
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // En producción también acepta cualquier subdominio de vercel.app y onrender.com
    if (
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    console.warn(`CORS bloqueó el origen: ${origin}`);
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));

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
