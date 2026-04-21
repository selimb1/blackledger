const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cuántos caracteres de texto del PDF enviamos por chunk
const CHARS_POR_CHUNK = 12000;
// Tokens máximos de OUTPUT por llamada (gpt-4o admite hasta 16384)
const MAX_TOKENS_OUTPUT = 16000;

const SISTEMA = 'Sos un asistente contable argentino experto en extractos bancarios. Respondés ÚNICAMENTE con un array JSON válido, sin markdown, sin bloques de código, sin texto adicional.';

function buildPrompt(textoPdf) {
  return `Analizá el siguiente texto de un extracto bancario y extraé TODAS las transacciones en orden cronológico.

REGLAS CRÍTICAS:
- Extraé CADA movimiento individual sin omitir ninguno
- Importes: negativos para débitos/egresos, positivos para créditos/ingresos
- Si hay un "Saldo Inicial", incluilo como primer registro
- El "saldo" es el saldo acumulado DESPUÉS de cada movimiento. Si no podés determinarlo usá null.
- Formato de fecha: DD/MM/YY (dos dígitos para el año)
- Separar "descripcion" (concepto principal) de "detalle" (referencia, número de operación, destinatario)
- tipo_movimiento: exactamente "Credito" o "Debito" (con mayúscula inicial, sin tilde)

Para "imputacion", asigná la cuenta contable más probable:
- Transferencias recibidas / cobros → "Deudores por Ventas"
- Transferencias realizadas / pagos a terceros → "Proveedores"
- Compras con tarjeta de débito → "Proveedores"
- Intereses acreditados → "Intereses cobrados"
- Comisiones y cargos bancarios → "Gastos bancarios"
- Impuestos (IIBB, débitos/créditos bancarios) → "Impuestos y tasas"
- Sueldos y salarios → "Remuneraciones"
- Servicios (luz, gas, telefonía) → "Gastos de servicios"
- Alquileres → "Gastos de alquiler"
- Extracciones de cajero → "Caja"
- Saldo inicial → "Disponibilidades"
- No identificados → "Otras cuentas"

Respondé ÚNICAMENTE con el array JSON. Sin markdown. Sin bloques de código. Sin texto antes o después:
[{"fecha":"DD/MM/YY","descripcion":"...","detalle":"...","importe":0.00,"saldo":0.00,"tipo_movimiento":"Credito","imputacion":"..."}]

--- EXTRACTO BANCARIO ---
${textoPdf}
--- FIN DEL EXTRACTO ---`;
}

/**
 * Extrae JSON de una respuesta que puede traer markdown u otros prefijos.
 * Además intenta recuperar JSON truncado por límite de tokens.
 */
function extraerJSON(texto) {
  // 1. Limpiar bloques de código markdown primero
  let limpio = texto
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // 2. Intentar parsear directo
  try { return JSON.parse(limpio); } catch (_) {}

  // 3. Extraer el primer [...]
  const matchArr = limpio.match(/\[[\s\S]*/);
  if (matchArr) {
    let candidato = matchArr[0];

    // Intentar parsear la porción del array
    try { return JSON.parse(candidato); } catch (_) {}

    // 4. JSON truncado: cerrar el array de emergencia
    //    Buscar el último objeto completo (termina en '}')
    const ultimoObjeto = candidato.lastIndexOf('}');
    if (ultimoObjeto !== -1) {
      const recuperado = candidato.substring(0, ultimoObjeto + 1) + ']';
      try {
        const parsed = JSON.parse(recuperado);
        console.warn(`[conciliacion] Recuperación de emergencia: JSON truncado, ${parsed.length} transacciones recuperadas.`);
        return parsed;
      } catch (_) {}
    }
  }

  // 5. Extraer primer {...} y envolverlo
  const matchObj = limpio.match(/\{[\s\S]*\}/);
  if (matchObj) {
    try { return [JSON.parse(matchObj[0])]; } catch (_) {}
  }

  throw new Error(
    `No se pudo parsear la respuesta de IA como JSON. Respuesta recibida (primeros 300 chars): ${texto.substring(0, 300)}`
  );
}

/**
 * Llama a la API de OpenAI para un chunk de texto y devuelve las transacciones.
 */
async function procesarChunk(textoPdf, chunkNum, totalChunks) {
  console.log(`[conciliacion] Procesando chunk ${chunkNum}/${totalChunks} (${textoPdf.length} chars)`);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: MAX_TOKENS_OUTPUT,
    temperature: 0,
    messages: [
      { role: 'system', content: SISTEMA },
      { role: 'user', content: buildPrompt(textoPdf) },
    ],
  });

  const finishReason = response.choices[0]?.finish_reason;
  const textoRespuesta = response.choices[0]?.message?.content ?? '';

  console.log(`[conciliacion] Chunk ${chunkNum}: finish_reason=${finishReason}, response_length=${textoRespuesta.length}`);
  if (finishReason === 'length') {
    console.warn(`[conciliacion] Chunk ${chunkNum}: respuesta truncada por límite de tokens. Intentando recuperar...`);
  }

  return extraerJSON(textoRespuesta);
}

async function extraerTransacciones(pdfBase64, nombreArchivo) {
  const inicio = Date.now();

  // 1. Parsear el PDF
  let textoPdf;
  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const parseResult = await pdfParse(pdfBuffer);
    textoPdf = parseResult.text;
    console.log(`[conciliacion] PDF "${nombreArchivo}" parseado: ${textoPdf?.length ?? 0} caracteres`);
  } catch (pdfError) {
    console.error('[conciliacion] Error al parsear PDF:', pdfError.message);
    throw new Error(`No se pudo leer el PDF: ${pdfError.message}. Verificá que sea un PDF bancario válido y no esté dañado.`);
  }

  if (!textoPdf || textoPdf.trim().length < 50) {
    throw new Error('El PDF no contiene texto extraíble. Puede ser un PDF escaneado o protegido. Intentá con otro archivo.');
  }

  // 2. Dividir en chunks si el texto es muy largo
  const chunks = [];
  for (let i = 0; i < textoPdf.length; i += CHARS_POR_CHUNK) {
    chunks.push(textoPdf.substring(i, i + CHARS_POR_CHUNK));
  }
  console.log(`[conciliacion] Texto dividido en ${chunks.length} chunk(s)`);

  // 3. Procesar cada chunk
  let todasLasTransacciones = [];
  for (let i = 0; i < chunks.length; i++) {
    try {
      const transaccionesChunk = await procesarChunk(chunks[i], i + 1, chunks.length);
      todasLasTransacciones.push(...transaccionesChunk);
    } catch (chunkError) {
      console.error(`[conciliacion] Error en chunk ${i + 1}: ${chunkError.message}`);
      // Si es el primer chunk, el error es crítico. Si no, continuar con lo que tenemos.
      if (i === 0) throw chunkError;
      console.warn(`[conciliacion] Continuando con los chunks anteriores...`);
      break;
    }
  }

  // 4. Normalizar y deduplicar (evitar duplicados en solapamiento de chunks)
  const transacciones = todasLasTransacciones.map(t => ({
    ...t,
    importe: parseFloat(t.importe) || 0,
    saldo: t.saldo !== null && t.saldo !== undefined ? parseFloat(t.saldo) : null,
    fuente: nombreArchivo,
  }));

  console.log(`[conciliacion] Total transacciones extraídas: ${transacciones.length} en ${Date.now() - inicio}ms`);

  return {
    transacciones,
    procesado_en_ms: Date.now() - inicio,
    cantidad: transacciones.length,
  };
}

module.exports = { extraerTransacciones };
