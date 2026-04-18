# BlackLedger

Extrae datos de comprobantes fiscales con Gemini Vision y genera un .txt compatible con **Holistor IVA Registración** (Útiles → Importar → Datos de Otros Sistemas).

## Comprobantes soportados
- Facturas A, B y C
- Notas de débito y crédito (A y B)
- Tickets fiscales y tickets de caja
- Recibos

## Instalación

### Prerrequisitos
- Node.js 20+
- API Key de Google Gemini (obtener en https://aistudio.google.com)

### Backend
\`\`\`bash
cd server
npm install
cp .env.example .env
# Editá .env y colocá tu GEMINI_API_KEY
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

Abrí http://localhost:5173

## Configuración en Holistor — Diseño de Registro

La primera vez que importés, configurá el diseño de registro en Holistor así:

| Posición | Campo Holistor | Separador |
|----------|---------------|-----------|
| 1 | Nombre del comprobante | \\| |
| 2 | Tipo (letra) | \\| |
| 3 | Punto de venta | \\| |
| 4 | Número | \\| |
| 5 | Fecha | \\| |
| 6 | Condición fiscal | \\| |
| 7 | CUIT | \\| |
| 8 | Razón social | \\| |
| 9 | Tipo de movimiento | \\| |
| 10 | Neto gravado 21% | \\| |
| 11 | Neto gravado 10.5% | \\| |
| 12 | No gravado | \\| |
| 13 | Exento | \\| |
| 14 | IVA 21% | \\| |
| 15 | IVA 10.5% | \\| |
| 16 | Total | (fin) |

Guardá el diseño con el nombre "BLACKLEDGER" y seleccionalo en cada importación.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| GEMINI_API_KEY | API Key de Google Gemini (obligatoria) |
| PORT | Puerto del servidor (default: 3001) |
